const BaseCloudProvider = require('./BaseCloudProvider');
const https = require('https');

/**
 * BrowserStackProvider - BrowserStack cloud device farm integration
 *
 * Provides access to BrowserStack's real device cloud for mobile testing
 * Documentation: https://www.browserstack.com/docs/app-automate
 */
class BrowserStackProvider extends BaseCloudProvider {
  constructor(config = {}) {
    super(config);
    this.providerName = 'browserstack';
    this.username = config.username || process.env.BROWSERSTACK_USERNAME;
    this.accessKey = config.accessKey || process.env.BROWSERSTACK_ACCESS_KEY;
    this.hubUrl = 'https://hub-cloud.browserstack.com/wd/hub';
    this.apiUrl = 'https://api-cloud.browserstack.com/app-automate';
  }

  /**
   * Initialize BrowserStack provider
   */
  async initialize() {
    const validation = this.validateConfig();
    if (!validation.valid) {
      console.warn(`⚠️  BrowserStack not configured: ${validation.errors.join(', ')}`);
      this.enabled = false;
      return false;
    }

    try {
      // Test credentials by fetching account info
      await this.makeRequest('/plan.json');
      this.enabled = true;
      console.log('✅ BrowserStack provider initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize BrowserStack:', error.message);
      this.enabled = false;
      return false;
    }
  }

  /**
   * Validate BrowserStack configuration
   */
  validateConfig() {
    const errors = [];

    if (!this.username) {
      errors.push('BROWSERSTACK_USERNAME not set');
    }

    if (!this.accessKey) {
      errors.push('BROWSERSTACK_ACCESS_KEY not set');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Discover available BrowserStack devices
   */
  async discoverDevices() {
    if (!this.enabled) {
      return [];
    }

    try {
      const devices = await this.makeRequest('/devices.json');
      return devices.map(device => this.formatDevice(device));
    } catch (error) {
      console.error('❌ Failed to discover BrowserStack devices:', error.message);
      return [];
    }
  }

  /**
   * Get Appium capabilities for BrowserStack device
   */
  async getCapabilities(deviceId, appConfig = {}) {
    const capabilities = {
      'bstack:options': {
        userName: this.username,
        accessKey: this.accessKey,
        deviceName: deviceId,
        realMobile: true,
        ...appConfig.bstackOptions,
      },
      ...appConfig,
    };

    // Remove bstackOptions as it's been merged into bstack:options
    delete capabilities.bstackOptions;

    return capabilities;
  }

  /**
   * Get BrowserStack hub URL
   */
  getHubUrl() {
    return this.hubUrl;
  }

  /**
   * Upload app to BrowserStack
   */
  async uploadApp(appPath) {
    const fs = require('fs');
    const path = require('path');

    if (!fs.existsSync(appPath)) {
      throw new Error(`App file not found: ${appPath}`);
    }

    const fileName = path.basename(appPath);
    const fileData = fs.readFileSync(appPath);

    try {
      const response = await this.makeRequest('/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: {
          file: fileData,
          custom_id: fileName,
        },
      });

      console.log(`✅ App uploaded to BrowserStack: ${response.app_url}`);
      return response.app_url;
    } catch (error) {
      console.error('❌ Failed to upload app to BrowserStack:', error.message);
      throw error;
    }
  }

  /**
   * Get BrowserStack pricing information
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
   * Format BrowserStack device to common interface
   */
  formatDevice(rawDevice) {
    return {
      id: `browserstack-${rawDevice.device}`,
      friendlyName: `${rawDevice.device} (BrowserStack)`,
      deviceId: rawDevice.device,
      platform: rawDevice.os?.toLowerCase() === 'android' ? 'android' : 'ios',
      type: 'cloud',
      model: rawDevice.device,
      osVersion: rawDevice.os_version || 'unknown',
      provider: this.providerName,
      available: true,
      cloudMetadata: {
        provider: this.providerName,
        realDevice: rawDevice.realMobile === true,
        os: rawDevice.os,
        osVersion: rawDevice.os_version,
        deviceName: rawDevice.device,
        originalData: rawDevice,
      },
    };
  }

  /**
   * Make authenticated API request to BrowserStack
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
            reject(new Error(`BrowserStack API error: ${res.statusCode} - ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  /**
   * Start session (handled by Appium driver)
   */
  async startSession(deviceId, capabilities) {
    // BrowserStack sessions are started through Appium WebDriver
    // No separate session start API needed
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
      const sessions = await this.makeRequest('/sessions.json');
      const session = sessions.find(s => s.hashed_id === sessionId);
      return session || null;
    } catch (error) {
      console.error('Failed to get session status:', error.message);
      return null;
    }
  }
}

module.exports = BrowserStackProvider;
