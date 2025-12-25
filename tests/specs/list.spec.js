const TestBase = require('../helpers/TestBase');
const LoginPage = require('../pages/LoginPage');
const HomePage = require('../pages/HomePage');
const ListPage = require('../pages/ListPage');
const AllureReporter = require('../helpers/StandaloneAllureReporter');
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

async function testListFlow() {
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
    AllureReporter.addFeature('List Testing');
    AllureReporter.addStory('Task List Filtering and Interaction');
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
        const listPage = new ListPage(driver, platform);

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('🧪 LIST TESTING SUITE');
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

        // Step 2: Navigate to List
        await AllureReporter.step('Navigate to List screen', async () => {
          console.log('🧭 Step 2: Navigate to List');
          await homePage.clickMenuItem('list');
          await listPage.waitForPageLoad();
          await listPage.verifyOnListPage();
          console.log('✅ Navigated to List screen\n');
        });

        // Test 1: Verify total item count
        await AllureReporter.step('Verify total item count', async () => {
          console.log('📊 Test 1: Verify total item count');
          await listPage.selectFilter('all');
          const totalCount = await listPage.getItemCount();
          console.log(`   Found ${totalCount} total items`);

          if (totalCount !== testData.tasks.all.length) {
            throw new Error(`Expected ${testData.tasks.all.length} items, found ${totalCount}`);
          }
          console.log('✅ Total count verified\n');
        });

        // Test 2: Test all filters
        await AllureReporter.step('Test all filter options', async () => {
          console.log('🔍 Test 2: Test all filters');
          const filterResults = await listPage.testAllFilters();

          // Verify filter counts
          const expectedCounts = {
            all: testData.tasks.all.length,
            pending: testData.tasks.pending.length,
            inProgress: testData.tasks.inProgress.length,
            completed: testData.tasks.completed.length,
          };

          const errors = [];
          if (filterResults.all !== expectedCounts.all) {
            errors.push(`All: expected ${expectedCounts.all}, got ${filterResults.all}`);
          }
          if (filterResults.pending !== expectedCounts.pending) {
            errors.push(`Pending: expected ${expectedCounts.pending}, got ${filterResults.pending}`);
          }
          if (filterResults.inProgress !== expectedCounts.inProgress) {
            errors.push(`In-progress: expected ${expectedCounts.inProgress}, got ${filterResults.inProgress}`);
          }
          if (filterResults.completed !== expectedCounts.completed) {
            errors.push(`Completed: expected ${expectedCounts.completed}, got ${filterResults.completed}`);
          }

          if (errors.length > 0) {
            throw new Error(`Filter count verification failed:\n${errors.join('\n')}`);
          }

          console.log('✅ All filters verified\n');
        });

        // Test 3: Test "Pending" filter
        await AllureReporter.step('Verify pending items filter', async () => {
          console.log('📋 Test 3: Verify pending filter');
          await listPage.selectFilter('pending');
          await listPage.pause(500);
          const count = await listPage.getItemCount();
          console.log(`   Pending items: ${count}`);

          if (count !== testData.tasks.pending.length) {
            throw new Error(`Expected ${testData.tasks.pending.length} pending items, found ${count}`);
          }
          console.log('✅ Pending filter verified\n');
        });

        // Test 4: Test "In Progress" filter
        await AllureReporter.step('Verify in-progress items filter', async () => {
          console.log('⏳ Test 4: Verify in-progress filter');
          await listPage.selectFilter('in-progress');
          await listPage.pause(500);
          const count = await listPage.getItemCount();
          console.log(`   In-progress items: ${count}`);

          if (count !== testData.tasks.inProgress.length) {
            throw new Error(`Expected ${testData.tasks.inProgress.length} in-progress items, found ${count}`);
          }
          console.log('✅ In-progress filter verified\n');
        });

        // Test 5: Test "Completed" filter
        await AllureReporter.step('Verify completed items filter', async () => {
          console.log('✓ Test 5: Verify completed filter');
          await listPage.selectFilter('completed');
          await listPage.pause(500);
          const count = await listPage.getItemCount();
          console.log(`   Completed items: ${count}`);

          if (count !== testData.tasks.completed.length) {
            throw new Error(`Expected ${testData.tasks.completed.length} completed items, found ${count}`);
          }
          console.log('✅ Completed filter verified\n');
        });

        // Test 6: Test item interaction
        await AllureReporter.step('Test list item interaction', async () => {
          console.log('👆 Test 6: Test item interaction');
          await listPage.selectFilter('all');
          await listPage.pause(500);

          // Click first item
          console.log('   Clicking item 1...');
          await listPage.clickListItem('1');
          await listPage.dismissAlert();

          // Click another item
          console.log('   Clicking item 5...');
          await listPage.clickListItem('5');
          await listPage.dismissAlert();

          console.log('✅ Item interactions verified\n');
        });

        // Test 7: Filter switching
        await AllureReporter.step('Test rapid filter switching', async () => {
          console.log('🔄 Test 7: Rapid filter switching');

          await listPage.selectFilter('pending');
          await listPage.pause(300);
          await listPage.selectFilter('completed');
          await listPage.pause(300);
          await listPage.selectFilter('in-progress');
          await listPage.pause(300);
          await listPage.selectFilter('all');
          await listPage.pause(300);

          const count = await listPage.getItemCount();
          if (count !== testData.tasks.all.length) {
            throw new Error(`Filter switching failed: expected ${testData.tasks.all.length} items, found ${count}`);
          }

          console.log('✅ Rapid switching verified\n');
        });

        // Test 8: Navigate back
        await AllureReporter.step('Navigate back to home', async () => {
          console.log('🔙 Test 8: Navigate back');
          await listPage.clickBack();
          await homePage.waitForPageLoad();
          await homePage.verifyOnHomePage();
          console.log('✅ Navigated back to home\n');
        });

        console.log('═══════════════════════════════════════════════════════');
        console.log('🎉 ALL LIST TESTS PASSED!');
        console.log('═══════════════════════════════════════════════════════\n');
      },
      'list-suite'
    );

    console.log('\n✅ List test suite completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ List test suite failed:', error.message);
    AllureReporter.attachLog('Error Details', error.stack);
    process.exit(1);
  }
}

// Run the test
testListFlow();
