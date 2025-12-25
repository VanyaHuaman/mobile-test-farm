// Mobile Test Farm - Dashboard Application

const API_BASE = '/api';
let socket;
let currentTestRunId = null;

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initializeTabs();
  connectWebSocket();
  loadDevices();
  loadTestSuites();
  loadTestRuns();
  loadArtifactCounts();
  updateSystemStatus();
});

// ============================================================================
// TAB MANAGEMENT
// ============================================================================

function initializeTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
}

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}-tab`);
  });

  // Refresh data when switching to certain tabs
  if (tabName === 'devices') loadDevices();
  if (tabName === 'results') loadTestRuns();
  if (tabName === 'reports') loadArtifactCounts();
}

// ============================================================================
// WEBSOCKET CONNECTION
// ============================================================================

function connectWebSocket() {
  socket = io();

  socket.on('connect', () => {
    console.log('WebSocket connected');
    document.getElementById('server-status').style.background = 'var(--success)';
  });

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
    document.getElementById('server-status').style.background = 'var(--danger)';
  });

  socket.on('device:registered', () => loadDevices());
  socket.on('device:updated', () => loadDevices());
  socket.on('device:removed', () => loadDevices());

  socket.on('test:started', (test) => {
    currentTestRunId = test.id;
    showTestOutput(test);
    loadTestRuns();
  });

  socket.on('test:output', (data) => {
    appendTestOutput(data.text);
  });

  socket.on('test:completed', (test) => {
    showTestCompletion(test);
    currentTestRunId = null;
    loadTestRuns();
  });

  socket.on('test:stopped', () => {
    currentTestRunId = null;
    loadTestRuns();
  });
}

// ============================================================================
// DEVICE MANAGEMENT
// ============================================================================

async function loadDevices() {
  const loadingEl = document.getElementById('devices-loading');
  const errorEl = document.getElementById('devices-error');
  const listEl = document.getElementById('devices-list');
  const emptyEl = document.getElementById('devices-empty');

  try {
    loadingEl.style.display = 'block';
    errorEl.style.display = 'none';
    listEl.innerHTML = '';
    emptyEl.style.display = 'none';

    const response = await fetch(`${API_BASE}/devices`);
    const data = await response.json();

    loadingEl.style.display = 'none';

    if (!data.success) {
      throw new Error(data.error);
    }

    // Update device count
    document.getElementById('device-count').textContent = data.count;

    if (data.devices.length === 0) {
      emptyEl.style.display = 'block';
      return;
    }

    // Render devices
    listEl.innerHTML = data.devices.map(device => renderDeviceCard(device)).join('');

    // Update test device checkboxes
    updateTestDeviceCheckboxes(data.devices);
  } catch (error) {
    loadingEl.style.display = 'none';
    errorEl.textContent = `Error loading devices: ${error.message}`;
    errorEl.style.display = 'block';
  }
}

function renderDeviceCard(device) {
  const platformIcon = device.platform === 'android' ? '🤖' : '🍎';
  const typeIcon = device.type === 'physical' ? '📱' : device.type === 'emulator' ? '🖥️' : '💻';

  return `
    <div class="device-card">
      <div class="device-header">
        <div class="device-icon">${platformIcon} ${typeIcon}</div>
        <div class="device-actions">
          <button class="icon-btn" onclick="removeDevice('${device.id}')" title="Remove device">
            🗑️
          </button>
        </div>
      </div>
      <div class="device-name">${device.friendlyName}</div>
      <div class="device-meta">
        <div class="device-meta-item">
          <span class="badge badge-${device.platform}">${device.platform}</span>
          <span class="badge badge-${device.type}">${device.type}</span>
        </div>
        <div class="device-meta-item">
          <strong>ID:</strong> ${device.deviceId}
        </div>
        ${device.model ? `<div class="device-meta-item"><strong>Model:</strong> ${device.model}</div>` : ''}
        ${device.osVersion ? `<div class="device-meta-item"><strong>OS:</strong> ${device.osVersion}</div>` : ''}
        ${device.notes ? `<div class="device-meta-item"><em>${device.notes}</em></div>` : ''}
      </div>
    </div>
  `;
}

async function removeDevice(deviceId) {
  if (!confirm('Are you sure you want to remove this device?')) return;

  try {
    const response = await fetch(`${API_BASE}/devices/${deviceId}`, {
      method: 'DELETE',
    });
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    loadDevices();
  } catch (error) {
    alert(`Error removing device: ${error.message}`);
  }
}

// ============================================================================
// DEVICE DISCOVERY
// ============================================================================

async function discoverDevices() {
  try {
    const response = await fetch(`${API_BASE}/devices/discover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: 'all' }),
    });
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    if (data.devices.length === 0) {
      alert('No devices found. Make sure devices are connected and powered on.');
      return;
    }

    showDiscoveredDevices(data.devices);
  } catch (error) {
    alert(`Error discovering devices: ${error.message}`);
  }
}

