const { remote } = require('webdriverio');
const DeviceManager = require('../../lib/device-manager');
const MockoonManager = require('../../lib/MockoonManager');
const config = require('../../config/test.config');
const AllureReporter = require('./StandaloneAllureReporter');
const VideoRecorder = require('./VideoRecorder');
const fs = require('fs');
const path = require('path');

/**
 * TestBase - Base class for all tests
 *
 * Provides:
 * - Driver initialization
 * - Screenshot on failure
 * - Video recording
 * - Device management
 * - Allure reporting integration
 * - Common test utilities
 */
class TestBase {
  constructor() {
    this.driver = null;
    this.device = null;
    this.deviceManager = new DeviceManager();
    this.mockoonManager = new MockoonManager();
    this.currentMockId = null;
    this.testName = '';
    this.allure = AllureReporter;
    this.videoRecorder = null;
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

    // Check if it's a cloud device
    const isCloudDevice = this.deviceManager.isCloudDeviceId(deviceNameOrId);

    // Get device (local or cloud)
    this.device = isCloudDevice
      ? this.deviceManager.getDeviceUnified(deviceNameOrId)
      : this.deviceManager.getDevice(deviceNameOrId);

    if (!this.device) {
      console.error(`❌ Device '${deviceNameOrId}' not found`);
      console.log('\n💡 Available devices:');
      this.deviceManager.printDevices();
      throw new Error(`Device '${deviceNameOrId}' not found`);
    }

    if (isCloudDevice) {
      console.log(`✅ Cloud device: ${deviceNameOrId}`);
      console.log(`   Provider: ${this.device.provider}`);
      console.log(`   Type: cloud\n`);
    } else {
      console.log(`✅ Device found: ${this.device.friendlyName}`);
      console.log(`   Platform: ${this.device.platform}`);
      console.log(`   Type: ${this.device.type}`);
      console.log(`   Device ID: ${this.device.deviceId}\n`);
    }

    // Get capabilities (supports both local and cloud)
    // Extract platform-specific config (only android or ios, not both)
    // Handle both nested format {android: {...}, ios: {...}} and direct format {...}
    let platformConfig;
    if (appConfig.android || appConfig.ios) {
      // Nested format - extract platform-specific config
      platformConfig = this.device.platform === 'android' ? appConfig.android : appConfig.ios;
    } else {
      // Direct format - already platform-specific
      platformConfig = appConfig;
    }
    const capabilities = await this.deviceManager.getCapabilitiesUnified(deviceNameOrId, platformConfig);
    console.log('🔧 Capabilities:', JSON.stringify(capabilities, null, 2), '\n');

    // Get hub URL (local Appium or cloud provider hub)
    const hubUrl = this.deviceManager.getHubUrl(deviceNameOrId);
    console.log(`🌐 Hub URL: ${hubUrl}\n`);

    // Parse hub URL
    const url = new URL(hubUrl);

    // Create driver
    this.driver = await remote({
      protocol: url.protocol.replace(':', ''),
      hostname: url.hostname,
      port: url.port ? parseInt(url.port, 10) : (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
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
   * Execute test with automatic screenshot and video on failure
   * @param {Function} testFunction - Test function to execute
   * @returns {Promise<void>}
   */
  async executeTest(testFunction) {
    let testPassed = false;

    try {
      // Start video recording if enabled OR if recording on failure
      if ((config.videos.enabled || config.videos.onFailure) && this.videoRecorder) {
        await this.videoRecorder.startRecording();
      }

      await testFunction();
      testPassed = true;
      console.log('✅ Test passed successfully');
    } catch (error) {
      console.error('❌ Test failed:', error.message);

      // Take screenshot on failure if enabled
      if (config.screenshots.onFailure && this.driver) {
        console.log('📸 Taking screenshot of failure...');
        const screenshotPath = await this.takeScreenshot('FAILURE');

        // Attach to Allure report
        if (screenshotPath) {
          this.allure.attachScreenshot('Failure Screenshot', screenshotPath);
        }
      }

      throw error;
    } finally {
      // Stop video recording
      if (this.videoRecorder && this.videoRecorder.isCurrentlyRecording()) {
        const shouldSaveVideo = config.videos.enabled ||
                               (config.videos.onFailure && !testPassed);

        if (shouldSaveVideo) {
          console.log('🎥 Stopping video recording...');
          const videoPath = await this.videoRecorder.stopRecording(
            testPassed ? 'SUCCESS' : 'FAILURE'
          );

          if (videoPath) {
            console.log(`📹 Video saved: ${videoPath}`);

            // Attach to Allure report if test failed
            if (!testPassed) {
              this.allure.attachVideo('Test Execution Video', videoPath);
            }
          }
        } else {
          // Discard recording if not needed
          await this.videoRecorder.stopRecording();
        }
      }
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
    let testPassed = false;
    let testError = null;
    const startTime = Date.now();

    // Start Allure test
    this.allure.startTest(testName, `${testName} on ${deviceNameOrId}`);

    try {
      // Start Mockoon server if mocking is enabled
      if (config.mocking && config.mocking.enabled) {
        console.log('🎭 Starting Mockoon mock server...');
        this.currentMockId = await this.mockoonManager.startMock(
          config.mocking.mockFile,
          {
            port: config.mocking.port,
            proxyUrl: config.mocking.proxyUrl,
            verbose: config.mocking.verbose || false
          }
        );
        console.log('');
      }

      await this.initializeDriver(deviceNameOrId, appConfig, testName);

      // Add device info to Allure
      if (this.device) {
        this.allure.addDeviceInfo(this.device);
      }

      // Initialize video recorder after driver is ready
      if ((config.videos.enabled || config.videos.onFailure) && this.driver && this.device) {
        this.videoRecorder = new VideoRecorder(
          this.driver,
          this.device.platform,
          testName
        );
        console.log('🎥 Video recorder initialized\n');
      }

      await this.executeTest(testFunction);
      testPassed = true;
      return true;
    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
      testError = error;
      throw error;
    } finally {
      await this.cleanup();

      // Save Mockoon transaction logs on failure
      if (!testPassed && this.currentMockId && config.mocking && config.mocking.saveLogsOnFailure) {
        const duration = Date.now() - startTime;
        await this.mockoonManager.saveLogsOnFailure(this.currentMockId, {
          name: testName,
          deviceId: deviceNameOrId,
          error: testError?.message,
          duration
        });
      }

      // Stop Mockoon server
      if (this.currentMockId) {
        await this.mockoonManager.stopMock(this.currentMockId);
        this.currentMockId = null;
      }

      // End Allure test with appropriate status
      if (testPassed) {
        this.allure.endTest('passed');
      } else {
        this.allure.endTest('failed', testError?.message, testError?.stack);
      }

      // Cleanup old videos
      if (config.videos.enabled || config.videos.onFailure) {
        VideoRecorder.cleanupOldVideos(config.videos.maxVideos);
      }
    }
  }
}

module.exports = TestBase;
