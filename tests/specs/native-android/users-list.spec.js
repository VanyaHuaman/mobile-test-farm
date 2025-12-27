const TestBase = require('../../helpers/TestBase');
const NativeLoginPage = require('../../page-objects/native-android/LoginPage');
const NativeHomePage = require('../../page-objects/native-android/HomePage');
const NativeUsersListPage = require('../../page-objects/native-android/UsersListPage');
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

async function runUsersListTests() {
  const testBase = new TestBase();

  console.log('\n📱 Native Android Compose - Users List Tests\n');
  console.log('=============================================\n');

  try {
    // Test 1: Load users from API
    console.log('Test 1: Load users from real API...');
    await testBase.runTest(
      deviceNameOrId,
      APP_CONFIG,
      async (driver) => {
        const loginPage = new NativeLoginPage(driver, 'android');
        const homePage = new NativeHomePage(driver, 'android');
        const usersPage = new NativeUsersListPage(driver, 'android');

        // Login first
        await loginPage.loginWithDefaultCredentials();
        await homePage.verifyOnHomePage();

        // Users tab should be selected by default
        await usersPage.waitForUsersListScreen();

        // Wait for users to load
        await usersPage.waitForUsersToLoad();

        // Verify users are displayed
        const userCount = await usersPage.getUserCount();
        if (userCount < 1) {
          throw new Error('No users found in list');
        }
        console.log(`✓ Found ${userCount} users`);

        // Verify first user exists
        await usersPage.verifyUserExists(1);

        console.log('✅ Test 1 PASSED: Users loaded from API\n');
      },
      'native-android-users-list-real-api'
    );

    // Test 2: Verify user data
    console.log('Test 2: Verify user data...');
    await testBase.runTest(
      deviceNameOrId,
      APP_CONFIG,
      async (driver) => {
        const loginPage = new NativeLoginPage(driver, 'android');
        const homePage = new NativeHomePage(driver, 'android');
        const usersPage = new NativeUsersListPage(driver, 'android');

        // Login
        await loginPage.loginWithDefaultCredentials();
        await homePage.verifyOnHomePage();

        // Wait for users to load
        await usersPage.waitForUsersToLoad();

        // Get user details
        const userName = await usersPage.getUserName(1);
        const userEmail = await usersPage.getUserEmail(1);

        console.log(`✓ User 1 - Name: ${userName}`);
        console.log(`✓ User 1 - Email: ${userEmail}`);

        if (!userName || !userEmail) {
          throw new Error('User data is missing');
        }

        console.log('✅ Test 2 PASSED: User data verified\n');
      },
      'native-android-users-verify-data'
    );

    // Test 3: Navigate between tabs
    console.log('Test 3: Navigate between tabs...');
    await testBase.runTest(
      deviceNameOrId,
      APP_CONFIG,
      async (driver) => {
        const loginPage = new NativeLoginPage(driver, 'android');
        const homePage = new NativeHomePage(driver, 'android');
        const usersPage = new NativeUsersListPage(driver, 'android');

        // Login
        await loginPage.loginWithDefaultCredentials();
        await homePage.verifyOnHomePage();

        // Verify on users tab
        await usersPage.waitForUsersListScreen();

        // Navigate to profile
        await homePage.navigateToProfile();
        await driver.pause(1000);

        // Navigate back to users
        await homePage.navigateToUsers();
        await usersPage.waitForUsersListScreen();

        console.log('✅ Test 3 PASSED: Tab navigation works\n');
      },
      'native-android-tab-navigation'
    );

    console.log('=============================================');
    console.log('✅ All users list tests PASSED!');
    console.log('=============================================\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runUsersListTests();
