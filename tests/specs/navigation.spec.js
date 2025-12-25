const TestBase = require('../helpers/TestBase');
const LoginPage = require('../pages/LoginPage');
const HomePage = require('../pages/HomePage');
const FormPage = require('../pages/FormPage');
const ListPage = require('../pages/ListPage');
const ProfilePage = require('../pages/ProfilePage');
const AllureReporter = require('../helpers/StandaloneAllureReporter');
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

async function testNavigationFlow() {
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

    // Add Allure metadata
    AllureReporter.addEpic('Mobile Test Farm');
    AllureReporter.addFeature('Navigation Testing');
    AllureReporter.addStory('Complete App Navigation Flow');
    AllureReporter.addSeverity('blocker');

    // Run test
    await testBase.runTest(
      deviceNameOrId,
      appConfig,
      async () => {
        const platform = testBase.getPlatform();
        const driver = testBase.driver;

        // Add device info to Allure
        AllureReporter.addDeviceInfo(testBase.device);

        // Initialize page objects
        const loginPage = new LoginPage(driver, platform);
        const homePage = new HomePage(driver, platform);
        const formPage = new FormPage(driver, platform);
        const listPage = new ListPage(driver, platform);
        const profilePage = new ProfilePage(driver, platform);

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('🧪 NAVIGATION FLOW TESTING SUITE');
        console.log('═══════════════════════════════════════════════════════\n');

        // Test 1: Login flow
        await AllureReporter.step('Complete login flow', async () => {
          console.log('🔐 Test 1: Login Flow');
          await loginPage.pause(2000);
          await loginPage.waitForPageLoad();
          await loginPage.verifyOnLoginPage();
          await loginPage.loginWithDefaultCredentials();
          await homePage.waitForPageLoad();
          await homePage.verifyOnHomePage();
          console.log('✅ Login → Home: SUCCESS\n');
        });

        // Test 2: Home → Form → Home
        await AllureReporter.step('Navigate Home → Form → Home', async () => {
          console.log('📝 Test 2: Home → Form → Home');
          await homePage.clickMenuItem('form');
          await formPage.waitForPageLoad();
          await formPage.verifyOnFormPage();
          console.log('   ✓ Navigated to Form');

          await formPage.clickBack();
          await homePage.waitForPageLoad();
          await homePage.verifyOnHomePage();
          console.log('✅ Form navigation: SUCCESS\n');
        });

        // Test 3: Home → List → Home
        await AllureReporter.step('Navigate Home → List → Home', async () => {
          console.log('📋 Test 3: Home → List → Home');
          await homePage.clickMenuItem('list');
          await listPage.waitForPageLoad();
          await listPage.verifyOnListPage();
          console.log('   ✓ Navigated to List');

          await listPage.clickBack();
          await homePage.waitForPageLoad();
          await homePage.verifyOnHomePage();
          console.log('✅ List navigation: SUCCESS\n');
        });

        // Test 4: Home → Profile → Home
        await AllureReporter.step('Navigate Home → Profile → Home', async () => {
          console.log('👤 Test 4: Home → Profile → Home');
          await homePage.clickMenuItem('profile');
          await profilePage.waitForPageLoad();
          await profilePage.verifyOnProfilePage();
          console.log('   ✓ Navigated to Profile');

          await profilePage.clickBack();
          await homePage.waitForPageLoad();
          await homePage.verifyOnHomePage();
          console.log('✅ Profile navigation: SUCCESS\n');
        });

        // Test 5: Complete tour (all screens)
        await AllureReporter.step('Complete app tour (all screens)', async () => {
          console.log('🌐 Test 5: Complete App Tour');

          // Form
          console.log('   → Form');
          await homePage.clickMenuItem('form');
          await formPage.waitForPageLoad();
          await formPage.pause(500);
          await formPage.clickBack();
          await homePage.waitForPageLoad();

          // List
          console.log('   → List');
          await homePage.clickMenuItem('list');
          await listPage.waitForPageLoad();
          await listPage.pause(500);
          await listPage.clickBack();
          await homePage.waitForPageLoad();

          // Profile
          console.log('   → Profile');
          await homePage.clickMenuItem('profile');
          await profilePage.waitForPageLoad();
          await profilePage.pause(500);
          await profilePage.clickBack();
          await homePage.waitForPageLoad();

          await homePage.verifyOnHomePage();
          console.log('✅ Complete tour: SUCCESS\n');
        });

        // Test 6: Rapid navigation
        await AllureReporter.step('Rapid navigation test', async () => {
          console.log('⚡ Test 6: Rapid Navigation');

          for (let i = 0; i < 3; i++) {
            console.log(`   Cycle ${i + 1}/3`);

            await homePage.clickMenuItem('form');
            await formPage.waitForPageLoad();
            await formPage.clickBack();
            await homePage.waitForPageLoad();

            await homePage.clickMenuItem('list');
            await listPage.waitForPageLoad();
            await listPage.clickBack();
            await homePage.waitForPageLoad();

            await homePage.clickMenuItem('profile');
            await profilePage.waitForPageLoad();
            await profilePage.clickBack();
            await homePage.waitForPageLoad();
          }

          await homePage.verifyOnHomePage();
          console.log('✅ Rapid navigation: SUCCESS\n');
        });

        // Test 7: Logout flow
        await AllureReporter.step('Complete logout flow', async () => {
          console.log('🚪 Test 7: Logout Flow');
          await homePage.clickLogout();
          await loginPage.waitForPageLoad();
          await loginPage.verifyOnLoginPage();
          console.log('✅ Logout: SUCCESS\n');
        });

        // Test 8: Re-login
        await AllureReporter.step('Re-login after logout', async () => {
          console.log('🔑 Test 8: Re-login');
          await loginPage.loginWithDefaultCredentials();
          await homePage.waitForPageLoad();
          await homePage.verifyOnHomePage();
          console.log('✅ Re-login: SUCCESS\n');
        });

        console.log('═══════════════════════════════════════════════════════');
        console.log('🎉 ALL NAVIGATION TESTS PASSED!');
        console.log('═══════════════════════════════════════════════════════');
        console.log('\n📊 Test Summary:');
        console.log('   ✓ Login flow');
        console.log('   ✓ Form navigation');
        console.log('   ✓ List navigation');
        console.log('   ✓ Profile navigation');
        console.log('   ✓ Complete app tour');
        console.log('   ✓ Rapid navigation (3 cycles)');
        console.log('   ✓ Logout flow');
        console.log('   ✓ Re-login flow');
        console.log('═══════════════════════════════════════════════════════\n');
      },
      'navigation-suite'
    );

    console.log('\n✅ Navigation test suite completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Navigation test suite failed:', error.message);
    AllureReporter.attachLog('Error Details', error.stack);
    process.exit(1);
  }
}

// Run the test
testNavigationFlow();