function showDiscoveredDevices(devices) {
  const modal = document.getElementById('discovered-modal');
  const listEl = document.getElementById('discovered-devices-list');

  listEl.innerHTML = `
    <p>Found ${devices.length} device(s). Select devices to register:</p>
    <div style="margin-top: 1rem;">
      ${devices.map(device => `
        <div class="checkbox-label">
          <input type="checkbox" value="${device.deviceId}" id="disc-${device.deviceId}">
          <div>
            <strong>${device.model || device.deviceId}</strong><br>
            <small>${device.platform} • ${device.deviceId}</small>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="form-actions">
      <button class="btn btn-secondary" onclick="closeDiscoveredModal()">Cancel</button>
      <button class="btn btn-primary" onclick="registerSelectedDevices()">Register Selected</button>
    </div>
  `;

  modal.classList.add('active');
}

function closeDiscoveredModal() {
  document.getElementById('discovered-modal').classList.remove('active');
}

async function registerSelectedDevices() {
  const checkboxes = document.querySelectorAll('#discovered-devices-list input[type="checkbox"]:checked');

  if (checkboxes.length === 0) {
    alert('Please select at least one device');
    return;
  }

  for (const checkbox of checkboxes) {
    const deviceId = checkbox.value;
    const id = deviceId.replace(/[^a-z0-9]/gi, '-').toLowerCase();

    try {
      await fetch(`${API_BASE}/devices/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          friendlyName: `Device ${deviceId}`,
          deviceId,
          platform: deviceId.includes('emulator') ? 'android' : 'ios',
          type: deviceId.includes('emulator') || deviceId.includes('simulator') ? 'emulator' : 'physical',
        }),
      });
    } catch (error) {
      console.error('Error registering device:', error);
    }
  }

  closeDiscoveredModal();
  loadDevices();
}

// ============================================================================
// DEVICE REGISTRATION
// ============================================================================

function showRegisterModal() {
  document.getElementById('register-modal').classList.add('active');
  document.getElementById('register-form').reset();
}

function closeRegisterModal() {
  document.getElementById('register-modal').classList.remove('active');
}

