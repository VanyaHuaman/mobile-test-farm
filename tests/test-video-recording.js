#!/usr/bin/env node

/**
 * Test Video Recording Feature
 *
 * This script tests the video recording functionality on both platforms
 * It creates intentional test failures to verify video recording on failure
 */

const TestBase = require('./helpers/TestBase');
const LoginPage = require('./pages/LoginPage');
const config = require('../config/test.config');
const fs = require('fs');
const path = require('path');

// Enable video recording
process.env.VIDEOS_ON_FAILURE = 'true';

const TESTS = [
  {
    name: 'Android - Passing Test (No Video)',
    deviceId: 'android-emulator-1',
    shouldFail: false,
    appConfig: {
      'appium:app': config.apps.android.debug,
      'appium:appPackage': config.appInfo.android.package,
      'appium:appActivity': config.appInfo.android.activity,
    },
  },
  {
    name: 'Android - Failing Test (With Video)',
    deviceId: 'android-emulator-1',
    shouldFail: true,
    appConfig: {
      'appium:app': config.apps.android.debug,
      'appium:appPackage': config.appInfo.android.package,
      'appium:appActivity': config.appInfo.android.activity,
    },
  },
  {
    name: 'iOS - Passing Test (No Video)',
    deviceId: 'iphone-16-pro-simulator',
    shouldFail: false,
    appConfig: {
      'appium:app': config.apps.ios.simulator,
      'appium:bundleId': config.appInfo.ios.bundleId,
    },
  },
  {
    name: 'iOS - Failing Test (With Video)',
    deviceId: 'iphone-16-pro-simulator',
    shouldFail: true,
    appConfig: {
      'appium:app': config.apps.ios.simulator,
      'appium:bundleId': config.appInfo.ios.bundleId,
    },
  },
];

async function runSingleTest(test) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🧪 Running: ${test.name}`);
  console.log(`${'='.repeat(70)}\n`);

  const testBase = new TestBase();
  let passed = false;

  try {
    await testBase.runTest(
      test.deviceId,
      test.appConfig,
      async () => {
        const { driver } = testBase;
        const platform = testBase.getPlatform();
        const loginPage = new LoginPage(driver, platform);

        console.log('✅ App launched');
        await loginPage.pause(2000);

        console.log('🔍 Waiting for login page');
        await loginPage.waitForPageLoad();

        if (test.shouldFail) {
          console.log('🔥 Intentionally failing test to trigger video recording...');
          throw new Error('Intentional test failure to verify video recording');
        }

        console.log('✅ Test passed');
      },
      `video-test-${test.shouldFail ? 'fail' : 'pass'}`
    );

    passed = true;
    console.log(`\n✅ ${test.name} - PASSED`);
  } catch (error) {
    if (test.shouldFail) {
      console.log(`\n✅ ${test.name} - FAILED AS EXPECTED`);
      console.log(`   Error: ${error.message}`);
      passed = true;  // Expected failure
    } else {
      console.error(`\n❌ ${test.name} - UNEXPECTED FAILURE`);
      console.error(`   Error: ${error.message}`);
      passed = false;
    }
  }

  return { test: test.name, passed };
}

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🎥 VIDEO RECORDING FEATURE TEST');
  console.log('='.repeat(70));
  console.log('\nThis test verifies video recording works correctly:');
  console.log('- Passing tests: No video should be created');
  console.log('- Failing tests: Video should be created and saved');
  console.log('\nVideo directory: ./videos/');
  console.log('='.repeat(70));

  // Clear existing videos for clean test
  const videosDir = path.join(__dirname, '../videos');
  if (fs.existsSync(videosDir)) {
    const files = fs.readdirSync(videosDir).filter(f => f.endsWith('.mp4'));
    console.log(`\n🗑️  Cleaning up ${files.length} existing video(s)...`);
    files.forEach(file => fs.unlinkSync(path.join(videosDir, file)));
  } else {
    fs.mkdirSync(videosDir, { recursive: true });
  }

  const results = [];

  // Run tests sequentially
  for (const test of TESTS) {
    const result = await runSingleTest(test);
    results.push(result);

    // Wait between tests
    console.log('\n⏸️  Waiting 5 seconds before next test...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Check videos directory
  console.log('\n' + '='.repeat(70));
  console.log('📹 VIDEO RECORDING RESULTS');
  console.log('='.repeat(70));

  const videoFiles = fs.readdirSync(videosDir).filter(f => f.endsWith('.mp4'));
  console.log(`\n✅ Found ${videoFiles.length} video file(s) in ./videos/`);

  if (videoFiles.length > 0) {
    console.log('\nVideo files:');
    videoFiles.forEach(file => {
      const filePath = path.join(videosDir, file);
      const stats = fs.statSync(filePath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`  - ${file} (${sizeMB} MB)`);
    });
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('TEST SUMMARY');
  console.log('='.repeat(70));

  results.forEach(result => {
    const status = result.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status}: ${result.test}`);
  });

  const allPassed = results.every(r => r.passed);
  const expectedVideos = TESTS.filter(t => t.shouldFail).length;

  console.log('\n' + '='.repeat(70));
  console.log('VERIFICATION');
  console.log('='.repeat(70));
  console.log(`Expected ${expectedVideos} video(s) for failing tests`);
  console.log(`Found ${videoFiles.length} video(s)`);

  if (videoFiles.length === expectedVideos && allPassed) {
    console.log('\n🎉 VIDEO RECORDING TEST PASSED!');
    console.log('✅ All tests behaved as expected');
    console.log('✅ Videos created only for failing tests');
    process.exit(0);
  } else {
    console.log('\n❌ VIDEO RECORDING TEST FAILED!');
    if (videoFiles.length !== expectedVideos) {
      console.log(`❌ Expected ${expectedVideos} videos, found ${videoFiles.length}`);
    }
    if (!allPassed) {
      console.log('❌ Some tests did not behave as expected');
    }
    process.exit(1);
  }
}

// Run main
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
