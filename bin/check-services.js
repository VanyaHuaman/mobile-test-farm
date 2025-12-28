#!/usr/bin/env node

/**
 * Service Health Check Script
 *
 * Checks if Appium and Dashboard services are running and healthy.
 * Used by npm start to verify all services are ready.
 */

const http = require('http');

const APPIUM_URL = 'http://localhost:4723/status';
const DASHBOARD_URL = 'http://localhost:3000';

/**
 * Make HTTP request to check if service is running
 */
function checkService(url) {
  return new Promise((resolve) => {
    const request = http.get(url, (res) => {
      resolve(res.statusCode === 200);
    });

    request.on('error', () => {
      resolve(false);
    });

    request.setTimeout(2000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

/**
 * Wait for service to become healthy with retry logic
 */
async function waitForService(serviceName, url, maxRetries = 30, retryDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    const isHealthy = await checkService(url);

    if (isHealthy) {
      console.log(`✅ ${serviceName} is ready`);
      return true;
    }

    if (i === 0) {
      console.log(`⏳ Waiting for ${serviceName} to start...`);
    }

    await new Promise(resolve => setTimeout(resolve, retryDelay));
  }

  console.log(`❌ ${serviceName} failed to start after ${maxRetries} seconds`);
  return false;
}

/**
 * Check current status of services
 */
async function checkStatus() {
  console.log('\n🔍 Checking service status...\n');

  const appiumRunning = await checkService(APPIUM_URL);
  const dashboardRunning = await checkService(DASHBOARD_URL);

  if (appiumRunning) {
    console.log('✅ Appium is running (http://localhost:4723)');
  } else {
    console.log('❌ Appium is NOT running');
    console.log('   Start with: npx appium');
  }

  if (dashboardRunning) {
    console.log('✅ Dashboard is running (http://localhost:3000)');
  } else {
    console.log('❌ Dashboard is NOT running');
    console.log('   Start with: npm run dashboard');
  }

  console.log('');

  return appiumRunning && dashboardRunning;
}

/**
 * Wait for all services to be ready (used by npm start)
 */
async function waitForAll() {
  console.log('\n🚀 Mobile Test Farm - Starting Services\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const appiumReady = await waitForService('Appium', APPIUM_URL);
  const dashboardReady = await waitForService('Dashboard', DASHBOARD_URL);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (appiumReady && dashboardReady) {
    console.log('✅ All services are ready!\n');
    console.log('📱 Dashboard: http://localhost:3000');
    console.log('🔌 Appium:    http://localhost:4723\n');
    console.log('Press Ctrl+C to stop all services\n');
    return true;
  } else {
    console.log('❌ Some services failed to start\n');
    console.log('Check the logs above for details\n');
    return false;
  }
}

// Command line interface
const command = process.argv[2] || 'check';

if (command === 'wait') {
  waitForAll().then(success => {
    process.exit(success ? 0 : 1);
  });
} else if (command === 'check') {
  checkStatus().then(success => {
    process.exit(success ? 0 : 1);
  });
} else {
  console.log('Usage: node bin/check-services.js [check|wait]');
  console.log('  check - Check current status of services (default)');
  console.log('  wait  - Wait for services to be ready');
  process.exit(1);
}