async function registerDevice(event) {
  event.preventDefault();

  const friendlyName = document.getElementById('register-friendly-name').value;
  const deviceId = document.getElementById('register-device-id').value;
  const platform = document.getElementById('register-platform').value;
  const type = document.getElementById('register-type').value;
  const model = document.getElementById('register-model').value;
  const osVersion = document.getElementById('register-os-version').value;
  const notes = document.getElementById('register-notes').value;

  const id = friendlyName.toLowerCase().replace(/[^a-z0-9]/g, '-');

  try {
    const response = await fetch(`${API_BASE}/devices/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        friendlyName,
        deviceId,
        platform,
        type,
        model,
        osVersion,
        notes,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    closeRegisterModal();
    loadDevices();
  } catch (error) {
    alert(`Error registering device: ${error.message}`);
  }
}

// ============================================================================
// TEST EXECUTION
// ============================================================================

async function loadTestSuites() {
  try {
    const response = await fetch(`${API_BASE}/tests/suites`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    const selectEl = document.getElementById('test-suite');
    selectEl.innerHTML = data.suites.map(suite => `
      <option value="${suite.id}">${suite.name} (${suite.estimatedDuration})</option>
    `).join('');

    selectEl.addEventListener('change', () => {
      const suite = data.suites.find(s => s.id === selectEl.value);
      document.getElementById('suite-description').textContent = suite ? suite.description : '';
    });

    selectEl.dispatchEvent(new Event('change'));
  } catch (error) {
    console.error('Error loading test suites:', error);
  }
}

function updateTestDeviceCheckboxes(devices) {
  const containerEl = document.getElementById('test-devices');

  if (devices.length === 0) {
    containerEl.innerHTML = '<p class="form-help">No devices registered. Tests will run on default device.</p>';
    return;
  }

  containerEl.innerHTML = devices.map(device => `
    <label class="checkbox-label">
      <input type="checkbox" name="test-device" value="${device.id}">
      <span>${device.friendlyName} (${device.platform})</span>
    </label>
  `).join('');
}

async function runTests() {
  const suite = document.getElementById('test-suite').value;
  const deviceCheckboxes = document.querySelectorAll('input[name="test-device"]:checked');
  const devices = Array.from(deviceCheckboxes).map(cb => cb.value);
  const executionModeEl = document.querySelector('input[name="execution-mode"]:checked');
  const executionMode = executionModeEl ? executionModeEl.value : 'sequential';

  if (!suite) {
    alert('Please select a test suite');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/tests/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        suite,
        devices,
        config: {
          executionMode,
        },
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    // Test started, output will be shown via WebSocket
  } catch (error) {
    alert(`Error starting test: ${error.message}`);
  }
}

function showTestOutput(test) {
  const sectionEl = document.getElementById('test-output-section');
  const infoEl = document.getElementById('test-info');
  const outputEl = document.getElementById('test-output');
  const stopBtn = document.getElementById('stop-test-btn');

  infoEl.innerHTML = `
    <strong>${test.suiteName}</strong> •
    Devices: ${test.devices.join(', ')} •
    Status: <span style="color: var(--warning)">Running...</span>
  `;

  outputEl.textContent = '';
  sectionEl.style.display = 'block';
  stopBtn.style.display = 'inline-block'; // Show stop button when test starts

  // Scroll to output
  sectionEl.scrollIntoView({ behavior: 'smooth' });
}

function appendTestOutput(text) {
  const outputEl = document.getElementById('test-output');
  outputEl.textContent += text;
  outputEl.scrollTop = outputEl.scrollHeight;
}

function showTestCompletion(test) {
  const infoEl = document.getElementById('test-info');
  const stopBtn = document.getElementById('stop-test-btn');
  const statusColor = test.status === 'passed' ? 'var(--success)' : 'var(--danger)';

  infoEl.innerHTML = `
    <strong>${test.suiteName}</strong> •
    Duration: ${formatDuration(test.duration)} •
    Status: <span style="color: ${statusColor}">${test.status.toUpperCase()}</span>
  `;

  // Hide stop button when test completes
  stopBtn.style.display = 'none';
}

async function stopCurrentTest() {
  if (!currentTestRunId) return;

  try {
    // Add message to output that test is being stopped
    const stopMessage = '\n\n⏹️  Test manually stopped by user\n';
    appendTestOutput(stopMessage);

    const response = await fetch(`${API_BASE}/tests/runs/${currentTestRunId}/stop`, {
      method: 'POST',
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    // Hide stop button after stopping
    const stopBtn = document.getElementById('stop-test-btn');
    if (stopBtn) {
      stopBtn.style.display = 'none';
    }
  } catch (error) {
    alert(`Error stopping test: ${error.message}`);
  }
}

// ============================================================================
// TEST RESULTS
// ============================================================================

async function loadTestRuns() {
  const loadingEl = document.getElementById('results-loading');
  const listEl = document.getElementById('results-list');
  const emptyEl = document.getElementById('results-empty');

  try {
    loadingEl.style.display = 'block';
    listEl.innerHTML = '';
    emptyEl.style.display = 'none';

    const response = await fetch(`${API_BASE}/tests/runs`);
    const data = await response.json();

    loadingEl.style.display = 'none';

    if (!data.success) {
      throw new Error(data.error);
    }

    // Update active tests count
    const activeCount = data.runs.filter(r => r.status === 'running').length;
    document.getElementById('active-tests').textContent = activeCount;

    if (data.runs.length === 0) {
      emptyEl.style.display = 'block';
      return;
    }

    listEl.innerHTML = data.runs.map(run => renderResultCard(run)).join('');
  } catch (error) {
    loadingEl.style.display = 'none';
    console.error('Error loading test runs:', error);
  }
}

function renderResultCard(run) {
  return `
    <div class="result-card ${run.status}">
      <div class="result-header">
        <div class="result-title">${run.suiteName}</div>
        <span class="result-status ${run.status}">${run.status.toUpperCase()}</span>
      </div>
      <div class="result-meta">
        <div>
          <strong>Started:</strong><br>
          ${formatDateTime(run.startTime)}
        </div>
        ${run.endTime ? `
          <div>
            <strong>Duration:</strong><br>
            ${formatDuration(run.duration)}
          </div>
        ` : ''}
        <div>
          <strong>Devices:</strong><br>
          ${run.devices.join(', ')}
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// REPORTS & ARTIFACTS
// ============================================================================

async function loadArtifactCounts() {
  try {
    const [screenshots, videos, reports] = await Promise.all([
      fetch(`${API_BASE}/artifacts/screenshots`).then(r => r.json()),
      fetch(`${API_BASE}/artifacts/videos`).then(r => r.json()),
      fetch(`${API_BASE}/reports`).then(r => r.json()),
    ]);

    document.getElementById('screenshot-count').textContent =
      `${screenshots.screenshots?.length || 0} screenshot(s) available`;

    document.getElementById('video-count').textContent =
      `${videos.videos?.length || 0} video(s) available`;

    // Update Allure report card
    updateAllureReportCard(reports);
  } catch (error) {
    console.error('Error loading artifact counts:', error);
  }
}

function updateAllureReportCard(data) {
  const statusEl = document.getElementById('allure-status');
  const actionsEl = document.getElementById('allure-actions');

  if (data.reports && data.reports.length > 0) {
    // Report exists
    const report = data.reports[0];
    statusEl.textContent = `Last generated: ${formatDateTime(report.createdAt)}`;
    actionsEl.innerHTML = `
      <a href="${report.path}" target="_blank" class="btn btn-primary">View Report</a>
      ${data.hasResults ? '<button class="btn btn-secondary" onclick="generateAllureReport()" style="margin-left: 0.5rem;">Regenerate</button>' : ''}
    `;
  } else if (data.hasResults) {
    // Results exist but no report generated
    statusEl.textContent = 'Test results available. Generate report to view.';
    actionsEl.innerHTML = `
      <button class="btn btn-primary" onclick="generateAllureReport()">Generate Report</button>
    `;
  } else {
    // No results at all
    statusEl.textContent = 'No test results yet. Run some tests first.';
    actionsEl.innerHTML = `
      <button class="btn btn-secondary" disabled>No Results</button>
    `;
  }
}

async function generateAllureReport() {
  const statusEl = document.getElementById('allure-status');
  const actionsEl = document.getElementById('allure-actions');

  // Show loading state
  statusEl.textContent = 'Generating report...';
  actionsEl.innerHTML = '<button class="btn btn-secondary" disabled>Generating...</button>';

  try {
    const response = await fetch(`${API_BASE}/reports/generate`, {
      method: 'POST',
    });
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    // Reload to show the new report
    loadArtifactCounts();
  } catch (error) {
    statusEl.textContent = `Error: ${error.message}`;
    actionsEl.innerHTML = `
      <button class="btn btn-primary" onclick="generateAllureReport()">Retry</button>
    `;
  }
}

async function viewArtifacts(type) {
  try {
    const response = await fetch(`${API_BASE}/artifacts/${type}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    const items = data[type] || [];
    const modal = document.getElementById('artifacts-modal');
    const titleEl = document.getElementById('artifacts-title');
    const listEl = document.getElementById('artifacts-list');

    titleEl.textContent = type.charAt(0).toUpperCase() + type.slice(1);

    if (items.length === 0) {
      listEl.innerHTML = '<p>No ' + type + ' available</p>';
    } else {
      listEl.innerHTML = `
        <div class="devices-grid">
          ${items.map(item => `
            <div class="device-card">
              <div class="device-name">${item.name}</div>
              <div class="device-meta">
                <div class="device-meta-item">
                  <strong>Size:</strong> ${formatBytes(item.size)}
                </div>
                <div class="device-meta-item">
                  <strong>Created:</strong> ${formatDateTime(item.createdAt)}
                </div>
              </div>
              <a href="${item.path}" target="_blank" class="btn btn-primary btn-sm" style="margin-top: 1rem;">View</a>
            </div>
          `).join('')}
        </div>
      `;
    }

    modal.classList.add('active');
  } catch (error) {
    alert(`Error loading ${type}: ${error.message}`);
  }
}

function closeArtifactsModal() {
  document.getElementById('artifacts-modal').classList.remove('active');
}

// ============================================================================
// SYSTEM STATUS
// ============================================================================

async function updateSystemStatus() {
  try {
    const response = await fetch(`${API_BASE}/system/status`);
    const data = await response.json();

    if (data.success) {
      document.getElementById('device-count').textContent = data.status.deviceCount;
      document.getElementById('active-tests').textContent = data.status.activeTests;
    }
  } catch (error) {
    console.error('Error updating system status:', error);
  }

  // Update every 10 seconds
  setTimeout(updateSystemStatus, 10000);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatDuration(ms) {
  if (!ms) return 'N/A';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
