const { remote } = require('webdriverio');
const DeviceManager = require('../lib/device-manager');

// Get device from command line argument or use default
const deviceNameOrId = process.argv[2] || 'android-emulator-1';

// Platform-specific app configurations
const APP_CONFIGS = {
  android: {
    'appium:app': '/Users/vanyahuaman/expo-arch-example-app/android/app/build/outputs/apk/debug/app-debug.apk',
    'appium:appPackage': 'com.vanyahuaman.expoarchexampleapp',
    'appium:appActivity': '.MainActivity',
    'appium:noReset': false,
  },
  ios: {
    'appium:app': '/Users/vanyahuaman/Library/Developer/Xcode/DerivedData/expoarchexampleapp-hkwwfuedzurdeibfyglrulesvlly/Build/Products/Debug-iphonesimulator/expoarchexampleapp.app',
    'appium:bundleId': 'com.vanyahuaman.expoarchexampleapp',
    'appium:noReset': false,
  },
};

async function runTest() {
  console.log('🚀 Starting Appium test...');
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

  // Get capabilities with app config
  const capabilities = manager.getCapabilities(deviceNameOrId, APP_CONFIG);

  console.log('🔧 Capabilities:', JSON.stringify(capabilities, null, 2), '\n');

  const driver = await remote({
    hostname: 'localhost',
    port: 4723,
    path: '/',
    capabilities,
  });

  try {
    console.log('✅ App launched successfully');

    // Wait for login screen to load
    await driver.pause(3000);
    console.log('⏳ Waiting for login screen...');

    // Find username input (use testID for iOS, accessibilityLabel for Android)
    const usernameSelector = device.platform === 'ios' ? '~username-input' : '~Username input';
    const usernameInput = await driver.$(usernameSelector);
    await usernameInput.waitForDisplayed({ timeout: 10000 });
    console.log('✅ Found username input');

    // Enter username
    await usernameInput.setValue('demo');
    console.log('📝 Entered username: demo');

    // Find password input
    const passwordSelector = device.platform === 'ios' ? '~password-input' : '~Password input';
    const passwordInput = await driver.$(passwordSelector);
    await passwordInput.waitForDisplayed({ timeout: 5000 });
    console.log('✅ Found password input');

    // Enter password
    await passwordInput.setValue('password');
    console.log('📝 Entered password');

    // Find and click login button
    const loginButtonSelector = device.platform === 'ios' ? '~login-button' : '~Login button';
    const loginButton = await driver.$(loginButtonSelector);
    await loginButton.waitForDisplayed({ timeout: 5000 });
    console.log('✅ Found login button');

    await loginButton.click();
    console.log('🔘 Clicked login button');

    // Wait for navigation to home screen
    await driver.pause(2000);

    // Verify we're on the home screen by checking for home text
    try {
      const homeElement = device.platform === 'android'
        ? await driver.$('android=new UiSelector().textContains("Home Dashboard")')
        : await driver.$('-ios predicate string:label == "Home Dashboard"');

      await homeElement.waitForDisplayed({ timeout: 5000 });
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
