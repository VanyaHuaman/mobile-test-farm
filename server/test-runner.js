/**
 * Test Runner - Manages test execution and reporting
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Simple UUID v4 generator (no external dependencies)
function uuidv4() {
  return crypto.randomUUID();
}

class TestRunner {
  constructor(io) {
    this.io = io; // Socket.IO instance for live updates
    this.testRuns = new Map(); // Store test run information
    this.activeProcesses = new Map(); // Store running processes
  }

  /**
   * Get available test suites
   */
  getAvailableSuites() {
    return [
      {
        id: 'login',
        name: 'Login Test Suite',
        description: 'Tests login functionality with valid and invalid credentials',
        script: 'test:login:pom',
        estimatedDuration: '30s',
      },
      {
        id: 'form',
        name: 'Form Test Suite',
        description: 'Tests form filling, validation, and submission',
        script: 'test:form',
        estimatedDuration: '45s',
      },
      {
        id: 'list',
        name: 'List Test Suite',
        description: 'Tests list filtering, item interaction, and navigation',
        script: 'test:list',
        estimatedDuration: '60s',
      },
      {
        id: 'profile',
        name: 'Profile Test Suite',
        description: 'Tests profile display and settings navigation',
        script: 'test:profile',
        estimatedDuration: '40s',
      },
      {
        id: 'navigation',
        name: 'Navigation Test Suite',
        description: 'Tests complete app navigation flow',
        script: 'test:navigation',
        estimatedDuration: '90s',
      },
      {
        id: 'all',
        name: 'All Test Suites',
        description: 'Run all test suites sequentially',
        script: 'test:suite:all',
        estimatedDuration: '4m',
      },
    ];
  }

  /**
   * Start a test execution
   */
  startTest(suiteId, devices = [], config = {}) {
    const runId = uuidv4();
    const suite = this.getAvailableSuites().find(s => s.id === suiteId);

    if (!suite) {
      throw new Error(`Test suite not found: ${suiteId}`);
    }

    const testRun = {
      id: runId,
      suite: suite.id,
      suiteName: suite.name,
      devices: devices.length > 0 ? devices : ['default'],
      status: 'running',
      startTime: new Date(),
      endTime: null,
      duration: null,
      output: [],
      result: null,
      config,
    };

    this.testRuns.set(runId, testRun);

    // Broadcast test start
    this.io.emit('test:started', testRun);

    // Execute test
    this._executeTest(runId, suite, devices, config);

    return runId;
  }

  /**
   * Execute test in background
   */
  _executeTest(runId, suite, devices, config) {
    const testRun = this.testRuns.get(runId);
    const executionMode = config.executionMode || 'sequential';

    // Single device or default
    if (devices.length <= 1 || devices[0] === 'default') {
      this._executeSingleDeviceTest(runId, suite, devices, config);
      return;
    }

    // Multiple devices - check execution mode
    if (executionMode === 'parallel') {
      this._executeParallelTest(runId, suite, devices, config);
    } else {
      // Sequential execution (default)
      this._executeMultiDeviceTest(runId, suite, devices, config, 0);
    }
  }

  /**
   * Execute test on a single device
   */
  _executeSingleDeviceTest(runId, suite, devices, config, deviceIndex = 0) {
    const testRun = this.testRuns.get(runId);
    const projectRoot = path.join(__dirname, '..');

    // Build command
    let command = 'npm';
    let args = ['run', suite.script];

    // Add device argument if specified
    if (devices.length > 0 && devices[0] !== 'default') {
      args.push('--');
      args.push(devices[0]);
    }

    const deviceLabel = devices[0] !== 'default' ? ` on device: ${devices[0]}` : '';
    console.log(`Executing: ${command} ${args.join(' ')}${deviceLabel}`);

    // Spawn process
    const childProcess = spawn(command, args, {
      cwd: projectRoot,
      env: { ...process.env, ...config.env },
    });

    this.activeProcesses.set(runId, childProcess);

    // Capture stdout
    childProcess.stdout.on('data', (data) => {
      const output = data.toString();
      testRun.output.push({
        type: 'stdout',
        timestamp: new Date(),
        text: output,
      });

      // Broadcast output to clients
      this.io.emit('test:output', {
        runId,
        type: 'stdout',
        text: output,
      });
    });

    // Capture stderr
    childProcess.stderr.on('data', (data) => {
      const output = data.toString();
      testRun.output.push({
        type: 'stderr',
        timestamp: new Date(),
        text: output,
      });

      // Broadcast output to clients
      this.io.emit('test:output', {
        runId,
        type: 'stderr',
        text: output,
      });
    });

    // Handle process completion
    childProcess.on('close', (code) => {
      testRun.status = code === 0 ? 'passed' : 'failed';
      testRun.endTime = new Date();
      testRun.duration = testRun.endTime - testRun.startTime;
      testRun.exitCode = code;

      this.activeProcesses.delete(runId);

      // Broadcast test completion
      this.io.emit('test:completed', testRun);

      const deviceLabel = devices[0] !== 'default' ? ` on device: ${devices[0]}` : '';
      console.log(`Test run ${runId} completed with code ${code}${deviceLabel}`);
    });

    // Handle process errors
    childProcess.on('error', (error) => {
      testRun.status = 'error';
      testRun.endTime = new Date();
      testRun.duration = testRun.endTime - testRun.startTime;
      testRun.error = error.message;

      this.activeProcesses.delete(runId);

      // Broadcast test error
      this.io.emit('test:error', {
        runId,
        error: error.message,
      });

      console.error(`Test run ${runId} error:`, error);
    });
  }

  /**
   * Execute tests sequentially on multiple devices
   */
  _executeMultiDeviceTest(runId, suite, devices, config, deviceIndex) {
    const testRun = this.testRuns.get(runId);
    const projectRoot = path.join(__dirname, '..');

    // Check if we've completed all devices
    if (deviceIndex >= devices.length) {
      testRun.status = 'passed';
      testRun.endTime = new Date();
      testRun.duration = testRun.endTime - testRun.startTime;
      this.io.emit('test:completed', testRun);
      console.log(`Multi-device test run ${runId} completed all ${devices.length} devices`);
      return;
    }

    const currentDevice = devices[deviceIndex];
    const command = 'npm';
    const args = ['run', suite.script, '--', currentDevice];

    console.log(`[${deviceIndex + 1}/${devices.length}] Executing: ${command} ${args.join(' ')}`);

    // Add separator in output
    const separator = `\n${'='.repeat(70)}\n[${deviceIndex + 1}/${devices.length}] Testing on device: ${currentDevice}\n${'='.repeat(70)}\n`;
    testRun.output.push({
      type: 'stdout',
      timestamp: new Date(),
      text: separator,
    });
    this.io.emit('test:output', {
      runId,
      type: 'stdout',
      text: separator,
    });

    // Spawn process for current device
    const childProcess = spawn(command, args, {
      cwd: projectRoot,
      env: { ...process.env, ...config.env },
    });

    this.activeProcesses.set(runId, childProcess);

    // Capture stdout
    childProcess.stdout.on('data', (data) => {
      const output = data.toString();
      testRun.output.push({
        type: 'stdout',
        timestamp: new Date(),
        text: output,
      });
      this.io.emit('test:output', {
        runId,
        type: 'stdout',
        text: output,
      });
    });

    // Capture stderr
    childProcess.stderr.on('data', (data) => {
      const output = data.toString();
      testRun.output.push({
        type: 'stderr',
        timestamp: new Date(),
        text: output,
      });
      this.io.emit('test:output', {
        runId,
        type: 'stderr',
        text: output,
      });
    });

    // Handle process completion - move to next device
    childProcess.on('close', (code) => {
      this.activeProcesses.delete(runId);

      if (code !== 0) {
        // Test failed on this device
        testRun.status = 'failed';
        testRun.endTime = new Date();
        testRun.duration = testRun.endTime - testRun.startTime;
        testRun.exitCode = code;
        this.io.emit('test:completed', testRun);
        console.log(`Multi-device test run ${runId} failed on device ${currentDevice} (${deviceIndex + 1}/${devices.length})`);
        return;
      }

      console.log(`Device ${currentDevice} (${deviceIndex + 1}/${devices.length}) completed successfully`);

      // Move to next device
      this._executeMultiDeviceTest(runId, suite, devices, config, deviceIndex + 1);
    });

    // Handle process errors
    childProcess.on('error', (error) => {
      testRun.status = 'error';
      testRun.endTime = new Date();
      testRun.duration = testRun.endTime - testRun.startTime;
      testRun.error = error.message;
      this.activeProcesses.delete(runId);
      this.io.emit('test:error', {
        runId,
        error: error.message,
      });
      console.error(`Multi-device test run ${runId} error on device ${currentDevice}:`, error);
    });
  }

  /**
   * Execute tests in parallel across multiple devices
   */
  _executeParallelTest(runId, suite, devices, config) {
    const testRun = this.testRuns.get(runId);
    const projectRoot = path.join(__dirname, '..');

    console.log(`Starting parallel execution on ${devices.length} devices`);

    // Add header to output
    const header = `\n${'='.repeat(70)}\nParallel Test Execution on ${devices.length} devices\n${'='.repeat(70)}\n`;
    testRun.output.push({
      type: 'stdout',
      timestamp: new Date(),
      text: header,
    });
    this.io.emit('test:output', {
      runId,
      type: 'stdout',
      text: header,
    });

    // Spawn a process for each device
    const processes = [];
    const deviceResults = new Map();

    devices.forEach((device, index) => {
      const command = 'npm';
      const args = ['run', suite.script, '--', device];

      console.log(`[${index + 1}/${devices.length}] Spawning: ${command} ${args.join(' ')}`);

      const childProcess = spawn(command, args, {
        cwd: projectRoot,
        env: { ...process.env, ...config.env },
      });

      processes.push({ device, process: childProcess, index });
      deviceResults.set(device, { status: 'running', output: [] });

      // Capture stdout with device prefix
      childProcess.stdout.on('data', (data) => {
        const output = data.toString();
        const prefixedOutput = `[${device}] ${output}`;

        testRun.output.push({
          type: 'stdout',
          timestamp: new Date(),
          text: prefixedOutput,
        });

        this.io.emit('test:output', {
          runId,
          type: 'stdout',
          text: prefixedOutput,
        });

        deviceResults.get(device).output.push(output);
      });

      // Capture stderr with device prefix
      childProcess.stderr.on('data', (data) => {
        const output = data.toString();
        const prefixedOutput = `[${device}] ${output}`;

        testRun.output.push({
          type: 'stderr',
          timestamp: new Date(),
          text: prefixedOutput,
        });

        this.io.emit('test:output', {
          runId,
          type: 'stderr',
          text: prefixedOutput,
        });
      });

      // Handle process completion
      childProcess.on('close', (code) => {
        deviceResults.get(device).status = code === 0 ? 'passed' : 'failed';
        deviceResults.get(device).exitCode = code;

        console.log(`[${index + 1}/${devices.length}] Device ${device} completed with code ${code}`);

        // Check if all processes have completed
        const allCompleted = Array.from(deviceResults.values()).every(r => r.status !== 'running');

        if (allCompleted) {
          // All tests finished
          const allPassed = Array.from(deviceResults.values()).every(r => r.status === 'passed');

          testRun.status = allPassed ? 'passed' : 'failed';
          testRun.endTime = new Date();
          testRun.duration = testRun.endTime - testRun.startTime;
          testRun.deviceResults = Object.fromEntries(deviceResults);

          this.activeProcesses.delete(runId);
          this.io.emit('test:completed', testRun);

          console.log(`Parallel test run ${runId} completed - ${allPassed ? 'PASSED' : 'FAILED'}`);
        }
      });

      // Handle process errors
      childProcess.on('error', (error) => {
        deviceResults.get(device).status = 'error';
        deviceResults.get(device).error = error.message;

        console.error(`[${index + 1}/${devices.length}] Device ${device} error:`, error);
      });
    });

    // Store all processes
    this.activeProcesses.set(runId, { type: 'parallel', processes });
  }

  /**
   * Stop a running test
   */
  stopTest(runId) {
    const testRun = this.testRuns.get(runId);

    if (!testRun) {
      return null;
    }

    const activeProcess = this.activeProcesses.get(runId);

    if (activeProcess) {
      // Add stop message to output
      const stopMessage = '\n\n⏹️  Test manually stopped by user\n';
      testRun.output.push({
        type: 'stdout',
        timestamp: new Date(),
        text: stopMessage,
      });
      this.io.emit('test:output', {
        runId,
        type: 'stdout',
        text: stopMessage,
      });

      // Check if it's a parallel execution with multiple processes
      if (activeProcess.type === 'parallel' && activeProcess.processes) {
        // Kill all parallel processes
        activeProcess.processes.forEach(({ process, device }) => {
          process.kill('SIGTERM');
          console.log(`Stopped parallel test on device: ${device}`);
        });
      } else {
        // Single process
        activeProcess.kill('SIGTERM');
      }

      testRun.status = 'stopped';
      testRun.endTime = new Date();
      testRun.duration = testRun.endTime - testRun.startTime;

      this.activeProcesses.delete(runId);

      // Broadcast test stop
      this.io.emit('test:stopped', testRun);
    }

    return testRun;
  }

  /**
   * Get all test runs
   */
  getTestRuns() {
    return Array.from(this.testRuns.values()).sort((a, b) => b.startTime - a.startTime);
  }

  /**
   * Get specific test run
   */
  getTestRun(runId) {
    return this.testRuns.get(runId);
  }

  /**
   * Get count of active tests
   */
  getActiveTestCount() {
    return this.activeProcesses.size;
  }

  /**
   * Clear old test runs (keep last 50)
   */
  cleanupOldRuns() {
    const runs = this.getTestRuns();

    if (runs.length > 50) {
      const toDelete = runs.slice(50);
      toDelete.forEach(run => {
        this.testRuns.delete(run.id);
      });
    }
  }
}

module.exports = TestRunner;
