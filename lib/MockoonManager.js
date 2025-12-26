const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * MockoonManager - Manages Mockoon CLI mock servers
 *
 * Features:
 * - Start/stop Mockoon mock servers
 * - Proxy mode to forward unmocked requests to real API
 * - Transaction logging (request/response recording)
 * - Save logs on test failure for debugging
 * - Support multiple mock environments
 */
class MockoonManager {
  constructor(options = {}) {
    this.mockServers = new Map(); // mockId -> process
    this.transactionLogs = new Map(); // mockId -> logs array
    this.recordingsDir = options.recordingsDir || path.join(process.cwd(), 'mocks', 'recordings');
    this.logsEnabled = options.logsEnabled !== false;

    // Ensure recordings directory exists
    if (!fs.existsSync(this.recordingsDir)) {
      fs.mkdirSync(this.recordingsDir, { recursive: true });
    }
  }

  /**
   * Start a Mockoon mock server
   * @param {string} mockFile - Path to Mockoon environment JSON file
   * @param {Object} options - Configuration options
   * @returns {Promise<string>} - Mock server ID
   */
  async startMock(mockFile, options = {}) {
    const mockId = options.mockId || `mock-${Date.now()}`;
    const port = options.port || 3001;
    const hostname = options.hostname || '0.0.0.0';

    if (this.mockServers.has(mockId)) {
      console.log(`⚠️  Mock server ${mockId} is already running`);
      return mockId;
    }

    console.log(`🚀 Starting Mockoon server: ${mockId}`);
    console.log(`   Mock file: ${mockFile}`);
    console.log(`   Port: ${port}`);
    if (options.proxyUrl) {
      console.log(`   Proxy to: ${options.proxyUrl}`);
    }

    return new Promise((resolve, reject) => {
      const args = [
        'start',
        '--data', mockFile,
        '--port', port.toString(),
        '--hostname', hostname
      ];

      // Enable transaction logging if configured
      if (this.logsEnabled) {
        args.push('--log-transaction');
      }

      const mockProcess = spawn('npx', ['mockoon-cli', ...args], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env }
      });

      const logs = [];
      this.transactionLogs.set(mockId, logs);

      // Capture stdout (transaction logs in JSON format)
      mockProcess.stdout.on('data', (data) => {
        const output = data.toString();

        // Parse transaction logs (they come as JSON)
        output.split('\n').forEach(line => {
          if (line.trim()) {
            try {
              const logEntry = JSON.parse(line);
              logs.push(logEntry);
            } catch (e) {
              // Not JSON, regular log output
              if (options.verbose) {
                console.log(`[Mockoon ${mockId}] ${line}`);
              }
            }
          }
        });
      });

      mockProcess.stderr.on('data', (data) => {
        const error = data.toString();
        if (options.verbose) {
          console.error(`[Mockoon ${mockId} ERROR] ${error}`);
        }
      });

      mockProcess.on('error', (error) => {
        console.error(`❌ Failed to start Mockoon server ${mockId}:`, error.message);
        this.mockServers.delete(mockId);
        reject(error);
      });

      mockProcess.on('close', (code) => {
        if (code !== 0 && code !== null) {
          console.log(`⚠️  Mockoon server ${mockId} exited with code ${code}`);
        }
        this.mockServers.delete(mockId);
      });

      // Store the process
      this.mockServers.set(mockId, mockProcess);

      // Give Mockoon time to start
      setTimeout(() => {
        console.log(`✅ Mockoon server ${mockId} started successfully`);
        resolve(mockId);
      }, 2000);
    });
  }

  /**
   * Stop a Mockoon mock server
   * @param {string} mockId - Mock server ID
   */
  async stopMock(mockId) {
    const mockProcess = this.mockServers.get(mockId);

    if (!mockProcess) {
      console.log(`⚠️  Mock server ${mockId} is not running`);
      return;
    }

    console.log(`🛑 Stopping Mockoon server: ${mockId}`);

    return new Promise((resolve) => {
      mockProcess.on('close', () => {
        this.mockServers.delete(mockId);
        console.log(`✅ Mockoon server ${mockId} stopped`);
        resolve();
      });

      mockProcess.kill('SIGTERM');

      // Force kill after 5 seconds if still running
      setTimeout(() => {
        if (this.mockServers.has(mockId)) {
          console.log(`⚠️  Force killing Mockoon server ${mockId}`);
          mockProcess.kill('SIGKILL');
          this.mockServers.delete(mockId);
          resolve();
        }
      }, 5000);
    });
  }

  /**
   * Stop all running mock servers
   */
  async stopAll() {
    console.log(`🛑 Stopping all Mockoon servers (${this.mockServers.size})...`);

    const stopPromises = Array.from(this.mockServers.keys()).map(mockId =>
      this.stopMock(mockId)
    );

    await Promise.all(stopPromises);
    console.log('✅ All Mockoon servers stopped');
  }

  /**
   * Get transaction logs for a mock server
   * @param {string} mockId - Mock server ID
   * @returns {Array} - Array of transaction log entries
   */
  getTransactionLogs(mockId) {
    return this.transactionLogs.get(mockId) || [];
  }

  /**
   * Get all transaction logs (all mock servers)
   * @returns {Object} - Map of mockId -> logs
   */
  getAllTransactionLogs() {
    const allLogs = {};
    this.transactionLogs.forEach((logs, mockId) => {
      allLogs[mockId] = logs;
    });
    return allLogs;
  }

  /**
   * Save transaction logs to file
   * @param {string} mockId - Mock server ID
   * @param {string} filename - Output filename
   * @returns {string} - Path to saved file
   */
  saveTransactionLogs(mockId, filename) {
    const logs = this.getTransactionLogs(mockId);

    if (logs.length === 0) {
      console.log(`⚠️  No transaction logs to save for ${mockId}`);
      return null;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFilename = filename || `${mockId}-${timestamp}.json`;
    const outputPath = path.join(this.recordingsDir, outputFilename);

    const logData = {
      mockId,
      timestamp: new Date().toISOString(),
      totalTransactions: logs.length,
      transactions: logs
    };

    fs.writeFileSync(outputPath, JSON.stringify(logData, null, 2));
    console.log(`💾 Transaction logs saved: ${outputPath}`);
    console.log(`   Total transactions: ${logs.length}`);

    return outputPath;
  }

  /**
   * Save logs on test failure (includes test metadata)
   * @param {string} mockId - Mock server ID
   * @param {Object} testInfo - Test information
   * @returns {string} - Path to saved file
   */
  async saveLogsOnFailure(mockId, testInfo = {}) {
    const logs = this.getTransactionLogs(mockId);

    if (logs.length === 0) {
      console.log(`⚠️  No transaction logs to save for failed test`);
      return null;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const testName = (testInfo.name || 'unknown-test').replace(/\s+/g, '-').toLowerCase();
    const deviceId = (testInfo.deviceId || 'unknown-device').replace(/\s+/g, '-').toLowerCase();
    const filename = `FAILED-${testName}-${deviceId}-${timestamp}.json`;
    const outputPath = path.join(this.recordingsDir, filename);

    const logData = {
      status: 'FAILED',
      mockId,
      timestamp: new Date().toISOString(),
      test: {
        name: testInfo.name || 'Unknown Test',
        deviceId: testInfo.deviceId || 'Unknown Device',
        error: testInfo.error || 'No error details',
        duration: testInfo.duration || 0
      },
      totalTransactions: logs.length,
      transactions: logs,
      summary: this.generateLogSummary(logs)
    };

    fs.writeFileSync(outputPath, JSON.stringify(logData, null, 2));

    console.log(`\n💾 FAILURE LOGS SAVED`);
    console.log(`   File: ${outputPath}`);
    console.log(`   Test: ${testInfo.name || 'Unknown'}`);
    console.log(`   Device: ${testInfo.deviceId || 'Unknown'}`);
    console.log(`   Transactions: ${logs.length}`);
    console.log(`   Proxied: ${logData.summary.proxiedCount}`);
    console.log(`   Errors: ${logData.summary.errorCount}\n`);

    return outputPath;
  }

  /**
   * Generate summary statistics from transaction logs
   * @param {Array} logs - Transaction logs
   * @returns {Object} - Summary statistics
   */
  generateLogSummary(logs) {
    const summary = {
      total: logs.length,
      proxiedCount: 0,
      mockedCount: 0,
      errorCount: 0,
      methods: {},
      endpoints: {}
    };

    logs.forEach(log => {
      // Count proxied vs mocked
      if (log.proxied) {
        summary.proxiedCount++;
      } else {
        summary.mockedCount++;
      }

      // Count errors (status >= 400)
      if (log.response && log.response.statusCode >= 400) {
        summary.errorCount++;
      }

      // Count by method
      const method = log.request?.method || 'UNKNOWN';
      summary.methods[method] = (summary.methods[method] || 0) + 1;

      // Count by endpoint
      const endpoint = log.request?.path || 'UNKNOWN';
      summary.endpoints[endpoint] = (summary.endpoints[endpoint] || 0) + 1;
    });

    return summary;
  }

  /**
   * Clear transaction logs for a mock server
   * @param {string} mockId - Mock server ID
   */
  clearLogs(mockId) {
    if (mockId) {
      this.transactionLogs.set(mockId, []);
      console.log(`🗑️  Cleared logs for ${mockId}`);
    } else {
      this.transactionLogs.clear();
      console.log(`🗑️  Cleared all transaction logs`);
    }
  }

  /**
   * Get status of all running mock servers
   * @returns {Array} - Array of mock server status objects
   */
  getStatus() {
    const status = [];

    this.mockServers.forEach((process, mockId) => {
      const logs = this.getTransactionLogs(mockId);
      status.push({
        mockId,
        running: true,
        pid: process.pid,
        transactionCount: logs.length
      });
    });

    return status;
  }

  /**
   * Check if a mock server is running
   * @param {string} mockId - Mock server ID
   * @returns {boolean}
   */
  isRunning(mockId) {
    return this.mockServers.has(mockId);
  }
}

module.exports = MockoonManager;
