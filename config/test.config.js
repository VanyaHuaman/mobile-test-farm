const path = require('path');
const os = require('os');

/**
 * Central Test Configuration
 *
 * This file contains all configuration settings for the mobile test farm.
 * Environment variables can override these defaults.
 */

const config = {
  // Appium Server Settings
  appium: {
    host: process.env.APPIUM_HOST || 'localhost',
    port: parseInt(process.env.APPIUM_PORT || '4723', 10),
    path: process.env.APPIUM_PATH || '/',
    protocol: process.env.APPIUM_PROTOCOL || 'http',
  },

  // Test Timeout Settings (in milliseconds)
  timeouts: {
    implicit: parseInt(process.env.IMPLICIT_WAIT || '5000', 10),        // Default element wait
    explicit: parseInt(process.env.EXPLICIT_WAIT || '10000', 10),       // Explicit waits
    pageLoad: parseInt(process.env.PAGE_LOAD_TIMEOUT || '30000', 10),   // Page load timeout
    script: parseInt(process.env.SCRIPT_TIMEOUT || '30000', 10),        // Script execution
  },

  // Application Paths
  // Points to the native Android Compose example app
  apps: {
    android: {
      debug: process.env.ANDROID_APP_DEBUG ||
             path.join(__dirname, '../examples/native-android-app/app/build/outputs/apk/debug/app-debug.apk'),
      release: process.env.ANDROID_APP_RELEASE || '',
    },
    ios: {
      simulator: process.env.IOS_APP_SIMULATOR ||
                 path.join(os.homedir(), 'Library/Developer/Xcode/DerivedData/YourApp-xxx/Build/Products/Debug-iphonesimulator/YourApp.app'),
      device: process.env.IOS_APP_DEVICE || '',
    },
  },

  // App Package/Bundle Information
  // Native Android Compose app package info
  appInfo: {
    android: {
      package: process.env.ANDROID_PACKAGE || 'com.example.nativecomposeapp',
      activity: process.env.ANDROID_ACTIVITY || '.MainActivity',
    },
    ios: {
      bundleId: process.env.IOS_BUNDLE_ID || 'com.yourcompany.yourapp',
    },
  },

  // Test Credentials
  testUsers: {
    default: {
      username: process.env.TEST_USERNAME || 'demo',
      password: process.env.TEST_PASSWORD || 'password123',
    },
  },

  // Screenshot Settings
  screenshots: {
    enabled: process.env.SCREENSHOTS_ENABLED !== 'false',
    onFailure: process.env.SCREENSHOTS_ON_FAILURE !== 'false',
    path: process.env.SCREENSHOTS_PATH || path.join(__dirname, '../screenshots'),
  },

  // Video Recording Settings
  videos: {
    enabled: process.env.VIDEOS_ENABLED === 'true',
    onFailure: process.env.VIDEOS_ON_FAILURE !== 'false',  // Record only on failure (default)
    quality: process.env.VIDEO_QUALITY || 'medium',        // low, medium, high
    path: process.env.VIDEOS_PATH || path.join(__dirname, '../videos'),
    maxVideos: parseInt(process.env.MAX_VIDEOS || '10', 10), // Keep last N videos
  },

  // API Mocking Settings (Mockoon CLI)
  mocking: {
    enabled: process.env.MOCKOON_ENABLED === 'true',
    port: parseInt(process.env.MOCKOON_PORT || '3001', 10),
    mockFile: process.env.MOCKOON_MOCK_FILE || path.join(__dirname, '../mocks/environments/jsonplaceholder-simple.json'),
    proxyUrl: process.env.MOCKOON_PROXY_URL || '',  // Empty = no proxy, or 'https://api.example.com'
    saveLogsOnFailure: process.env.MOCKOON_SAVE_LOGS_ON_FAILURE !== 'false',
    verbose: process.env.MOCKOON_VERBOSE === 'true',
    recordingsPath: process.env.MOCKOON_RECORDINGS_PATH || path.join(__dirname, '../mocks/recordings'),
  },

  // Logging Settings
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    verbose: process.env.VERBOSE === 'true',
    timestamps: process.env.LOG_TIMESTAMPS !== 'false',
  },

  // Device Registry
  devices: {
    registryPath: path.join(__dirname, 'devices.json'),
  },

  // Test Behavior
  behavior: {
    noReset: process.env.NO_RESET === 'true',           // Don't reset app state between tests
    fullReset: process.env.FULL_RESET === 'true',       // Full app reinstall
    autoAcceptAlerts: process.env.AUTO_ACCEPT_ALERTS === 'true',
    autoDismissAlerts: process.env.AUTO_DISMISS_ALERTS === 'true',
  },

  // Performance Settings
  performance: {
    newCommandTimeout: parseInt(process.env.NEW_COMMAND_TIMEOUT || '60', 10) * 1000,
    waitForIdleTimeout: parseInt(process.env.WAIT_FOR_IDLE || '10', 10) * 1000,
  },
};

module.exports = config;
