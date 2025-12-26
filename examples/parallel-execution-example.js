/**
 * Parallel Execution Examples
 *
 * Demonstrates how to run tests in parallel across local and cloud devices
 */

const DeviceManager = require('../lib/device-manager');
const ParallelTestRunner = require('../lib/ParallelTestRunner');
const path = require('path');

// Example 1: Run on all local devices
async function example1_AllLocalDevices() {
  console.log('\n' + '='.repeat(80));
  console.log('Example 1: Run on All Local Devices');
  console.log('='.repeat(80));

  const deviceManager = new DeviceManager();
  const runner = new ParallelTestRunner(deviceManager);

  const localDevices = deviceManager.getActiveDeviceIds();
  const testFile = path.join(__dirname, '../tests/specs/login.spec.js');

  const results = await runner.runOnDevices(localDevices, testFile);

  console.log(`\nCompleted ${results.length} tests`);
}

// Example 2: Run on specific devices (mixed local + cloud)
async function example2_MixedDevices() {
  console.log('\n' + '='.repeat(80));
  console.log('Example 2: Mixed Local + Cloud Devices');
  console.log('='.repeat(80));

  const deviceManager = new DeviceManager();
  const runner = new ParallelTestRunner(deviceManager);

  const devices = [
    'android-emulator-1',              // Local
    'iphone-16-pro-simulator',         // Local
    'browserstack-iPhone-15-Pro',      // Cloud - BrowserStack
    'saucelabs-Google-Pixel-8',        // Cloud - Sauce Labs
  ];

  const testFile = path.join(__dirname, '../tests/specs/form.spec.js');

  const results = await runner.runOnDevices(devices, testFile);

  console.log(`\nCompleted ${results.length} tests`);
}

// Example 3: Hybrid mode with concurrency limit
async function example3_HybridWithConcurrency() {
  console.log('\n' + '='.repeat(80));
  console.log('Example 3: Hybrid Mode with Concurrency Control');
  console.log('='.repeat(80));

  const deviceManager = new DeviceManager();
  const runner = new ParallelTestRunner(deviceManager);

  const localDevices = deviceManager.getActiveDeviceIds();
  const cloudDevices = await deviceManager.discoverCloudDevices();

  const allDevices = [
    ...localDevices,
    ...cloudDevices.slice(0, 3).map(d => d.id), // Limit cloud devices for cost
  ];

  const testFile = path.join(__dirname, '../tests/specs/login.spec.js');

  // Run with max 5 concurrent tests
  const results = await runner.runWithConcurrency(allDevices, testFile, {
    maxConcurrent: 5,
  });

  console.log(`\nCompleted ${results.length} tests`);
}

// Example 4: Event-driven execution with monitoring
async function example4_EventDriven() {
  console.log('\n' + '='.repeat(80));
  console.log('Example 4: Event-Driven Execution with Real-time Monitoring');
  console.log('='.repeat(80));

  const deviceManager = new DeviceManager();
  const runner = new ParallelTestRunner(deviceManager);

  // Set up event listeners
  runner.on('start', ({ deviceIds }) => {
    console.log(`\n🚀 Started parallel execution on ${deviceIds.length} devices`);
  });

  runner.on('testStart', ({ deviceId }) => {
    console.log(`   ▶️  Starting test on ${deviceId}...`);
  });

  runner.on('testComplete', ({ deviceId, success, duration }) => {
    const icon = success ? '✅' : '❌';
    console.log(`   ${icon} ${deviceId} - ${duration}ms`);
  });

  runner.on('complete', ({ summary }) => {
    console.log(`\n📊 All tests completed!`);
    console.log(`   Success Rate: ${summary.successRate}%`);
    console.log(`   Total Duration: ${summary.duration}ms`);
  });

  const devices = deviceManager.getActiveDeviceIds();
  const testFile = path.join(__dirname, '../tests/specs/login.spec.js');

  await runner.runOnDevices(devices, testFile);
}

// Example 5: Cloud-only execution by provider
async function example5_CloudByProvider() {
  console.log('\n' + '='.repeat(80));
  console.log('Example 5: Cloud-Only Execution (BrowserStack)');
  console.log('='.repeat(80));

  const deviceManager = new DeviceManager();
  const runner = new ParallelTestRunner(deviceManager);

  const cloudDevices = await deviceManager.discoverCloudDevices();

  // Filter for BrowserStack devices only
  const browserstackDevices = cloudDevices
    .filter(d => d.provider === 'browserstack')
    .slice(0, 5)  // Limit for cost control
    .map(d => d.id);

  if (browserstackDevices.length === 0) {
    console.log('⚠️  No BrowserStack devices available');
    return;
  }

  const testFile = path.join(__dirname, '../tests/specs/login.spec.js');

  const results = await runner.runOnDevices(browserstackDevices, testFile);

  console.log(`\nCompleted ${results.length} tests on BrowserStack`);
}

// Example 6: Graceful shutdown on interrupt
async function example6_GracefulShutdown() {
  console.log('\n' + '='.repeat(80));
  console.log('Example 6: Graceful Shutdown (Try Ctrl+C during execution)');
  console.log('='.repeat(80));

  const deviceManager = new DeviceManager();
  const runner = new ParallelTestRunner(deviceManager);

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n⚠️  Interrupt received, stopping all tests...');
    runner.stopAll();
    process.exit(0);
  });

  const devices = deviceManager.getActiveDeviceIds();
  const testFile = path.join(__dirname, '../tests/specs/login.spec.js');

  await runner.runOnDevices(devices, testFile);
}

// Main menu
async function main() {
  const examples = {
    '1': { name: 'All Local Devices', fn: example1_AllLocalDevices },
    '2': { name: 'Mixed Local + Cloud', fn: example2_MixedDevices },
    '3': { name: 'Hybrid with Concurrency', fn: example3_HybridWithConcurrency },
    '4': { name: 'Event-Driven Monitoring', fn: example4_EventDriven },
    '5': { name: 'Cloud by Provider', fn: example5_CloudByProvider },
    '6': { name: 'Graceful Shutdown', fn: example6_GracefulShutdown },
  };

  const arg = process.argv[2];

  if (!arg || !examples[arg]) {
    console.log('\nParallel Execution Examples\n');
    console.log('Usage: node parallel-execution-example.js <example-number>\n');
    console.log('Available Examples:');
    Object.entries(examples).forEach(([num, { name }]) => {
      console.log(`  ${num} - ${name}`);
    });
    console.log('');
    return;
  }

  try {
    await examples[arg].fn();
  } catch (error) {
    console.error('\n❌ Example failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  example1_AllLocalDevices,
  example2_MixedDevices,
  example3_HybridWithConcurrency,
  example4_EventDriven,
  example5_CloudByProvider,
  example6_GracefulShutdown,
};
