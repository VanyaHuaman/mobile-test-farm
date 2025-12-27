const TestBase = require('../../helpers/TestBase');
const NativeLoginPage = require('../../page-objects/native-android/LoginPage');
const NativeHomePage = require('../../page-objects/native-android/HomePage');
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

async function runLoginTests() {
  const testBase = new TestBase();

  console.log('\n📱 Native Android Compose - Login Tests\n');
  console.log('=========================================\n');

  try {
    // Test 1: Successful login
    console.log('Test 1: Login with valid credentials...');
    await testBase.runTest(
      deviceNameOrId,
      APP_CONFIG,
      async (driver) => {
        const loginPage = new NativeLoginPage(driver, 'android');
        const homePage = new NativeHomePage(driver, 'android');

        // Wait for login screen
        await loginPage.waitForLoginScreen();

        // Login with valid credentials
        await loginPage.login('demo', 'password123');

        // Verify home screen appears
        await homePage.verifyOnHomePage();

        console.log('✅ Test 1 PASSED: Successful login\n');
      },
      'native-android-login-success'
    );

    // Test 2: Invalid credentials
    console.log('Test 2: Login with invalid credentials...');
    await testBase.runTest(
      deviceNameOrId,
      APP_CONFIG,
      async (driver) => {
        const loginPage = new NativeLoginPage(driver, 'android');

        // Wait for login screen
        await loginPage.waitForLoginScreen();

        // Attempt login with invalid credentials
        await loginPage.login('wrong', 'credentials');

        // Verify error message
        await loginPage.verifyErrorMessage('Invalid credentials');

        console.log('✅ Test 2 PASSED: Invalid credentials error shown\n');
      },
      'native-android-login-invalid'
    );

    // Test 3: Empty username
    console.log('Test 3: Login with empty username...');
    await testBase.runTest(
      deviceNameOrId,
      APP_CONFIG,
      async (driver) => {
        const loginPage = new NativeLoginPage(driver, 'android');

        // Wait for login screen
        await loginPage.waitForLoginScreen();

        // Attempt login with empty username
        await loginPage.enterPassword('password123');
        await loginPage.clickLoginButton();

        // Verify error message
        await loginPage.verifyErrorMessage('Username cannot be empty');

        console.log('✅ Test 3 PASSED: Empty username validation\n');
      },
      'native-android-login-empty-username'
    );

    // Test 4: Empty password
    console.log('Test 4: Login with empty password...');
    await testBase.runTest(
      deviceNameOrId,
      APP_CONFIG,
      async (driver) => {
        const loginPage = new NativeLoginPage(driver, 'android');

        // Wait for login screen
        await loginPage.waitForLoginScreen();

        // Attempt login with empty password
        await loginPage.enterUsername('demo');
        await loginPage.clickLoginButton();

        // Verify error message
        await loginPage.verifyErrorMessage('Password cannot be empty');

        console.log('✅ Test 4 PASSED: Empty password validation\n');
      },
      'native-android-login-empty-password'
    );

    console.log('=========================================');
    console.log('✅ All login tests PASSED!');
    console.log('=========================================\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runLoginTests();
