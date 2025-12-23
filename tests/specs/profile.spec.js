const TestBase = require('../helpers/TestBase');
const LoginPage = require('../pages/LoginPage');
const HomePage = require('../pages/HomePage');
const ProfilePage = require('../pages/ProfilePage');
const AllureReporter = require('../helpers/AllureReporter');
const testData = require('../data/testData');
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

async function testProfileFlow() {
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
    AllureReporter.addFeature('Profile Testing');
    AllureReporter.addStory('User Profile and Settings');
    AllureReporter.addSeverity('normal');

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
        const profilePage = new ProfilePage(driver, platform);

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('🧪 PROFILE TESTING SUITE');
        console.log('═══════════════════════════════════════════════════════\n');

        // Step 1: Login
        await AllureReporter.step('Login to application', async () => {
          console.log('🔐 Step 1: Login');
          await loginPage.pause(2000);
          await loginPage.loginWithDefaultCredentials();
          await homePage.waitForPageLoad();
          await homePage.verifyOnHomePage();
          console.log('✅ Login successful\n');
        });

        // Step 2: Navigate to Profile
        await AllureReporter.step('Navigate to Profile screen', async () => {
          console.log('🧭 Step 2: Navigate to Profile');
          await homePage.clickMenuItem('profile');
          await profilePage.waitForPageLoad();
          await profilePage.verifyOnProfilePage();
          console.log('✅ Navigated to Profile screen\n');
        });

        // Test 1: Verify profile data
        await AllureReporter.step('Verify profile information', async () => {
          console.log('👤 Test 1: Verify profile data');
          const profileData = await profilePage.getProfileData();

          console.log('   Profile data:');
          console.log(`   Phone: ${profileData.phone}`);
          console.log(`   Location: ${profileData.location}`);
          console.log(`   Member Since: ${profileData.memberSince}`);

          await profilePage.verifyProfileData(testData.profile);
          console.log('✅ Profile data verified\n');
        });

        // Test 2: Test Edit Profile setting
        await AllureReporter.step('Test Edit Profile setting', async () => {
          console.log('✏️  Test 2: Edit Profile');
          await profilePage.clickEditProfile();
          await profilePage.dismissAlert();
          console.log('✅ Edit Profile tested\n');
        });

        // Test 3: Test Notifications setting
        await AllureReporter.step('Test Notifications setting', async () => {
          console.log('🔔 Test 3: Notifications');
          await profilePage.clickNotifications();
          await profilePage.dismissAlert();
          console.log('✅ Notifications tested\n');
        });

        // Test 4: Test Privacy setting
        await AllureReporter.step('Test Privacy setting', async () => {
          console.log('🔒 Test 4: Privacy');
          await profilePage.clickPrivacy();
          await profilePage.dismissAlert();
          console.log('✅ Privacy tested\n');
        });

        // Test 5: Test Help & Support setting
        await AllureReporter.step('Test Help & Support setting', async () => {
          console.log('❓ Test 5: Help & Support');
          await profilePage.clickHelpSupport();
          await profilePage.dismissAlert();
          console.log('✅ Help & Support tested\n');
        });

        // Test 6: Test About setting
        await AllureReporter.step('Test About setting', async () => {
          console.log('ℹ️  Test 6: About');
          await profilePage.clickAbout();
          await profilePage.dismissAlert();
          console.log('✅ About tested\n');
        });

        // Test 7: Test all settings at once
        await AllureReporter.step('Test all settings sequentially', async () => {
          console.log('⚙️  Test 7: All settings');
          await profilePage.testAllSettings();
          console.log('✅ All settings tested\n');
        });

        // Test 8: Test Delete Account (cancel)
        await AllureReporter.step('Test Delete Account confirmation', async () => {
          console.log('🗑️  Test 8: Delete Account (cancel)');
          await profilePage.clickDeleteAccount();
          await profilePage.pause(1000);
          await profilePage.cancelAlert();
          console.log('✅ Delete Account tested (canceled)\n');
        });

        // Test 9: Navigate back
        await AllureReporter.step('Navigate back to home', async () => {
          console.log('🔙 Test 9: Navigate back');
          await profilePage.clickBack();
          await homePage.waitForPageLoad();
          await homePage.verifyOnHomePage();
          console.log('✅ Navigated back to home\n');
        });

        console.log('═══════════════════════════════════════════════════════');
        console.log('🎉 ALL PROFILE TESTS PASSED!');
        console.log('═══════════════════════════════════════════════════════\n');
      },
      'profile-suite'
    );

    console.log('\n✅ Profile test suite completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Profile test suite failed:', error.message);
    AllureReporter.attachLog('Error Details', error.stack);
    process.exit(1);
  }
}

// Run the test
testProfileFlow();
