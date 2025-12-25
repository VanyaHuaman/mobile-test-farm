const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DEVICES_CONFIG_PATH = path.join(__dirname, '../config/devices.json');

class DeviceManager {
  constructor() {
    this.loadDevices();
  }

  loadDevices() {
    try {
      const data = fs.readFileSync(DEVICES_CONFIG_PATH, 'utf8');
      this.config = JSON.parse(data);
    } catch (error) {
      console.warn('⚠️  No devices.json found, creating new one...');
      this.config = {
        devices: {},
        metadata: {
          lastUpdated: new Date().toISOString(),
          version: '1.0.0',
        },
      };
      this.saveDevices();
    }
  }

  saveDevices() {
    this.config.metadata.lastUpdated = new Date().toISOString();
    fs.writeFileSync(
      DEVICES_CONFIG_PATH,
      JSON.stringify(this.config, null, 2),
      'utf8'
    );
  }

  /**
   * Discover connected Android devices via ADB
   */
  discoverAndroidDevices() {
    try {
      const output = execSync('adb devices -l', { encoding: 'utf8' });
      const lines = output.split('\n').slice(1); // Skip header
      const devices = [];

      for (const line of lines) {
        if (line.trim() && !line.includes('List of devices')) {
          const parts = line.trim().split(/\s+/);
          const deviceId = parts[0];
          const status = parts[1];

          if (status === 'device') {
            // Extract metadata from the line
            const modelMatch = line.match(/model:(\S+)/);
            const productMatch = line.match(/product:(\S+)/);
            const deviceMatch = line.match(/device:(\S+)/);

            devices.push({
              deviceId,
              platform: 'android',
              type: deviceId.startsWith('emulator-') ? 'emulator' : 'physical',
              model: modelMatch ? modelMatch[1] : 'unknown',
              product: productMatch ? productMatch[1] : 'unknown',
              device: deviceMatch ? deviceMatch[1] : 'unknown',
              status,
            });
          }
        }
      }

      return devices;
    } catch (error) {
      console.error('❌ Error discovering Android devices:', error.message);
      return [];
    }
  }

  /**
   * Discover connected iOS devices via instruments
   */
  discoverIOSDevices() {
    try {
      // Try xcrun simctl for simulators
      const simulators = this.discoverIOSSimulators();

      // Try idevice_id for physical devices
      const physicalDevices = this.discoverIOSPhysicalDevices();

      return [...simulators, ...physicalDevices];
    } catch (error) {
      console.error('❌ Error discovering iOS devices:', error.message);
      return [];
    }
  }

  /**
   * Discover iOS simulators
   */
  discoverIOSSimulators() {
    try {
      const output = execSync('xcrun simctl list devices available --json', { encoding: 'utf8' });
      const data = JSON.parse(output);
      const devices = [];

      // Parse simulator data
      for (const runtime in data.devices) {
        const runtimeDevices = data.devices[runtime];
        for (const device of runtimeDevices) {
          if (device.isAvailable && device.state === 'Booted') {
            devices.push({
              deviceId: device.udid,
              platform: 'ios',
              type: 'simulator',
              model: device.name,
              osVersion: runtime.replace('com.apple.CoreSimulator.SimRuntime.', '').replace(/-/g, ' '),
              status: 'available',
            });
          }
        }
      }

      return devices;
    } catch (error) {
      // xcrun might not be available or no simulators running
      console.warn('⚠️  Could not discover iOS simulators:', error.message);
      return [];
    }
  }

  /**
   * Discover physical iOS devices
   */
  discoverIOSPhysicalDevices() {
    try {
      const output = execSync('idevice_id -l', { encoding: 'utf8' });
      const lines = output.split('\n').filter(line => line.trim());
      const devices = [];

      for (const udid of lines) {
        if (udid.trim()) {
          // Get device info using ideviceinfo
          try {
            const info = execSync(`ideviceinfo -u ${udid} -k DeviceName -k ProductType`, { encoding: 'utf8' });
            const infoLines = info.split('\n');
            const deviceName = infoLines[0] || 'Unknown iPhone';
            const productType = infoLines[1] || 'Unknown';

            devices.push({
              deviceId: udid,
              platform: 'ios',
              type: 'physical',
              model: productType,
              deviceName: deviceName,
              status: 'available',
            });
          } catch (infoError) {
            // If we can't get device info, still add it with basic info
            devices.push({
              deviceId: udid,
              platform: 'ios',
              type: 'physical',
              model: 'Unknown',
              status: 'available',
            });
          }
        }
      }

      return devices;
    } catch (error) {
      // idevice_id might not be installed
      console.warn('⚠️  Could not discover physical iOS devices. Install libimobiledevice for physical device support.');
      return [];
    }
  }

