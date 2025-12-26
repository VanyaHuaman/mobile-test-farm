#!/usr/bin/env node

/**
 * Posts Screen Test - API Integration with Mockoon
 *
 * Tests the Posts screen with real API calls
 * Demonstrates Mockoon integration for API mocking and traffic recording
 *
 * Usage:
 *   MOCKOON_ENABLED=true node tests/specs/posts.spec.js [device-id]
 */

const TestBase = require('../helpers/TestBase');
const LoginPage = require('../pages/LoginPage');
const HomePage = require('../pages/HomePage');
const PostsPage = require('../pages/PostsPage');
const config = require('../../config/test.config');
const path = require('path');

async function runPostsTest() {
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
      const postsPage = new PostsPage(testBase.driver);

      testBase.allure.step('Login to app', async () => {
        console.log('🔐 Logging in...');
        await testBase.driver.pause(2000);

        // Login with default credentials
        await loginPage.loginWithDefaultCredentials();
        console.log('✅ Login action completed');

        // Wait for navigation
        await testBase.driver.pause(1000);

        // Verify home page loaded
        await homePage.waitForPageLoad();
        await homePage.verifyOnHomePage();
        console.log('✅ Home page loaded successfully');
      });

      testBase.allure.step('Navigate to Posts screen', async () => {
        // Click Posts button
        const postsButton = await testBase.driver.$('~menu-item-posts');
        await postsButton.waitForDisplayed({ timeout: 10000 });
        await postsButton.click();

        console.log('✅ Clicked Posts button');
      });

      testBase.allure.step('Verify Posts screen loaded', async () => {
        // Wait for posts screen
        await postsPage.waitForScreen();
        console.log('✅ Posts screen loaded');

        // Verify header
        const headerExists = await postsPage.verifyHeader();
        if (!headerExists) {
          throw new Error('Posts header not found');
        }
        console.log('✅ Posts header verified');
      });

      testBase.allure.step('Verify API data loaded', async () => {
        // Wait for posts list to load (with API data)
        await testBase.driver.pause(3000); // Give time for API call

        // Check if loading or posts list is displayed
        const loadingVisible = await postsPage.isLoading();
        const errorVisible = await postsPage.hasError();

        if (loadingVisible) {
          console.log('⏳ Loading posts from API...');
          // Wait for loading to finish
          await testBase.driver.waitUntil(
            async () => !(await postsPage.isLoading()),
            {
              timeout: 15000,
              timeoutMsg: 'Timed out waiting for posts to load',
            }
          );
        }

        if (errorVisible) {
          const errorMessage = await postsPage.getErrorMessage();
          console.error('❌ API Error:', errorMessage);
          throw new Error(`Failed to load posts: ${errorMessage}`);
        }

        console.log('✅ Posts loaded from API');
      });

      testBase.allure.step('Verify posts list', async () => {
        // Get posts count
        const count = await postsPage.getPostsCount();
        console.log(`📊 Found ${count} posts`);

        if (count === 0) {
          throw new Error('No posts found in list');
        }

        // Verify first post card
        const firstPostExists = await postsPage.verifyPostCard(1);
        if (!firstPostExists) {
          throw new Error('First post card not found');
        }

        console.log('✅ Posts list verified');
      });

      testBase.allure.step('Test refresh functionality', async () => {
        // Click refresh button
        await postsPage.clickRefresh();
        console.log('🔄 Clicked refresh button');

        // Wait for refresh to complete
        await testBase.driver.pause(2000);

        // Verify still showing posts
        const count = await postsPage.getPostsCount();
        console.log(`📊 After refresh: ${count} posts`);

        if (count === 0) {
          throw new Error('Posts list empty after refresh');
        }

        console.log('✅ Refresh functionality verified');
      });

      testBase.allure.step('Navigate back to home', async () => {
        await postsPage.clickBack();
        console.log('✅ Navigated back to home');
      });

      console.log('\n✅ Posts API test passed!\n');
    },
    'posts-api-test'
  );
}

// Run the test
runPostsTest()
  .then(() => {
    console.log('✅ Test suite completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
