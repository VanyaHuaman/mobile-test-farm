#!/usr/bin/env node

/**
 * Mobile Test Farm - Web Dashboard Server
 *
 * Express.js server providing REST API and WebSocket for test management
 */

const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');
const fs = require('fs');

const DeviceManager = require('../lib/device-manager');
const TestRunner = require('./test-runner');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize managers
const deviceManager = new DeviceManager();
const testRunner = new TestRunner(io);

// ============================================================================
// DEVICE API ENDPOINTS
// ============================================================================

/**
 * GET /api/devices
 * Get all registered devices
 */
app.get('/api/devices', (req, res) => {
  try {
    const devices = deviceManager.listDevices();
    res.json({
      success: true,
      count: devices.length,
      devices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/devices/:id
 * Get single device by ID or friendly name
 */
app.get('/api/devices/:id', (req, res) => {
  try {
    const device = deviceManager.getDevice(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
      });
    }

    res.json({
      success: true,
      device,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/devices/discover
 * Discover connected devices
 */
app.post('/api/devices/discover', (req, res) => {
  try {
    const { platform } = req.body; // 'android', 'ios', or 'all'

    let devices;
    if (platform === 'android') {
      devices = deviceManager.discoverAndroidDevices();
    } else if (platform === 'ios') {
      devices = [...deviceManager.discoverIOSDevices(), ...deviceManager.discoverIOSSimulators()];
    } else {
      devices = deviceManager.discoverAllDevices();
    }

    res.json({
      success: true,
      count: devices.length,
      devices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/devices/register
 * Register a new device
 */
app.post('/api/devices/register', (req, res) => {
  try {
    const { id, friendlyName, deviceId, platform, type, model, osVersion, notes } = req.body;

    if (!id || !friendlyName || !deviceId || !platform) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: id, friendlyName, deviceId, platform',
      });
    }

    const device = deviceManager.registerDevice(id, {
      friendlyName,
      deviceId,
      platform,
      type,
      model,
      osVersion,
      notes,
    });

    // Broadcast device registration to all connected clients
    io.emit('device:registered', device);

    res.json({
      success: true,
      device,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/devices/:id
 * Update device information
 */
app.put('/api/devices/:id', (req, res) => {
  try {
    const device = deviceManager.getDevice(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
      });
    }

    const updatedDevice = deviceManager.updateDevice(req.params.id, req.body);

    // Broadcast device update
    io.emit('device:updated', updatedDevice);

    res.json({
      success: true,
      device: updatedDevice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/devices/:id
 * Remove a device
 */
app.delete('/api/devices/:id', (req, res) => {
  try {
    const device = deviceManager.getDevice(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
      });
    }

    deviceManager.removeDevice(req.params.id);

    // Broadcast device removal
    io.emit('device:removed', { id: req.params.id });

    res.json({
      success: true,
      message: 'Device removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// TEST API ENDPOINTS
// ============================================================================

/**
 * GET /api/tests/suites
 * Get available test suites
 */
app.get('/api/tests/suites', (req, res) => {
  try {
    const suites = testRunner.getAvailableSuites();
    res.json({
      success: true,
      suites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/tests/run
 * Run a test suite
 */
app.post('/api/tests/run', async (req, res) => {
  try {
    const { suite, devices, config } = req.body;

    if (!suite) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: suite',
      });
    }

    // Start test execution in background
    const runId = testRunner.startTest(suite, devices, config);

    res.json({
      success: true,
      runId,
      message: 'Test execution started',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tests/runs
 * Get all test runs
 */
app.get('/api/tests/runs', (req, res) => {
  try {
    const runs = testRunner.getTestRuns();
    res.json({
      success: true,
      runs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tests/runs/:runId
 * Get specific test run details
 */
app.get('/api/tests/runs/:runId', (req, res) => {
  try {
    const run = testRunner.getTestRun(req.params.runId);

    if (!run) {
      return res.status(404).json({
        success: false,
        error: 'Test run not found',
      });
    }

    res.json({
      success: true,
      run,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/tests/runs/:runId/stop
 * Stop a running test
 */
app.post('/api/tests/runs/:runId/stop', (req, res) => {
  try {
    const run = testRunner.stopTest(req.params.runId);

    if (!run) {
      return res.status(404).json({
        success: false,
        error: 'Test run not found',
      });
    }

    res.json({
      success: true,
      run,
      message: 'Test execution stopped',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// REPORTS API ENDPOINTS
// ============================================================================

/**
 * GET /api/reports
 * Get list of available reports
 */
app.get('/api/reports', (req, res) => {
  try {
    const reportsDir = path.join(__dirname, '..', 'allure-report');

    if (!fs.existsSync(reportsDir)) {
      return res.json({
        success: true,
        reports: [],
      });
    }

    // Get report metadata
    const reports = [{
      id: 'latest',
      name: 'Latest Report',
      path: '/reports/latest',
      createdAt: fs.statSync(reportsDir).mtime,
    }];

    res.json({
      success: true,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Serve Allure reports
 */
app.use('/reports/latest', express.static(path.join(__dirname, '..', 'allure-report')));

/**
 * GET /api/artifacts/screenshots
 * Get list of screenshots
 */
app.get('/api/artifacts/screenshots', (req, res) => {
  try {
    const screenshotsDir = path.join(__dirname, '..', 'screenshots');

    if (!fs.existsSync(screenshotsDir)) {
      return res.json({
        success: true,
        screenshots: [],
      });
    }

    const files = fs.readdirSync(screenshotsDir)
      .filter(file => file.match(/\.(png|jpg|jpeg)$/i))
      .map(file => ({
        name: file,
        path: `/artifacts/screenshots/${file}`,
        size: fs.statSync(path.join(screenshotsDir, file)).size,
        createdAt: fs.statSync(path.join(screenshotsDir, file)).mtime,
      }));

    res.json({
      success: true,
      screenshots: files,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/artifacts/videos
 * Get list of videos
 */
app.get('/api/artifacts/videos', (req, res) => {
  try {
    const videosDir = path.join(__dirname, '..', 'videos');

    if (!fs.existsSync(videosDir)) {
      return res.json({
        success: true,
        videos: [],
      });
    }

    const files = fs.readdirSync(videosDir)
      .filter(file => file.match(/\.(mp4|mov|avi)$/i))
      .map(file => ({
        name: file,
        path: `/artifacts/videos/${file}`,
        size: fs.statSync(path.join(videosDir, file)).size,
        createdAt: fs.statSync(path.join(videosDir, file)).mtime,
      }));

    res.json({
      success: true,
      videos: files,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Serve artifacts
 */
app.use('/artifacts/screenshots', express.static(path.join(__dirname, '..', 'screenshots')));
app.use('/artifacts/videos', express.static(path.join(__dirname, '..', 'videos')));

// ============================================================================
// SYSTEM API ENDPOINTS
// ============================================================================

/**
 * GET /api/system/status
 * Get system status
 */
app.get('/api/system/status', (req, res) => {
  try {
    const status = {
      server: 'running',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      deviceCount: deviceManager.listDevices().length,
      activeTests: testRunner.getActiveTestCount(),
    };

    res.json({
      success: true,
      status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// WEBSOCKET EVENTS
// ============================================================================

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send initial data
  socket.emit('devices:list', deviceManager.listDevices());
  socket.emit('tests:runs', testRunner.getTestRuns());

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('Mobile Test Farm - Web Dashboard');
  console.log('='.repeat(70));
  console.log(`\nServer running on: http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api`);
  console.log(`Dashboard: http://localhost:${PORT}`);
  console.log('\nPress Ctrl+C to stop\n');
});

module.exports = { app, server, io };
