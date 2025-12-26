#!/usr/bin/env node

/**
 * Users Screen Test - API Integration with Mockoon
 *
 * Tests the Users screen with real API calls
 * Demonstrates Mockoon integration for API mocking and traffic recording
 *
 * Usage:
 *   MOCKOON_ENABLED=true node tests/specs/users.spec.js [device-id]
 */

const TestBase = require('../helpers/TestBase');
const LoginPage = require('../pages/LoginPage');
const HomePage = require('../pages/HomePage');
const UsersPage = require('../pages/UsersPage');
const config = require('../../config/test.config');
const path = require('path');

async function runUsersTest() {
  const testBase = new TestBase();

  const deviceArg = process.argv[2] || 'android-emulator-1';

  // Configure app paths
  const appConfig = {
    android: {
      app: config.apps.android.debug,
      appPackage: config.appInfo.android.package,
      appActivity: config.appInfo.android.activity,
      noReset: config.behavior.noReset,
    },
    ios: {
      app: config.apps.ios.simulator,
      bundleId: config.appInfo.ios.bundleId,
      noReset: config.behavior.noReset,
    },
  };

  // Run test
  await testBase.runTest(
    deviceArg,
    appConfig,
    async () => {
      // Initialize page objects INSIDE runTest callback (after driver is initialized)
      const platform = testBase.getPlatform();
      const loginPage = new LoginPage(testBase.driver, platform);
      const homePage = new HomePage(testBase.driver, platform);
      const usersPage = new UsersPage(testBase.driver, platform);

      await testBase.allure.step('Login to app', async () => {
        console.log('🔐 Starting login process...');
        console.log('📱 App should be on login screen');
        await testBase.driver.pause(2000);

        // Login with default credentials
        console.log('🔑 Attempting to login with default credentials...');
        try {
          await loginPage.loginWithDefaultCredentials();
          console.log('✅ Login action completed');
        } catch (error) {
          console.error('❌ Login failed:', error.message);
          throw error;
        }

        // Wait for navigation
        console.log('⏳ Waiting for navigation to home screen...');
        await testBase.driver.pause(1000);

        // Verify home page loaded
        console.log('🏠 Verifying home page loaded...');
        try {
          await homePage.waitForPageLoad();
          await homePage.verifyOnHomePage();
          console.log('✅ Home page loaded successfully');
        } catch (error) {
          console.error('❌ Home page verification failed:', error.message);
          throw error;
        }
      });

      await testBase.allure.step('Navigate to Users screen', async () => {
        console.log('🔍 Looking for Users button...');

        // Platform-specific selectors
        let usersButton;
        if (platform === 'android') {
          // On Android, find by text content (more reliable than resource-id)
          usersButton = await testBase.driver.$('android=new UiSelector().textContains("Users (API)")');
        } else {
          // On iOS, use accessibility id (testID maps to accessibility identifier)
          usersButton = await testBase.driver.$('~menu-item-users');
        }

        await usersButton.waitForDisplayed({ timeout: 10000 });
        await usersButton.click();

        console.log('✅ Clicked Users button');
      });

      await testBase.allure.step('Verify Users screen loaded', async () => {
        // Wait for users screen
        await usersPage.waitForScreen();
        console.log('✅ Users screen loaded');

        // Verify header
        const headerExists = await usersPage.verifyHeader();
        if (!headerExists) {
          throw new Error('Users header not found');
        }
        console.log('✅ Users header verified');
      });

      await testBase.allure.step('Verify API data loaded', async () => {
        // Wait for users list to load (with API data)
        await testBase.driver.pause(3000); // Give time for API call

        // Check if loading or users list is displayed
        const loadingVisible = await usersPage.isLoading();
        const errorVisible = await usersPage.hasError();

        if (loadingVisible) {
          console.log('⏳ Loading users from API...');
          // Wait for loading to finish
          await testBase.driver.waitUntil(
            async () => !(await usersPage.isLoading()),
            {
              timeout: 15000,
              timeoutMsg: 'Timed out waiting for users to load',
            }
          );
        }

        if (errorVisible) {
          const errorMessage = await usersPage.getErrorMessage();
          console.error('❌ API Error:', errorMessage);
          throw new Error(`Failed to load users: ${errorMessage}`);
        }

        console.log('✅ Users loaded from API');
      });

      await testBase.allure.step('Verify users list', async () => {
        // Get users count
        const count = await usersPage.getUsersCount();
        console.log(`📊 Found ${count} users`);

        if (count === 0) {
          throw new Error('No users found in list');
        }

        // Verify first user card
        const firstUserExists = await usersPage.verifyUserCard(1);
        if (!firstUserExists) {
          throw new Error('First user card not found');
        }

        console.log('✅ Users list verified');
      });

      await testBase.allure.step('Test refresh functionality', async () => {
        // Click refresh button
        await usersPage.clickRefresh();
        console.log('🔄 Clicked refresh button');

        // Wait for refresh to complete
        await testBase.driver.pause(2000);

        // Verify still showing users
        const count = await usersPage.getUsersCount();
        console.log(`📊 After refresh: ${count} users`);

        if (count === 0) {
          throw new Error('Users list empty after refresh');
        }

        console.log('✅ Refresh functionality verified');
      });

      await testBase.allure.step('Navigate back to home', async () => {
        await usersPage.clickBack();
        console.log('✅ Navigated back to home');
      });

      console.log('\n✅ Users API test passed!\n');
    },
    'users-api-test'
  );
}

// Run the test
runUsersTest()
  .then(() => {
    console.log('✅ Test suite completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
