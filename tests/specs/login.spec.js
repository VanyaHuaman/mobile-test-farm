const TestBase = require('../helpers/TestBase');
const LoginPage = require('../pages/LoginPage');
const HomePage = require('../pages/HomePage');
const config = require('../../config/test.config');

// Get device from command line argument or use default
const deviceNameOrId = process.argv[2] || 'android-emulator-1';

// Platform-specific app configurations
const APP_CONFIGS = {
  android: {
    'appium:app': config.apps.android.debug,
    'appium:appPackage': config.appInfo.android.package,
    'appium:appActivity': config.appInfo.android.activity,
    'appium:noReset': config.behavior.noReset,
  },
  ios: {
    'appium:app': config.apps.ios.simulator,
    'appium:bundleId': config.appInfo.ios.bundleId,
    'appium:noReset': config.behavior.noReset,
  },
};

async function testLoginFlow() {
  const testBase = new TestBase();

  try {
    // Determine platform and get app config
    const deviceManager = testBase.deviceManager;
    const device = deviceManager.getDevice(deviceNameOrId);

    if (!device) {
      console.error(`❌ Device '${deviceNameOrId}' not found`);
      process.exit(1);
    }

    const appConfig = APP_CONFIGS[device.platform];

    // Run test
    await testBase.runTest(
      deviceNameOrId,
      appConfig,
      async () => {
        const platform = testBase.getPlatform();
        const driver = testBase.driver;

        // Initialize page objects
        const loginPage = new LoginPage(driver, platform);
        const homePage = new HomePage(driver, platform);

        console.log('✅ App launched successfully\n');

        // Wait for app to stabilize
        await loginPage.pause(3000);

        // Test: Login with default credentials
        console.log('🧪 Test Step 1: Login with credentials');
        await loginPage.loginWithDefaultCredentials();
        console.log('✅ Login action completed\n');

        // Wait for navigation
        await homePage.pause(1000);

        // Test: Verify on home page
        console.log('🧪 Test Step 2: Verify home page loaded');
        await homePage.waitForPageLoad();
        await homePage.verifyOnHomePage();
        console.log('✅ Home page verification passed\n');

        // Test: Verify header title
        console.log('🧪 Test Step 3: Verify header title');
        const headerTitle = await homePage.getHeaderTitle();
        console.log(`   Header title: "${headerTitle}"`);

        if (!headerTitle.includes('Home Dashboard')) {
          throw new Error(`Unexpected header title: ${headerTitle}`);
        }
        console.log('✅ Header title verification passed\n');

        console.log('🎉 All test steps passed!');
      },
      'login-flow'
    );

    console.log('\n✅ Login test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Login test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testLoginFlow();
