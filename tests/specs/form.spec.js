const TestBase = require('../helpers/TestBase');
const LoginPage = require('../pages/LoginPage');
const HomePage = require('../pages/HomePage');
const FormPage = require('../pages/FormPage');
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

async function testFormFlow() {
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
    AllureReporter.addFeature('Form Testing');
    AllureReporter.addStory('Complete Form Workflow');
    AllureReporter.addSeverity('critical');

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

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('🧪 FORM TESTING SUITE');
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

        // Step 2: Navigate to Form
        await AllureReporter.step('Navigate to Form screen', async () => {
          console.log('🧭 Step 2: Navigate to Form');
          await homePage.clickMenuItem('form');
          await formPage.waitForPageLoad();
          await formPage.verifyOnFormPage();
          console.log('✅ Navigated to Form screen\n');
        });

        // Test 1: Fill form with valid data
        await AllureReporter.step('Fill form with valid data', async () => {
          console.log('📝 Test 1: Fill form with valid data');
          await formPage.fillForm(testData.forms.valid);
          await formPage.verifyFormData(testData.forms.valid);
          console.log('✅ Form filled and verified\n');
        });

        // Test 2: Submit form
        await AllureReporter.step('Submit form', async () => {
          console.log('📤 Test 2: Submit form');
          await formPage.clickSubmit();
          await formPage.pause(1000);
          await formPage.dismissAlert();
          console.log('✅ Form submitted\n');
        });

        // Test 3: Clear form
        await AllureReporter.step('Clear form', async () => {
          console.log('🗑️  Test 3: Clear form');
          await formPage.clickClear();
          await formPage.pause(500);
          await formPage.verifyFormData(testData.forms.empty);
          console.log('✅ Form cleared\n');
        });

        // Test 4: Fill with minimal data
        await AllureReporter.step('Fill form with minimal data', async () => {
          console.log('📝 Test 4: Fill with minimal data');
          await formPage.fillForm(testData.forms.minimal);
          await formPage.verifyFormData(testData.forms.minimal);
          console.log('✅ Minimal data verified\n');
        });

        // Test 5: Clear and fill with long data
        await AllureReporter.step('Fill form with long text data', async () => {
          console.log('📝 Test 5: Fill with long data');
          await formPage.clickClear();
          await formPage.pause(500);
          await formPage.fillForm(testData.forms.long);
          await formPage.verifyFormData(testData.forms.long);
          console.log('✅ Long data verified\n');
        });

        // Test 6: Test switch toggles
        await AllureReporter.step('Test switch toggles', async () => {
          console.log('🔘 Test 6: Toggle switches');
          await formPage.clickClear();
          await formPage.pause(500);

          // Toggle notifications multiple times
          await formPage.toggleNotifications();
          await formPage.pause(300);
          await formPage.toggleNotifications();
          await formPage.pause(300);

          // Toggle newsletter
          await formPage.toggleNewsletter();
          await formPage.pause(300);

          console.log('✅ Switches toggled\n');
        });

        // Test 7: Special characters
        await AllureReporter.step('Fill form with special characters', async () => {
          console.log('📝 Test 7: Special characters');
          await formPage.clickClear();
          await formPage.pause(500);
          await formPage.fillForm(testData.forms.special);
          await formPage.verifyFormData(testData.forms.special);
          console.log('✅ Special characters handled\n');
        });

        // Test 8: Submit and navigate back
        await AllureReporter.step('Submit and navigate back', async () => {
          console.log('🔙 Test 8: Submit and navigate back');
          await formPage.clickSubmit();
          await formPage.pause(1000);
          await formPage.dismissAlert();
          await formPage.clickBack();
          await homePage.waitForPageLoad();
          await homePage.verifyOnHomePage();
          console.log('✅ Navigated back to home\n');
        });

        console.log('═══════════════════════════════════════════════════════');
        console.log('🎉 ALL FORM TESTS PASSED!');
        console.log('═══════════════════════════════════════════════════════\n');
      },
      'form-suite'
    );

    console.log('\n✅ Form test suite completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Form test suite failed:', error.message);
    AllureReporter.attachLog('Error Details', error.stack);
    process.exit(1);
  }
}

// Run the test
testFormFlow();
