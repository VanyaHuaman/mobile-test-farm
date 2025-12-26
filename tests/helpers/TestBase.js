const { remote } = require('webdriverio');
const { execSync } = require('child_process');
const DeviceManager = require('../../lib/device-manager');
const MockoonManager = require('../../lib/MockoonManager');
const MitmProxyManager = require('../../lib/MitmProxyManager');
const config = require('../../config/test.config');
const AllureReporter = require('./StandaloneAllureReporter');
const VideoRecorder = require('./VideoRecorder');
const fs = require('fs');
const path = require('path');

// Shared instances across all tests to persist proxies
const sharedMockoonManager = new MockoonManager();
const sharedMitmProxyManager = new MitmProxyManager();

/**
 * TestBase - Base class for all tests
 *
 * Provides:
 * - Driver initialization
 * - Screenshot on failure
 * - Video recording
 * - Device management
 * - Allure reporting integration
 * - MITM proxy for transparent API mocking
 * - Common test utilities
 */
class TestBase {
  constructor() {
    this.driver = null;
    this.device = null;
    this.deviceManager = new DeviceManager();
    // Use shared instances to persist across tests
    this.mockoonManager = sharedMockoonManager;
    this.mitmProxyManager = sharedMitmProxyManager;
    this.currentMockId = null;
    this.currentProxyId = null;
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
   * Configure HTTP proxy on device
   * @param {string} proxyHost - Proxy host (e.g., 'localhost')
   * @param {number} proxyPort - Proxy port (e.g., 8888)
   */
  async setDeviceProxy(proxyHost, proxyPort) {
    if (!this.device) {
      console.warn('⚠️  No device available for proxy configuration');
      return;
    }

    const platform = this.device.platform;
    const deviceId = this.device.deviceId;
    const deviceType = this.device.type;

    // Android emulators need special IP to access host machine
    let effectiveProxyHost = proxyHost;
    if (platform === 'android' && deviceType === 'emulator' && proxyHost === 'localhost') {
      effectiveProxyHost = '10.0.2.2';
      console.log(`🔀 Configuring proxy on ${platform} ${deviceType}...`);
      console.log(`   Translating localhost to ${effectiveProxyHost} for emulator`);
      console.log(`   Proxy: ${effectiveProxyHost}:${proxyPort}`);
    } else {
      console.log(`🔀 Configuring proxy on ${platform} device...`);
      console.log(`   Proxy: ${effectiveProxyHost}:${proxyPort}`);
    }

    try {
      if (platform === 'android') {
        // Set HTTP proxy on Android emulator/device
        execSync(`adb -s ${deviceId} shell settings put global http_proxy ${effectiveProxyHost}:${proxyPort}`, { stdio: 'pipe' });
        console.log(`✅ Android proxy configured`);
      } else if (platform === 'ios') {
        // iOS simulator proxy configuration
        // Note: iOS simulators inherit proxy settings from macOS system preferences
        // Or we can use simctl to configure WiFi proxy (more complex)
        console.log(`⚠️  iOS proxy configuration: Simulators use macOS system proxy`);
        console.log(`   Set macOS proxy to ${effectiveProxyHost}:${proxyPort} if needed`);
      }
    } catch (error) {
      console.error(`❌ Failed to set proxy: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clear HTTP proxy on device
   */
  async clearDeviceProxy() {
    if (!this.device) {
      return;
    }

    const platform = this.device.platform;
    const deviceId = this.device.deviceId;

    console.log(`🔀 Clearing proxy on ${platform} device...`);

    try {
      if (platform === 'android') {
        // Clear HTTP proxy on Android emulator
        execSync(`adb -s ${deviceId} shell settings put global http_proxy :0`, { stdio: 'pipe' });
        console.log(`✅ Android proxy cleared`);
      } else if (platform === 'ios') {
        console.log(`⚠️  iOS proxy: Clear macOS system proxy if it was set`);
      }
    } catch (error) {
      console.error(`❌ Failed to clear proxy: ${error.message}`);
    }
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
            mockId: 'test-mockoon-server',  // Fixed ID to reuse across tests
            port: config.mocking.port,
            proxyUrl: config.mocking.proxyUrl,
            verbose: config.mocking.verbose || false
          }
        );
        console.log('');

        // Start MITM proxy to transparently redirect traffic to Mockoon
        // Use a consistent proxy ID so it can be reused across tests
        console.log('🔀 Starting MITM proxy...');
        this.currentProxyId = await this.mitmProxyManager.startProxy({
          proxyId: 'test-mitm-proxy',  // Fixed ID to reuse across tests
          mockoonPort: config.mocking.port || 3001,
          targetDomains: ['jsonplaceholder.typicode.com'],
          verbose: true  // Enable verbose logging to debug proxy issues
        });
        console.log('');
      }

      await this.initializeDriver(deviceNameOrId, appConfig, testName);

      // Configure device proxy AFTER app has started but BEFORE any API calls
      // Only set if mocking is enabled (proxy will persist across tests)
      if (this.currentProxyId) {
        const proxyPort = this.mitmProxyManager.getPort(this.currentProxyId);

        // Only configure proxy for Android (iOS simulators use macOS system proxy)
        if (this.device.platform === 'android') {
          // Check if proxy is already set to avoid unnecessary reconfiguration
          const { execSync } = require('child_process');
          try {
            const currentProxy = execSync(`adb -s ${this.device.deviceId} shell settings get global http_proxy`, { encoding: 'utf8' }).trim();
            const expectedProxy = this.device.type === 'emulator'
              ? `10.0.2.2:${proxyPort}`
              : `localhost:${proxyPort}`;

            if (currentProxy !== expectedProxy) {
              await this.setDeviceProxy('localhost', proxyPort);
              console.log('');
            } else {
              console.log(`✅ Device proxy already configured: ${expectedProxy}\n`);
            }
          } catch (error) {
            console.error(`⚠️  Failed to check proxy status: ${error.message}`);
            await this.setDeviceProxy('localhost', proxyPort);
            console.log('');
          }
        } else if (this.device.platform === 'ios') {
          console.log(`⚠️  iOS proxy configuration: Simulators use macOS system proxy`);
          console.log(`   Set macOS proxy to localhost:${proxyPort} if needed\n`);
        }
      }

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
      // NOTE: Device proxy and MITM proxy persist across tests for efficiency
      // They will only be cleaned up on process exit or manual cleanup
      // This allows for manual testing between test runs

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

      // NOTE: Mockoon and MITM proxy kept running for next test
      // They will be reused if already running

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
