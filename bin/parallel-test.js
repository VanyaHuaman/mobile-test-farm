#!/usr/bin/env node

const path = require('path');
const ParallelTestRunner = require('../lib/parallel-runner');
const DeviceManager = require('../lib/device-manager');

/**
 * CLI for running tests in parallel across multiple devices
 *
 * Usage:
 *   npm run test:parallel <test-file> [device1] [device2] ...
 *   npm run test:parallel:all <test-file>
 *   npm run test:parallel:ios <test-file>
 *   npm run test:parallel:android <test-file>
 */

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printHelp();
    process.exit(0);
  }

  const runner = new ParallelTestRunner();
  const deviceManager = new DeviceManager();

  // Check if command is a test file or a subcommand
  let testFile;
  let deviceIds = [];

  if (command === 'all' || command === 'ios' || command === 'android') {
    // Subcommand mode: npm run test:parallel all <test-file>
    testFile = args[1];

    if (!testFile) {
      console.error('❌ Test file not specified\n');
      printHelp();
      process.exit(1);
    }

    // Get devices based on subcommand
    if (command === 'all') {
      deviceIds = deviceManager.getActiveDeviceIds();
      if (deviceIds.length === 0) {
        deviceIds = deviceManager.getAllDeviceIds();
      }
    } else if (command === 'ios') {
      deviceIds = deviceManager.getDevicesByPlatform('ios');
    } else if (command === 'android') {
      deviceIds = deviceManager.getDevicesByPlatform('android');
    }

    if (deviceIds.length === 0) {
      console.error(`❌ No ${command === 'all' ? '' : command + ' '}devices found in registry`);
      console.log('\n💡 Tip: Register devices using: npm run devices register');
      process.exit(1);
    }
  } else {
    // Direct mode: npm run test:parallel <test-file> <device1> <device2>
    testFile = args[0];
    deviceIds = args.slice(1);

    if (deviceIds.length === 0) {
      console.error('❌ No devices specified\n');
      printHelp();
      process.exit(1);
    }
  }

  // Resolve test file path
  const testFilePath = path.isAbsolute(testFile)
    ? testFile
    : path.join(process.cwd(), testFile);

  // Run tests in parallel
  try {
    const summary = await runner.runTestsInParallel(testFilePath, deviceIds, {
      showOutput: false,
    });

    // Exit with error code if any tests failed
    process.exit(summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Parallel test execution failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
📱 Parallel Test Runner - Run tests across multiple devices simultaneously

Usage:
  npm run test:parallel <test-file> <device1> <device2> ...
  npm run test:parallel:all <test-file>
  npm run test:parallel:ios <test-file>
  npm run test:parallel:android <test-file>

Commands:
  all                  Run on all registered devices
  ios                  Run on all iOS devices
  android              Run on all Android devices

Arguments:
  <test-file>          Path to test file to execute
  <device1> ...        Device IDs or friendly names

Examples:
  # Run on specific devices
  npm run test:parallel tests/specs/login.spec.js "iPhone 16 Pro Simulator" "Android Emulator (Pixel 64)"

  # Run on all devices
  npm run test:parallel:all tests/specs/login.spec.js

  # Run on iOS devices only
  npm run test:parallel:ios tests/specs/login.spec.js

  # Run on Android devices only
  npm run test:parallel:android tests/specs/login.spec.js

  # List available devices
  npm run devices list

Options:
  help, --help, -h     Show this help message

Notes:
  - Tests run in parallel for faster execution
  - Each device runs the test independently
  - Results are aggregated and displayed at the end
  - Screenshots are saved per device on failure
`);
}

// Run CLI
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
