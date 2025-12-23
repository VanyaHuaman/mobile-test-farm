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
    const projectRoot = path.join(__dirname, '..');

    // Build command
    let command = 'npm';
    let args = ['run', suite.script];

    // Add device argument if specified
    if (devices.length > 0 && devices[0] !== 'default') {
      args.push('--');
      args.push(devices.join(','));
    }

    console.log(`Executing: ${command} ${args.join(' ')}`);

    // Spawn process
    const process = spawn(command, args, {
      cwd: projectRoot,
      env: { ...process.env, ...config.env },
    });

    this.activeProcesses.set(runId, process);

    // Capture stdout
    process.stdout.on('data', (data) => {
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
    process.stderr.on('data', (data) => {
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
    process.on('close', (code) => {
      testRun.status = code === 0 ? 'passed' : 'failed';
      testRun.endTime = new Date();
      testRun.duration = testRun.endTime - testRun.startTime;
      testRun.exitCode = code;

      this.activeProcesses.delete(runId);

      // Broadcast test completion
      this.io.emit('test:completed', testRun);

      console.log(`Test run ${runId} completed with code ${code}`);
    });

    // Handle process errors
    process.on('error', (error) => {
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
   * Stop a running test
   */
  stopTest(runId) {
    const testRun = this.testRuns.get(runId);

    if (!testRun) {
      return null;
    }

    const process = this.activeProcesses.get(runId);

    if (process) {
      process.kill('SIGTERM');

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
