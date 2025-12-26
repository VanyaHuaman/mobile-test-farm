#!/usr/bin/env node

/**
 * Parallel Test Execution CLI
 *
 * Run tests across multiple devices in parallel
 *
 * Usage:
 *   node run-parallel.js <test-file> <device1> <device2> ...
 *   node run-parallel.js tests/specs/login.spec.js android-emulator-1 iphone-16-pro-simulator
 *   node run-parallel.js tests/specs/form.spec.js --all-local
 *   node run-parallel.js tests/specs/login.spec.js --hybrid
 */

const DeviceManager = require('./lib/device-manager');
const ParallelTestRunner = require('./lib/ParallelTestRunner');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const testFile = args[0];
  const deviceManager = new DeviceManager();
  const runner = new ParallelTestRunner(deviceManager);

  // Determine devices to run on
  let deviceIds = [];

  if (args.includes('--all-local')) {
    // Run on all local devices
    deviceIds = deviceManager.getActiveDeviceIds();
    console.log(`📱 Running on all local devices (${deviceIds.length})`);
  } else if (args.includes('--hybrid')) {
    // Run on both local and cloud devices
    const localDevices = deviceManager.getActiveDeviceIds();
    const cloudDevices = await deviceManager.discoverCloudDevices();

    deviceIds = [
      ...localDevices,
      ...cloudDevices.slice(0, 5).map(d => d.id), // Limit cloud to 5 for cost
    ];

    console.log(`🌐 Hybrid mode: ${localDevices.length} local + ${cloudDevices.slice(0, 5).length} cloud`);
  } else if (args.includes('--cloud')) {
    // Run on cloud devices only
    const cloudDevices = await deviceManager.discoverCloudDevices();
    const provider = args.find(arg => arg.startsWith('--provider='))?.split('=')[1];

    if (provider) {
      deviceIds = cloudDevices
        .filter(d => d.provider === provider)
        .slice(0, 10)
        .map(d => d.id);
    } else {
      deviceIds = cloudDevices.slice(0, 10).map(d => d.id);
    }

    console.log(`☁️  Running on cloud devices (${deviceIds.length})`);
  } else {
    // Specific devices provided
    deviceIds = args.slice(1).filter(arg => !arg.startsWith('--'));
  }

  if (deviceIds.length === 0) {
    console.error('❌ No devices specified or found');
    process.exit(1);
  }

  // Verify test file exists
  const fs = require('fs');
  const testPath = path.resolve(testFile);

  if (!fs.existsSync(testPath)) {
    console.error(`❌ Test file not found: ${testFile}`);
    process.exit(1);
  }

  // Set up event listeners
  runner.on('start', ({ deviceIds, testFile }) => {
    console.log(`\n${'═'.repeat(80)}`);
    console.log(`🚀 PARALLEL TEST EXECUTION`);
    console.log(`${'═'.repeat(80)}`);
    console.log(`Test: ${path.basename(testFile)}`);
    console.log(`Devices: ${deviceIds.length}`);
    console.log(`${'═'.repeat(80)}\n`);
  });

  runner.on('testComplete', (result) => {
    // Already logged in runOnDevice
  });

  runner.on('complete', ({ summary }) => {
    // Summary already logged in runOnDevices
  });

  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    console.log('\n\n⚠️  Received interrupt signal...');
    runner.stopAll();
    process.exit(1);
  });

  // Run tests
  try {
    const maxConcurrent = parseInt(args.find(arg => arg.startsWith('--max='))?.split('=')[1] || '10');
    const verbose = args.includes('--verbose') || args.includes('-v');

    const results = await runner.runWithConcurrency(deviceIds, testPath, {
      maxConcurrent,
      verbose,
    });

    // Exit with error if any tests failed
    const hasFailures = results.some(r => !r.success);
    process.exit(hasFailures ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Parallel execution failed:', error.message);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
Parallel Test Execution CLI

Usage:
  node run-parallel.js <test-file> [devices...] [options]

Examples:
  # Run on specific devices
  node run-parallel.js tests/specs/login.spec.js android-emulator-1 iphone-16-pro-simulator

  # Run on all local devices
  node run-parallel.js tests/specs/form.spec.js --all-local

  # Run on local + cloud (hybrid mode)
  node run-parallel.js tests/specs/login.spec.js --hybrid

  # Run on cloud devices only
  node run-parallel.js tests/specs/form.spec.js --cloud

  # Run on specific cloud provider
  node run-parallel.js tests/specs/login.spec.js --cloud --provider=browserstack

Options:
  --all-local           Run on all registered local devices
  --hybrid              Run on both local and cloud devices
  --cloud               Run on cloud devices only
  --provider=<name>     Filter cloud devices by provider (browserstack, saucelabs, aws, firebase)
  --max=<number>        Maximum concurrent tests (default: 10)
  --verbose, -v         Show detailed output from each test
  --help, -h            Show this help message

Device IDs:
  Local:  android-emulator-1, iphone-16-pro-simulator
  Cloud:  browserstack-iPhone-15, saucelabs-Pixel-8, aws-Galaxy-S23, firebase-Pixel-7
`);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main };
