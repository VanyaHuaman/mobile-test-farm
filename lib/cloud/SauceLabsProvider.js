const BaseCloudProvider = require('./BaseCloudProvider');
const https = require('https');

/**
 * SauceLabsProvider - Sauce Labs cloud device farm integration
 *
 * Provides access to Sauce Labs' real device cloud for mobile testing
 * Documentation: https://docs.saucelabs.com/mobile-apps/automated-testing/appium/
 */
class SauceLabsProvider extends BaseCloudProvider {
  constructor(config = {}) {
    super(config);
    this.providerName = 'saucelabs';
    this.username = config.username || process.env.SAUCELABS_USERNAME;
    this.accessKey = config.accessKey || process.env.SAUCELABS_ACCESS_KEY;
    this.dataCenter = config.dataCenter || process.env.SAUCELABS_DATA_CENTER || 'us-west-1';

    // Hub URL varies by data center
    this.hubUrl = `https://ondemand.${this.dataCenter}.saucelabs.com:443/wd/hub`;
    this.apiUrl = `https://api.${this.dataCenter}.saucelabs.com`;
  }

  /**
   * Initialize Sauce Labs provider
   */
  async initialize() {
    const validation = this.validateConfig();
    if (!validation.valid) {
      console.warn(`⚠️  Sauce Labs not configured: ${validation.errors.join(', ')}`);
      this.enabled = false;
      return false;
    }

    try {
      // Test credentials by fetching user info
      await this.makeRequest(`/rest/v1/users/${this.username}`);
      this.enabled = true;
      console.log('✅ Sauce Labs provider initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Sauce Labs:', error.message);
      this.enabled = false;
      return false;
    }
  }

  /**
   * Validate Sauce Labs configuration
   */
  validateConfig() {
    const errors = [];

    if (!this.username) {
      errors.push('SAUCELABS_USERNAME not set');
    }

    if (!this.accessKey) {
      errors.push('SAUCELABS_ACCESS_KEY not set');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Discover available Sauce Labs devices
   */
  async discoverDevices() {
    if (!this.enabled) {
      return [];
    }

    try {
      // Sauce Labs provides device lists via API
      const devices = await this.makeRequest('/v1/rdc/devices/available');
      return devices.map(device => this.formatDevice(device));
    } catch (error) {
      console.error('❌ Failed to discover Sauce Labs devices:', error.message);
      return [];
    }
  }

  /**
   * Get Appium capabilities for Sauce Labs device
   */
  async getCapabilities(deviceId, appConfig = {}) {
    const capabilities = {
      'sauce:options': {
        username: this.username,
        accessKey: this.accessKey,
        deviceName: deviceId,
        ...appConfig.sauceOptions,
      },
      ...appConfig,
    };

    // Remove sauceOptions as it's been merged into sauce:options
    delete capabilities.sauceOptions;

    return capabilities;
  }

  /**
   * Get Sauce Labs hub URL
   */
  getHubUrl() {
    return this.hubUrl;
  }

  /**
   * Upload app to Sauce Labs
   */
  async uploadApp(appPath) {
    const fs = require('fs');
    const path = require('path');
    const FormData = require('form-data');

    if (!fs.existsSync(appPath)) {
      throw new Error(`App file not found: ${appPath}`);
    }

    const fileName = path.basename(appPath);
    const form = new FormData();
    form.append('payload', fs.createReadStream(appPath));
    form.append('name', fileName);

    try {
      const response = await this.makeRequest('/v1/storage/upload', {
        method: 'POST',
        headers: form.getHeaders(),
        body: form,
      });

      const appId = response.item.id;
      console.log(`✅ App uploaded to Sauce Labs: ${appId}`);
      return `storage:${appId}`;
    } catch (error) {
      console.error('❌ Failed to upload app to Sauce Labs:', error.message);
      throw error;
    }
  }

  /**
   * Get Sauce Labs pricing information
   */
  getPricingInfo() {
    return {
      model: 'subscription',
      estimatedCostPerHour: 0, // Included in subscription
      freeTier: false,
      notes: 'Requires paid subscription (~$200-500/month)',
    };
  }

  /**
   * Format Sauce Labs device to common interface
   */
  formatDevice(rawDevice) {
    return {
      id: `saucelabs-${rawDevice.id}`,
      friendlyName: `${rawDevice.name} (Sauce Labs)`,
      deviceId: rawDevice.id,
      platform: rawDevice.os?.toLowerCase() === 'android' ? 'android' : 'ios',
      type: 'cloud',
      model: rawDevice.name,
      osVersion: rawDevice.osVersion || rawDevice.os_version || 'unknown',
      provider: this.providerName,
      available: rawDevice.isAvailable !== false,
      cloudMetadata: {
        provider: this.providerName,
        realDevice: true,
        os: rawDevice.os,
        osVersion: rawDevice.osVersion || rawDevice.os_version,
        deviceName: rawDevice.name,
        modelNumber: rawDevice.modelNumber,
        manufacturer: rawDevice.manufacturer,
        originalData: rawDevice,
      },
    };
  }

  /**
   * Make authenticated API request to Sauce Labs
   */
  async makeRequest(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
      const url = `${this.apiUrl}${endpoint}`;
      const auth = Buffer.from(`${this.username}:${this.accessKey}`).toString('base64');

      const requestOptions = {
        method: options.method || 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };

      const req = https.request(url, requestOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (error) {
              resolve(data);
            }
          } else {
            reject(new Error(`Sauce Labs API error: ${res.statusCode} - ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (options.body && !options.body.pipe) {
        // Regular JSON body
        req.write(JSON.stringify(options.body));
      } else if (options.body && options.body.pipe) {
        // FormData body
        options.body.pipe(req);
        return; // Don't call req.end() for streaming
      }

      req.end();
    });
  }

  /**
   * Start session (handled by Appium driver)
   */
  async startSession(deviceId, capabilities) {
    // Sauce Labs sessions are started through Appium WebDriver
    return {
      hubUrl: this.hubUrl,
      capabilities: await this.getCapabilities(deviceId, capabilities),
    };
  }

  /**
   * Stop session (handled by Appium driver)
   */
  async stopSession(sessionId) {
    // Sessions are stopped through Appium WebDriver
    return true;
  }

  /**
   * Get session status
   */
  async getSessionStatus(sessionId) {
    try {
      const session = await this.makeRequest(`/rest/v1/${this.username}/jobs/${sessionId}`);
      return session || null;
    } catch (error) {
      console.error('Failed to get session status:', error.message);
      return null;
    }
  }

  /**
   * Get data center options
   */
  static getDataCenters() {
    return [
      { value: 'us-west-1', label: 'US West (default)' },
      { value: 'us-east-4', label: 'US East' },
      { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
      { value: 'apac-southeast-1', label: 'Asia Pacific (Singapore)' },
    ];
  }
}

module.exports = SauceLabsProvider;