  /**
   * Discover all connected devices (Android + iOS)
   */
  discoverAllDevices() {
    const androidDevices = this.discoverAndroidDevices();
    const iosDevices = this.discoverIOSDevices();
    return [...androidDevices, ...iosDevices];
  }

  /**
   * List all registered devices
   */
  listDevices() {
    return Object.entries(this.config.devices).map(([id, device]) => ({
      id,
      ...device,
    }));
  }

  /**
   * List active devices only
   */
  listActiveDevices() {
    return this.listDevices().filter((device) => device.active);
  }

  /**
   * Get device by friendly name or ID
   */
  getDevice(nameOrId) {
    // Try exact match by ID first
    if (this.config.devices[nameOrId]) {
      return { id: nameOrId, ...this.config.devices[nameOrId] };
    }

    // Try by friendly name
    for (const [id, device] of Object.entries(this.config.devices)) {
      if (device.friendlyName.toLowerCase() === nameOrId.toLowerCase()) {
        return { id, ...device };
      }
    }

    return null;
  }

  /**
   * Register a new device
   */
  registerDevice(id, deviceInfo) {
    // Check if ID is already used
    if (this.config.devices[id]) {
      throw new Error(`Device ID '${id}' is already registered`);
    }

    // Check if deviceId (hardware identifier) is already registered
    for (const [existingId, device] of Object.entries(this.config.devices)) {
      if (device.deviceId === deviceInfo.deviceId) {
        throw new Error(`Device with hardware ID '${deviceInfo.deviceId}' is already registered as '${device.friendlyName}' (${existingId})`);
      }
    }

    this.config.devices[id] = {
      friendlyName: deviceInfo.friendlyName,
      deviceId: deviceInfo.deviceId,
      platform: deviceInfo.platform,
      type: deviceInfo.type,
      model: deviceInfo.model || 'unknown',
      osVersion: deviceInfo.osVersion || 'unknown',
      active: deviceInfo.active !== false,
      capabilities: deviceInfo.capabilities || this.getDefaultCapabilities(deviceInfo),
      notes: deviceInfo.notes || '',
    };

    this.saveDevices();
    return this.config.devices[id];
  }

  /**
   * Update existing device
   */
  updateDevice(id, updates) {
    if (!this.config.devices[id]) {
      throw new Error(`Device '${id}' not found`);
    }

    this.config.devices[id] = {
      ...this.config.devices[id],
      ...updates,
    };

    this.saveDevices();
    return this.config.devices[id];
  }

  /**
   * Remove device from registry
   */
  unregisterDevice(id) {
    if (!this.config.devices[id]) {
      throw new Error(`Device '${id}' not found`);
    }

    delete this.config.devices[id];
    this.saveDevices();
  }

  /**
   * Get default capabilities based on platform
   */
  getDefaultCapabilities(deviceInfo) {
    if (deviceInfo.platform === 'android') {
      return {
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': deviceInfo.deviceId,
      };
    } else if (deviceInfo.platform === 'ios') {
      return {
        platformName: 'iOS',
        'appium:automationName': 'XCUITest',
        'appium:udid': deviceInfo.deviceId,
      };
    }

    return {
      'appium:deviceName': deviceInfo.deviceId,
    };
  }

  /**
   * Get Appium capabilities for a device
   */
  getCapabilities(nameOrId, appInfo = {}) {
    const device = this.getDevice(nameOrId);
    if (!device) {
      throw new Error(`Device '${nameOrId}' not found`);
    }

    return {
      ...device.capabilities,
      ...appInfo,
    };
  }

