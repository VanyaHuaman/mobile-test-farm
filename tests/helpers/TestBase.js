const { remote } = require('webdriverio');
const DeviceManager = require('../../lib/device-manager');
const config = require('../../config/test.config');
const fs = require('fs');
const path = require('path');

/**
 * TestBase - Base class for all tests
 *
 * Provides:
 * - Driver initialization
 * - Screenshot on failure
 * - Device management
 * - Common test utilities
 */
class TestBase {
  constructor() {
    this.driver = null;
    this.device = null;
    this.deviceManager = new DeviceManager();
    this.testName = '';
  }

  /**
   * Initialize the test driver
   * @param {string} deviceNameOrId - Device name or ID
   * @param {Object} appConfig - App configuration
   * @param {string} testName - Test name for screenshots
   */
  async initializeDriver(deviceNameOrId, appConfig, testName = 'test') {
    this.testName = testName;

    console.log('🚀 Initializing test driver...');
    console.log(`📱 Target device: ${deviceNameOrId}\n`);

    // Get device
    this.device = this.deviceManager.getDevice(deviceNameOrId);
    if (!this.device) {
      console.error(`❌ Device '${deviceNameOrId}' not found in registry`);
      console.log('\n💡 Available devices:');
      this.deviceManager.printDevices();
      throw new Error(`Device '${deviceNameOrId}' not found`);
    }

    console.log(`✅ Device found: ${this.device.friendlyName}`);
    console.log(`   Platform: ${this.device.platform}`);
    console.log(`   Type: ${this.device.type}`);
    console.log(`   Device ID: ${this.device.deviceId}\n`);

    // Get capabilities
    const capabilities = this.deviceManager.getCapabilities(deviceNameOrId, appConfig);
    console.log('🔧 Capabilities:', JSON.stringify(capabilities, null, 2), '\n');

    // Create driver
    this.driver = await remote({
      hostname: config.appium.host,
      port: config.appium.port,
      path: config.appium.path,
      capabilities,
    });

    // Set implicit timeout
    await this.driver.setTimeout({ implicit: config.timeouts.implicit });

    console.log('✅ Driver initialized successfully\n');
    return this.driver;
  }

  /**
   * Take screenshot
   * @param {string} name - Screenshot name
   * @returns {Promise<string>} - Path to screenshot
   */
  async takeScreenshot(name) {
    if (!config.screenshots.enabled) {
      return null;
    }

    try {
      // Ensure screenshots directory exists
      const screenshotDir = config.screenshots.path;
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const platform = this.device ? this.device.platform : 'unknown';
      const filename = `${this.testName}-${name}-${platform}-${timestamp}.png`;
      const screenshotPath = path.join(screenshotDir, filename);

      await this.driver.saveScreenshot(screenshotPath);
      console.log(`📸 Screenshot saved: ${screenshotPath}`);
      return screenshotPath;
    } catch (error) {
      console.error(`❌ Failed to take screenshot: ${error.message}`);
      return null;
    }
  }

  /**
   * Execute test with automatic screenshot on failure
   * @param {Function} testFunction - Test function to execute
   * @returns {Promise<void>}
   */
  async executeTest(testFunction) {
    try {
      await testFunction();
      console.log('✅ Test passed successfully');
    } catch (error) {
      console.error('❌ Test failed:', error.message);

      // Take screenshot on failure if enabled
      if (config.screenshots.onFailure && this.driver) {
        console.log('📸 Taking screenshot of failure...');
        await this.takeScreenshot('FAILURE');
      }

      throw error;
    }
  }

  /**
   * Cleanup and close driver
   */
  async cleanup() {
    if (this.driver) {
      try {
        await this.driver.deleteSession();
        console.log('🏁 Driver session ended');
      } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
      }
      this.driver = null;
    }
  }

  /**
   * Get platform
   * @returns {string} - Platform name (ios/android)
   */
  getPlatform() {
    return this.device ? this.device.platform : null;
  }

  /**
   * Get device info
   * @returns {Object} - Device object
   */
  getDevice() {
    return this.device;
  }

  /**
   * Run complete test lifecycle
   * @param {string} deviceNameOrId - Device name or ID
   * @param {Object} appConfig - App configuration
   * @param {Function} testFunction - Test function
   * @param {string} testName - Test name
   */
  async runTest(deviceNameOrId, appConfig, testFunction, testName = 'test') {
    try {
      await this.initializeDriver(deviceNameOrId, appConfig, testName);
      await this.executeTest(testFunction);
      return true;
    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

module.exports = TestBase;
