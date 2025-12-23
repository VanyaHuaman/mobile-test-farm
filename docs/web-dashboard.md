# Web Dashboard - Mobile Test Farm

Comprehensive web-based UI for managing devices, running tests, and viewing results.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Features](#features)
- [User Guide](#user-guide)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Web Dashboard provides a modern, user-friendly interface for the Mobile Test Farm, making test automation accessible to the entire team including non-technical members.

**Key Benefits:**
- No command-line knowledge required
- Real-time test execution monitoring
- Visual device management
- Centralized test results
- Live WebSocket updates

**Technology Stack:**
- Backend: Express.js + Socket.IO
- Frontend: Vanilla JavaScript + Modern CSS
- API: REST + WebSocket

---

## Quick Start

### 1. Start the Dashboard

```bash
npm run dashboard
```

The dashboard will be available at: **http://localhost:3000**

### 2. Access the Dashboard

Open your browser and navigate to:
```
http://localhost:3000
```

### 3. Register Your First Device

1. Click "Discover Devices" button
2. Select discovered devices
3. Click "Register Selected"

OR

1. Click "Register Device" button
2. Fill in device information
3. Click "Register Device"

### 4. Run Your First Test

1. Go to "Run Tests" tab
2. Select a test suite
3. (Optional) Select devices
4. Click "Run Tests"
5. Watch real-time test execution

---

## Features

### Device Management

**Capabilities:**
- ✅ Discover connected devices automatically
- ✅ Register devices with friendly names
- ✅ View all registered devices at a glance
- ✅ Remove devices
- ✅ Real-time device status updates

**Supported Devices:**
- Android Emulators
- iOS Simulators
- Physical Android devices
- Physical iOS devices

### Test Execution

**Capabilities:**
- ✅ Browse available test suites
- ✅ Select devices to test on
- ✅ Run tests with one click
- ✅ Real-time test output streaming
- ✅ Stop running tests
- ✅ Multiple concurrent test runs

**Available Test Suites:**
- Login Test Suite
- Form Test Suite
- List Test Suite
- Profile Test Suite
- Navigation Test Suite
- All Test Suites (sequential)

### Test Results

**Capabilities:**
- ✅ View all test run history
- ✅ See test status (passed/failed/running)
- ✅ View execution duration
- ✅ Filter by device and suite
- ✅ Real-time result updates

### Reports & Artifacts

**Capabilities:**
- ✅ Access Allure HTML reports
- ✅ Browse screenshots
- ✅ View video recordings
- ✅ Download artifacts

---

## User Guide

### Device Management Tab

#### Discovering Devices

**Steps:**
1. Connect your devices (start emulators/simulators or plug in physical devices)
2. Click "Discover Devices" button
3. Wait for discovery to complete
4. Review discovered devices
5. Select devices to register
6. Click "Register Selected"

**Discovery Methods:**
- **Android:** Uses `adb devices` to find connected devices
- **iOS:** Uses `xcrun simctl` for simulators and `idevice_id` for physical devices

#### Registering Devices Manually

**Steps:**
1. Click "Register Device" button
2. Fill in the form:
   - **Friendly Name:** Human-readable name (e.g., "Lenovo 11-inch Tablet")
   - **Device ID:** Technical identifier (e.g., "emulator-5554" or "ZY223K7LXM")
   - **Platform:** Android or iOS
   - **Type:** Emulator, Simulator, or Physical
   - **Model:** (Optional) Device model
   - **OS Version:** (Optional) Operating system version
   - **Notes:** (Optional) Additional information
3. Click "Register Device"

**Example:**
```
Friendly Name: Pixel 6 Pro Emulator
Device ID: emulator-5554
Platform: Android
Type: Emulator
Model: Pixel_6_Pro
OS Version: Android 14
Notes: Primary development emulator
```

#### Removing Devices

**Steps:**
1. Find the device card
2. Click the trash icon (🗑️)
3. Confirm removal

**Note:** Removing a device only removes it from the registry. It does not delete or disconnect the physical device.

### Run Tests Tab

#### Selecting a Test Suite

**Steps:**
1. Click on the "Test Suite" dropdown
2. Select desired test suite
3. Review the suite description and estimated duration

**Test Suite Options:**
- **Login Test Suite** (30s) - Tests login functionality
- **Form Test Suite** (45s) - Tests form interactions
- **List Test Suite** (60s) - Tests list filtering
- **Profile Test Suite** (40s) - Tests profile and settings
- **Navigation Test Suite** (90s) - Tests complete app navigation
- **All Test Suites** (4m) - Runs all tests sequentially

#### Selecting Devices

**Options:**
1. **No selection:** Tests run on default device
2. **One device:** Tests run on selected device
3. **Multiple devices:** Tests run on all selected devices in parallel

**Steps:**
1. Check the boxes next to desired devices
2. Selected devices will be highlighted

#### Running Tests

**Steps:**
1. Select test suite
2. (Optional) Select devices
3. Click "Run Tests" button
4. Test output section appears automatically
5. Watch real-time test execution

**Test Output:**
- Real-time console output
- Auto-scrolling terminal
- Color-coded output (stdout/stderr)
- Test status updates

#### Stopping Tests

**Steps:**
1. While test is running, click "Stop Test" button
2. Test process will be terminated
3. Test status will update to "stopped"

**Note:** Stopping a test is immediate but may leave the app in an inconsistent state.

### Test Results Tab

#### Viewing Results

**Information Displayed:**
- Test suite name
- Start time and date
- Duration (for completed tests)
- Devices tested
- Status (running/passed/failed/stopped)

**Status Indicators:**
- **Green border:** Passed
- **Red border:** Failed
- **Yellow border:** Running

#### Refreshing Results

**Steps:**
1. Click "Refresh" button in section header
2. Results list updates with latest data

**Auto-Refresh:**
Results automatically update when:
- New test starts
- Test completes
- Test is stopped

### Reports & Artifacts Tab

#### Viewing Allure Report

**Steps:**
1. Click "View Report" button under Allure Report card
2. Report opens in new tab
3. Browse test results, charts, and history

**Report Features:**
- Test execution overview
- Detailed test steps
- Screenshots and videos
- Historical trends
- Flaky test detection

#### Browsing Screenshots

**Steps:**
1. Click "View Screenshots" button
2. Modal opens with screenshot gallery
3. Click individual screenshots to view full size

**Screenshot Information:**
- Filename
- File size
- Creation date
- Direct view link

#### Browsing Videos

**Steps:**
1. Click "View Videos" button
2. Modal opens with video list
3. Click videos to play

**Video Information:**
- Filename
- File size
- Creation date
- Direct view link

---

## API Reference

### Device Endpoints

#### GET /api/devices
Get all registered devices.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "devices": [
    {
      "id": "android-emulator-1",
      "friendlyName": "Android Emulator",
      "deviceId": "emulator-5554",
      "platform": "android",
      "type": "emulator",
      "model": "Pixel_6",
      "osVersion": "Android 14"
    }
  ]
}
```

#### GET /api/devices/:id
Get single device by ID or friendly name.

**Response:**
```json
{
  "success": true,
  "device": { /* device object */ }
}
```

#### POST /api/devices/discover
Discover connected devices.

**Request:**
```json
{
  "platform": "all" | "android" | "ios"
}
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "devices": [/* discovered devices */]
}
```

#### POST /api/devices/register
Register a new device.

**Request:**
```json
{
  "id": "my-device",
  "friendlyName": "My Device",
  "deviceId": "device-123",
  "platform": "android",
  "type": "physical",
  "model": "Samsung Galaxy",
  "osVersion": "Android 13",
  "notes": "Test device"
}
```

**Response:**
```json
{
  "success": true,
  "device": { /* registered device */ }
}
```

#### DELETE /api/devices/:id
Remove a device.

**Response:**
```json
{
  "success": true,
  "message": "Device removed successfully"
}
```

### Test Endpoints

#### GET /api/tests/suites
Get available test suites.

**Response:**
```json
{
  "success": true,
  "suites": [
    {
      "id": "login",
      "name": "Login Test Suite",
      "description": "Tests login functionality",
      "script": "test:login:pom",
      "estimatedDuration": "30s"
    }
  ]
}
```

#### POST /api/tests/run
Run a test suite.

**Request:**
```json
{
  "suite": "login",
  "devices": ["android-emulator-1"],
  "config": {
    "env": {
      "CUSTOM_VAR": "value"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "runId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Test execution started"
}
```

#### GET /api/tests/runs
Get all test runs.

**Response:**
```json
{
  "success": true,
  "runs": [
    {
      "id": "run-id",
      "suite": "login",
      "suiteName": "Login Test Suite",
      "devices": ["android-emulator-1"],
      "status": "passed",
      "startTime": "2025-12-23T10:00:00Z",
      "endTime": "2025-12-23T10:00:30Z",
      "duration": 30000
    }
  ]
}
```

#### GET /api/tests/runs/:runId
Get specific test run.

#### POST /api/tests/runs/:runId/stop
Stop a running test.

### Report Endpoints

#### GET /api/reports
Get list of available reports.

#### GET /reports/latest
View latest Allure report (HTML).

#### GET /api/artifacts/screenshots
Get list of screenshots.

#### GET /api/artifacts/videos
Get list of videos.

### System Endpoints

#### GET /api/system/status
Get system status.

**Response:**
```json
{
  "success": true,
  "status": {
    "server": "running",
    "uptime": 12345,
    "memory": { /* memory usage */ },
    "deviceCount": 2,
    "activeTests": 0
  }
}
```

### WebSocket Events

#### Client → Server
None currently (future: custom events)

#### Server → Client

**device:registered**
```json
{ /* new device object */ }
```

**device:updated**
```json
{ /* updated device object */ }
```

**device:removed**
```json
{ "id": "device-id" }
```

**test:started**
```json
{
  "id": "run-id",
  "suite": "login",
  "suiteName": "Login Test Suite",
  "devices": ["device-1"],
  "status": "running",
  "startTime": "2025-12-23T10:00:00Z"
}
```

**test:output**
```json
{
  "runId": "run-id",
  "type": "stdout",
  "text": "Test output line..."
}
```

**test:completed**
```json
{
  "id": "run-id",
  "status": "passed",
  "endTime": "2025-12-23T10:00:30Z",
  "duration": 30000
}
```

**test:stopped**
```json
{ "runId": "run-id" }
```

---

## Architecture

### Backend (server/index.js)

**Components:**
- Express.js HTTP server
- Socket.IO WebSocket server
- REST API endpoints
- Static file serving

**Responsibilities:**
- Handle API requests
- Manage WebSocket connections
- Coordinate test execution
- Serve dashboard frontend

### Test Runner (server/test-runner.js)

**Responsibilities:**
- Spawn test processes
- Capture test output
- Broadcast live updates via WebSocket
- Track test run state

**Features:**
- Background test execution
- Real-time output streaming
- Process management
- Run history storage

### Frontend (server/public/)

**Files:**
- `index.html` - Dashboard structure
- `styles.css` - Modern UI styling
- `app.js` - Application logic

**Features:**
- Tab-based navigation
- Real-time updates via WebSocket
- Modal dialogs
- Responsive design

### Data Flow

```
User Action (Browser)
  ↓
Frontend JavaScript
  ↓
REST API Request
  ↓
Express Server
  ↓
DeviceManager / TestRunner
  ↓
Test Execution
  ↓
WebSocket Broadcast
  ↓
Frontend Update
  ↓
UI Update (Browser)
```

---

## Troubleshooting

### Dashboard Won't Start

**Symptom:** Error when running `npm run dashboard`

**Solutions:**
1. Check port 3000 is not in use:
   ```bash
   lsof -i :3000
   kill -9 <PID>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Check Node.js version:
   ```bash
   node --version  # Should be 18+
   ```

### Can't Connect to Dashboard

**Symptom:** Browser shows "Cannot connect"

**Solutions:**
1. Verify server is running:
   ```bash
   curl http://localhost:3000/api/system/status
   ```

2. Check firewall settings

3. Try different port:
   ```bash
   PORT=3001 npm run dashboard
   ```

### Devices Not Discovering

**Symptom:** Discover Devices returns empty list

**Solutions:**
1. **Android:** Check ADB connection:
   ```bash
   adb devices -l
   ```

2. **iOS:** Check simulators:
   ```bash
   xcrun simctl list devices
   ```

3. Restart ADB/devices and try again

### Tests Not Running

**Symptom:** Run Tests button doesn't work

**Solutions:**
1. Check Appium is running:
   ```bash
   curl http://localhost:4723/status
   ```

2. Verify test app is built:
   ```bash
   ls ~/expo-arch-example-app/android/app/build/outputs/apk/debug/
   ```

3. Check device registration:
   ```bash
   npm run devices:list
   ```

### WebSocket Disconnected

**Symptom:** Server status shows red

**Solutions:**
1. Refresh browser page

2. Check server logs for errors

3. Restart dashboard server

### Real-Time Updates Not Working

**Symptom:** Test output doesn't update

**Solutions:**
1. Check WebSocket connection (server status indicator)

2. Open browser console for errors

3. Restart dashboard and refresh browser

---

## Configuration

### Environment Variables

Create `.env` file:

```bash
# Dashboard server port
PORT=3000

# All other Mobile Test Farm configuration
# (notifications, test retry, etc.)
```

### Custom Port

```bash
PORT=8080 npm run dashboard
```

Access at: `http://localhost:8080`

---

## Security Considerations

**Current Status:** Dashboard is for local development use only.

**For Production Use:**
- Add user authentication
- Use HTTPS/WSS
- Add CORS restrictions
- Implement rate limiting
- Add input validation
- Secure API endpoints

---

## Tips & Best Practices

### Performance

1. **Limit Concurrent Tests:** Running too many tests simultaneously may slow down devices
2. **Clean Up Old Runs:** Test runner keeps last 50 runs in memory
3. **Close Unused Tabs:** Each browser tab maintains WebSocket connection

### Workflow

1. **Register All Devices First:** Makes test execution smoother
2. **Use Descriptive Names:** Easier to identify devices in lists
3. **Monitor Test Output:** Catch issues early during execution
4. **Review Results Regularly:** Check for patterns in failures

### Device Management

1. **Keep Device List Updated:** Remove disconnected devices
2. **Add Notes:** Document device-specific information
3. **Group Similar Devices:** Use consistent naming (e.g., "Android Emulator 1", "Android Emulator 2")

---

## Future Enhancements

Potential features for future versions:

- User authentication and multi-user support
- Test scheduling and cron jobs
- Advanced filtering and search
- Custom test configurations per device
- Test result comparison
- Performance metrics and charts
- Email notifications for test completion
- Mobile-responsive improvements
- Dark mode support

---

**Mobile Test Farm - Web Dashboard**
Version 1.0 - December 2025