  /**
   * Print device list in a nice format
   */
  printDevices() {
    const devices = this.listDevices();

    if (devices.length === 0) {
      console.log('📱 No devices registered');
      return;
    }

    console.log('\n📱 Registered Devices:\n');
    console.log('─'.repeat(80));

    devices.forEach((device, index) => {
      const status = device.active ? '✅' : '⏸️ ';
      const typeIcon = device.type === 'emulator' ? '🖥️ ' : device.type === 'simulator' ? '📲' : '📱';

      console.log(`${status} ${typeIcon} ${device.friendlyName}`);
      console.log(`   ID: ${device.id}`);
      console.log(`   Device ID: ${device.deviceId}`);
      console.log(`   Platform: ${device.platform} | Type: ${device.type}`);
      console.log(`   Model: ${device.model} | OS: ${device.osVersion}`);
      if (device.notes) {
        console.log(`   Notes: ${device.notes}`);
      }
      if (index < devices.length - 1) {
        console.log('─'.repeat(80));
      }
    });

    console.log('─'.repeat(80));
    console.log(`\nTotal: ${devices.length} device(s) | Active: ${this.listActiveDevices().length}\n`);
  }

  /**
   * Sync discovered devices with registry
   */
  syncAndroidDevices() {
    const discovered = this.discoverAndroidDevices();
    const synced = [];
    const newDevices = [];

    console.log(`\n🔍 Discovered ${discovered.length} Android device(s):\n`);

    discovered.forEach((device) => {
      // Check if device already registered
      let existing = null;
      for (const [id, registered] of Object.entries(this.config.devices)) {
        if (registered.deviceId === device.deviceId) {
          existing = id;
          break;
        }
      }

      if (existing) {
        console.log(`✅ ${device.deviceId} - Already registered as '${existing}'`);
        synced.push(existing);
      } else {
        console.log(`🆕 ${device.deviceId} - NEW (not registered)`);
        newDevices.push(device);
      }
    });

    return { synced, newDevices, discovered };
  }

  /**
   * Sync discovered iOS devices with registry
   */
  syncIOSDevices() {
    const discovered = this.discoverIOSDevices();
    const synced = [];
    const newDevices = [];

    console.log(`\n🔍 Discovered ${discovered.length} iOS device(s):\n`);

    discovered.forEach((device) => {
      // Check if device already registered
      let existing = null;
      for (const [id, registered] of Object.entries(this.config.devices)) {
        if (registered.deviceId === device.deviceId) {
          existing = id;
          break;
        }
      }

      if (existing) {
        const typeIcon = device.type === 'simulator' ? '📲' : '📱';
        console.log(`✅ ${typeIcon} ${device.deviceId} - Already registered as '${existing}'`);
        synced.push(existing);
      } else {
        const typeIcon = device.type === 'simulator' ? '📲' : '📱';
        console.log(`🆕 ${typeIcon} ${device.deviceId} - NEW (not registered)`);
        newDevices.push(device);
      }
    });

    return { synced, newDevices, discovered };
  }

  /**
   * Sync all discovered devices (Android + iOS) with registry
   */
  syncAllDevices() {
    console.log('\n🔍 Discovering all connected devices...\n');

    const androidResults = this.syncAndroidDevices();
    const iosResults = this.syncIOSDevices();

    const totalSynced = [...androidResults.synced, ...iosResults.synced];
    const totalNew = [...androidResults.newDevices, ...iosResults.newDevices];
    const totalDiscovered = [...androidResults.discovered, ...iosResults.discovered];

    console.log(`\n📊 Summary:`);
    console.log(`   Total discovered: ${totalDiscovered.length}`);
    console.log(`   Already registered: ${totalSynced.length}`);
    console.log(`   New devices: ${totalNew.length}\n`);

    return {
      synced: totalSynced,
      newDevices: totalNew,
      discovered: totalDiscovered,
    };
  }

  /**
   * Get all device IDs
   * @returns {Array<string>} - Array of device IDs
   */
  getAllDeviceIds() {
    return Object.keys(this.config.devices);
  }

  /**
   * Get devices by platform
   * @param {string} platform - Platform (ios/android)
   * @returns {Array<string>} - Array of device IDs
   */
  getDevicesByPlatform(platform) {
    return Object.entries(this.config.devices)
      .filter(([id, device]) => device.platform === platform.toLowerCase())
      .map(([id]) => id);
  }

  /**
   * Get active devices only
   * @returns {Array<string>} - Array of active device IDs
   */
  getActiveDeviceIds() {
    return Object.entries(this.config.devices)
      .filter(([id, device]) => device.active !== false)
      .map(([id]) => id);
  }
}

module.exports = DeviceManager;
