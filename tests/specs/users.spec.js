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
    },
    ios: {
      app: config.apps.ios.simulator,
      bundleId: config.appInfo.ios.bundleId,
    },
  };

  // Run test
  await testBase.runTest(
    deviceArg,
    appConfig,
    async () => {
      // Initialize page objects INSIDE runTest callback (after driver is initialized)
      const loginPage = new LoginPage(testBase.driver);
      const usersPage = new UsersPage(testBase.driver);

      testBase.allure.step('Login to app', async () => {
        console.log('🔐 Logging in...');
        await testBase.driver.pause(2000);

        // Login with default credentials
        await loginPage.loginWithDefaultCredentials();

        // Wait for home screen after login
        await testBase.driver.pause(2000);
        console.log('✅ Logged in successfully');
      });

      testBase.allure.step('Navigate to Users screen', async () => {
        // Click Users button
        const usersButton = await testBase.driver.$('~menu-item-users');
        await usersButton.waitForDisplayed({ timeout: 10000 });
        await usersButton.click();

        console.log('✅ Clicked Users button');
      });

      testBase.allure.step('Verify Users screen loaded', async () => {
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

      testBase.allure.step('Verify API data loaded', async () => {
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

      testBase.allure.step('Verify users list', async () => {
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

      testBase.allure.step('Test refresh functionality', async () => {
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

      testBase.allure.step('Navigate back to home', async () => {
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
