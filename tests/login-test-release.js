const { remote } = require('webdriverio');
const DeviceManager = require('../lib/device-manager');
const config = require('../config/test.config');

// Get device from command line argument or use default
const deviceNameOrId = process.argv[2] || 'android-emulator-1';

// Platform-specific app configurations using RELEASE builds
const APP_CONFIGS = {
  android: {
    'appium:app': config.apps.android.release || config.apps.android.debug,
    'appium:appPackage': config.appInfo.android.package,
    'appium:appActivity': config.appInfo.android.activity,
    'appium:noReset': config.behavior.noReset,
  },
  ios: {
    'appium:app': config.apps.ios.device || config.apps.ios.simulator,
    'appium:bundleId': config.appInfo.ios.bundleId,
    'appium:noReset': config.behavior.noReset,
  },
};

async function runTest() {
  console.log('🚀 Starting Appium test (RELEASE MODE)...');
  console.log(`📱 Target device: ${deviceNameOrId}\n`);

  // Load device manager
  const manager = new DeviceManager();
  const device = manager.getDevice(deviceNameOrId);

  if (!device) {
    console.error(`❌ Device '${deviceNameOrId}' not found in registry`);
    console.log('\n💡 Available devices:');
    manager.printDevices();
    process.exit(1);
  }

  console.log(`✅ Device found: ${device.friendlyName}`);
  console.log(`   Platform: ${device.platform}`);
  console.log(`   Type: ${device.type}`);
  console.log(`   Device ID: ${device.deviceId}\n`);

  // Select app config based on platform
  const APP_CONFIG = APP_CONFIGS[device.platform];
  if (!APP_CONFIG) {
    console.error(`❌ No app configuration found for platform: ${device.platform}`);
    process.exit(1);
  }

  // Verify release build is configured
  const appPath = APP_CONFIG['appium:app'];
  if (!appPath || appPath === '') {
    console.error(`❌ No ${device.platform.toUpperCase()} release build configured!`);
    console.error(`\nPlease set one of these environment variables:`);
    if (device.platform === 'android') {
      console.error(`  - ANDROID_APP_RELEASE=/path/to/app-release.apk`);
    } else {
      console.error(`  - IOS_APP_DEVICE=/path/to/app.ipa`);
    }
    console.error(`\nOr add it to your .env file`);
    process.exit(1);
  }

  console.log(`📦 Using ${device.platform === 'android' ? 'release APK' : 'device build'}:`);
  console.log(`   ${appPath}\n`);

  // Get capabilities with app config
  const capabilities = manager.getCapabilities(deviceNameOrId, APP_CONFIG);

  console.log('🔧 Capabilities:', JSON.stringify(capabilities, null, 2), '\n');

  // Use configuration for Appium connection
  const driver = await remote({
    hostname: config.appium.host,
    port: config.appium.port,
    path: config.appium.path,
    capabilities,
  });

  // Set implicit wait timeout (Appium 3 best practice)
  // WebDriverIO uses setTimeout for implicit waits
  await driver.setTimeout({ implicit: config.timeouts.implicit });

  try {
    console.log('✅ App launched successfully');

    // Wait for login screen to load
    await driver.pause(3000);
    console.log('⏳ Waiting for login screen...');

    // Find username input (use testID for iOS, accessibilityLabel for Android)
    const usernameSelector = device.platform === 'ios' ? '~username-input' : '~Username input';
    const usernameInput = await driver.$(usernameSelector);
    // Implicit wait is set globally, but we can add explicit wait for critical elements
    await usernameInput.waitForDisplayed({ timeout: config.timeouts.explicit });
    console.log('✅ Found username input');

    // Enter username from config
    await usernameInput.setValue(config.testUsers.default.username);
    console.log(`📝 Entered username: ${config.testUsers.default.username}`);

    // Find password input
    const passwordSelector = device.platform === 'ios' ? '~password-input' : '~Password input';
    const passwordInput = await driver.$(passwordSelector);
    // With implicit wait, this should be faster
    console.log('✅ Found password input');

    // Enter password from config
    await passwordInput.setValue(config.testUsers.default.password);
    console.log('📝 Entered password');

    // Find and click login button
    const loginButtonSelector = device.platform === 'ios' ? '~login-button' : '~Login button';
    const loginButton = await driver.$(loginButtonSelector);
    // Implicit wait handles this automatically
    console.log('✅ Found login button');

    await loginButton.click();
    console.log('🔘 Clicked login button');

    // Wait for navigation to home screen (reduced from 2000ms - implicit wait helps)
    await driver.pause(1000);

    // Verify we're on the home screen by checking for home text
    try {
      const homeElement = device.platform === 'android'
        ? await driver.$('android=new UiSelector().textContains("Home Dashboard")')
        : await driver.$('-ios predicate string:label == "Home Dashboard"');

      // Use explicit timeout for verification
      await homeElement.waitForDisplayed({ timeout: config.timeouts.explicit });
      console.log('✅ Login successful! Home screen loaded');
    } catch (error) {
      console.error('❌ Could not verify home screen:', error.message);
      throw new Error('Home screen not found after login');
    }

    console.log('🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    await driver.deleteSession();
    console.log('🏁 Test session ended');
  }
}

// Run the test
runTest()
  .then(() => {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
