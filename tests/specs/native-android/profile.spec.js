const TestBase = require('../../helpers/TestBase');
const NativeLoginPage = require('../../page-objects/native-android/LoginPage');
const NativeHomePage = require('../../page-objects/native-android/HomePage');
const NativeProfilePage = require('../../page-objects/native-android/ProfilePage');
const config = require('../../../config/test.config');

// Get device from command line argument or use default
const deviceNameOrId = process.argv[2] || 'android-emulator-1';

// App configuration for native Android Compose app
const APP_CONFIG = {
  'appium:app': config.apps.android.debug,
  'appium:appPackage': config.appInfo.android.package,
  'appium:appActivity': config.appInfo.android.activity,
  'appium:noReset': false,
};

async function runProfileTests() {
  const testBase = new TestBase();

  console.log('\n📱 Native Android Compose - Profile Tests\n');
  console.log('==========================================\n');

  try {
    // Test 1: View profile
    console.log('Test 1: View profile information...');
    await testBase.runTest(
      deviceNameOrId,
      APP_CONFIG,
      async (driver) => {
        const loginPage = new NativeLoginPage(driver, 'android');
        const homePage = new NativeHomePage(driver, 'android');
        const profilePage = new NativeProfilePage(driver, 'android');

        // Login
        await loginPage.loginWithDefaultCredentials();
        await homePage.verifyOnHomePage();

        // Navigate to profile
        await homePage.navigateToProfile();
        await profilePage.verifyOnProfilePage();

        // Verify profile data
        const name = await profilePage.getProfileName();
        const email = await profilePage.getProfileEmail();
        const phone = await profilePage.getProfilePhone();

        console.log(`✓ Profile Name: ${name}`);
        console.log(`✓ Profile Email: ${email}`);
        console.log(`✓ Profile Phone: ${phone}`);

        if (!name || !email || !phone) {
          throw new Error('Profile data is missing');
        }

        console.log('✅ Test 1 PASSED: Profile displayed correctly\n');
      },
      'native-android-profile-view'
    );

    // Test 2: Logout flow
    console.log('Test 2: Logout flow...');
    await testBase.runTest(
      deviceNameOrId,
      APP_CONFIG,
      async (driver) => {
        const loginPage = new NativeLoginPage(driver, 'android');
        const homePage = new NativeHomePage(driver, 'android');
        const profilePage = new NativeProfilePage(driver, 'android');

        // Login
        await loginPage.loginWithDefaultCredentials();
        await homePage.verifyOnHomePage();

        // Navigate to profile
        await homePage.navigateToProfile();
        await profilePage.verifyOnProfilePage();

        // Logout
        await profilePage.clickLogout();

        // Wait for login screen to appear
        await loginPage.waitForLoginScreen();

        console.log('✅ Test 2 PASSED: Logout successful\n');
      },
      'native-android-logout'
    );

    // Test 3: Complete flow (login -> profile -> logout -> login)
    console.log('Test 3: Complete user flow...');
    await testBase.runTest(
      deviceNameOrId,
      APP_CONFIG,
      async (driver) => {
        const loginPage = new NativeLoginPage(driver, 'android');
        const homePage = new NativeHomePage(driver, 'android');
        const profilePage = new NativeProfilePage(driver, 'android');

        // First login
        await loginPage.loginWithDefaultCredentials();
        await homePage.verifyOnHomePage();

        // View profile
        await homePage.navigateToProfile();
        await profilePage.verifyOnProfilePage();

        // Logout
        await profilePage.logout();
        await loginPage.waitForLoginScreen();

        // Login again
        await loginPage.loginWithDefaultCredentials();
        await homePage.verifyOnHomePage();

        console.log('✅ Test 3 PASSED: Complete user flow\n');
      },
      'native-android-complete-flow'
    );

    console.log('==========================================');
    console.log('✅ All profile tests PASSED!');
    console.log('==========================================\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runProfileTests();
