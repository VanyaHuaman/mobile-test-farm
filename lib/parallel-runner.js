const { Worker } = require('worker_threads');
const path = require('path');
const fs = require('fs');
const DeviceManager = require('./device-manager');

/**
 * ParallelTestRunner - Execute tests across multiple devices in parallel
 *
 * Features:
 * - Concurrent test execution
 * - Device pool management
 * - Result aggregation
 * - Error handling and reporting
 */
class ParallelTestRunner {
  constructor() {
    this.deviceManager = new DeviceManager();
    this.results = [];
    this.activeWorkers = new Map();
  }

  /**
   * Run tests in parallel across specified devices
   * @param {string} testFile - Path to test file to run
   * @param {Array<string>} deviceIds - Array of device IDs or friendly names
   * @param {Object} options - Test options
   * @returns {Promise<Object>} - Test results
   */
  async runTestsInParallel(testFile, deviceIds, options = {}) {
    const startTime = Date.now();

    console.log('\n🚀 Starting Parallel Test Execution');
    console.log('━'.repeat(60));
    console.log(`📄 Test File: ${path.basename(testFile)}`);
    console.log(`📱 Devices: ${deviceIds.length}`);
    console.log('━'.repeat(60));
    console.log('');

    // Validate test file exists
    if (!fs.existsSync(testFile)) {
      throw new Error(`Test file not found: ${testFile}`);
    }

    // Validate devices exist
    const devices = deviceIds.map(id => {
      const device = this.deviceManager.getDevice(id);
      if (!device) {
        throw new Error(`Device '${id}' not found in registry`);
      }
      return { id, device };
    });

    // Print device allocation
    console.log('📱 Device Allocation:');
    devices.forEach(({ id, device }) => {
      console.log(`   • ${device.friendlyName} (${device.platform})`);
    });
    console.log('');

    // Run tests in parallel using worker threads
    const workerPromises = devices.map(({ id, device }) =>
      this.runTestOnDevice(testFile, id, device, options)
    );

    // Wait for all tests to complete
    const results = await Promise.allSettled(workerPromises);

    // Calculate summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    const summary = this.generateSummary(results, devices, duration);
    this.printSummary(summary);

    return summary;
  }

  /**
   * Run test on a specific device using child process
   * @param {string} testFile - Test file path
   * @param {string} deviceId - Device ID
   * @param {Object} device - Device object
   * @param {Object} options - Test options
   * @returns {Promise<Object>} - Test result
   */
  async runTestOnDevice(testFile, deviceId, device, options) {
    const { spawn } = require('child_process');
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      console.log(`🏁 [${device.friendlyName}] Starting test...`);

      // Spawn child process to run test
      const testProcess = spawn('node', [testFile, deviceId], {
        cwd: process.cwd(),
        env: { ...process.env, FORCE_COLOR: '1' },
        stdio: options.showOutput ? 'inherit' : 'pipe',
      });

      let stdout = '';
      let stderr = '';

      // Capture output if not showing live
      if (!options.showOutput) {
        testProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        testProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });
      }

      testProcess.on('close', (code) => {
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        const result = {
          deviceId,
          deviceName: device.friendlyName,
          platform: device.platform,
          success: code === 0,
          exitCode: code,
          duration,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        };

        if (code === 0) {
          console.log(`✅ [${device.friendlyName}] Test passed (${duration}s)`);
          resolve(result);
        } else {
          console.log(`❌ [${device.friendlyName}] Test failed (${duration}s)`);
          resolve(result); // Resolve anyway to not fail entire suite
        }
      });

      testProcess.on('error', (error) => {
        console.log(`❌ [${device.friendlyName}] Process error: ${error.message}`);
        resolve({
          deviceId,
          deviceName: device.friendlyName,
          platform: device.platform,
          success: false,
          error: error.message,
          duration: 0,
        });
      });
    });
  }

  /**
   * Generate test summary
   * @param {Array} results - Test results
   * @param {Array} devices - Device information
   * @param {string} duration - Total duration
   * @returns {Object} - Summary object
   */
  generateSummary(results, devices, duration) {
    const summary = {
      totalTests: results.length,
      passed: 0,
      failed: 0,
      duration,
      results: [],
    };

    results.forEach((result, index) => {
      const { id, device } = devices[index];

      if (result.status === 'fulfilled' && result.value.success) {
        summary.passed++;
        summary.results.push({
          device: device.friendlyName,
          platform: device.platform,
          status: 'passed',
          duration: result.value.duration,
        });
      } else {
        summary.failed++;
        const error = result.status === 'rejected'
          ? result.reason.message
          : result.value.error || 'Test failed';

        summary.results.push({
          device: device.friendlyName,
          platform: device.platform,
          status: 'failed',
          duration: result.value?.duration || 0,
          error,
        });
      }
    });

    return summary;
  }

  /**
   * Print test summary
   * @param {Object} summary - Test summary
   */
  printSummary(summary) {
    console.log('\n');
    console.log('━'.repeat(60));
    console.log('📊 Test Summary');
    console.log('━'.repeat(60));
    console.log('');

    // Results by device
    summary.results.forEach(result => {
      const icon = result.status === 'passed' ? '✅' : '❌';
      const status = result.status === 'passed' ? 'PASSED' : 'FAILED';
      console.log(`${icon} ${result.device} (${result.platform}): ${status} (${result.duration}s)`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log('');
    console.log('━'.repeat(60));

    // Overall statistics
    const passRate = ((summary.passed / summary.totalTests) * 100).toFixed(0);
    console.log(`Total: ${summary.totalTests} | Passed: ${summary.passed} | Failed: ${summary.failed} | Pass Rate: ${passRate}%`);
    console.log(`Total Duration: ${summary.duration}s`);

    console.log('━'.repeat(60));
    console.log('');

    // Overall result
    if (summary.failed === 0) {
      console.log('🎉 All tests passed!\n');
    } else {
      console.log(`⚠️  ${summary.failed} test(s) failed\n`);
    }
  }

  /**
   * Get all available devices for parallel testing
   * @returns {Array<string>} - Array of device IDs
   */
  getAllDevices() {
    return this.deviceManager.getAllDeviceIds();
  }

  /**
   * Get devices by platform
   * @param {string} platform - Platform (ios/android)
   * @returns {Array<string>} - Array of device IDs
   */
  getDevicesByPlatform(platform) {
    return this.deviceManager.getDevicesByPlatform(platform);
  }
}

module.exports = ParallelTestRunner;
