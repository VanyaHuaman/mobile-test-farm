const { remote } = require('webdriverio');

// Test configuration
const capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'emulator-5554',
  'appium:app': '/Users/vanyahuaman/expo-arch-example-app/android/app/build/outputs/apk/debug/app-debug.apk',
  'appium:appPackage': 'com.vanyahuaman.expoarchexampleapp',
  'appium:appActivity': '.MainActivity',
  'appium:noReset': false,
};

async function runTest() {
  console.log('🚀 Starting Appium test...');

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

    // Find username input by testID
    const usernameInput = await driver.$('~Username input');
    await usernameInput.waitForDisplayed({ timeout: 10000 });
    console.log('✅ Found username input');

    // Enter username
    await usernameInput.setValue('demo');
    console.log('📝 Entered username: demo');

    // Find password input
    const passwordInput = await driver.$('~Password input');
    await passwordInput.waitForDisplayed({ timeout: 5000 });
    console.log('✅ Found password input');

    // Enter password
    await passwordInput.setValue('password');
    console.log('📝 Entered password');

    // Find and click login button
    const loginButton = await driver.$('~Login button');
    await loginButton.waitForDisplayed({ timeout: 5000 });
    console.log('✅ Found login button');

    await loginButton.click();
    console.log('🔘 Clicked login button');

    // Wait for navigation to home screen
    await driver.pause(2000);

    // Verify we're on the home screen by checking for a home element
    const homeElement = await driver.$('android=new UiSelector().textContains("Home Dashboard")');
    const isDisplayed = await homeElement.isDisplayed();

    if (isDisplayed) {
      console.log('✅ Login successful! Home screen loaded');
    } else {
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
