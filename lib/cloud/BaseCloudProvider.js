/**
 * BaseCloudProvider - Abstract base class for cloud device farm providers
 *
 * All cloud providers (BrowserStack, Sauce Labs, AWS Device Farm, Firebase Test Lab)
 * must extend this class and implement the required methods.
 */
class BaseCloudProvider {
  constructor(config = {}) {
    this.config = config;
    this.providerName = 'base';
    this.enabled = false;
  }

  /**
   * Initialize the provider with credentials
   * @returns {Promise<boolean>} - Success status
   */
  async initialize() {
    throw new Error('initialize() must be implemented by provider');
  }

  /**
   * Check if provider is properly configured and enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Get provider name
   * @returns {string}
   */
  getProviderName() {
    return this.providerName;
  }

  /**
   * Discover available devices from the cloud provider
   * @returns {Promise<Array>} - Array of available devices
   */
  async discoverDevices() {
    throw new Error('discoverDevices() must be implemented by provider');
  }

  /**
   * Get capabilities for a specific cloud device
   * @param {string} deviceId - Cloud device identifier
   * @param {Object} appConfig - App configuration
   * @returns {Promise<Object>} - Appium capabilities
   */
  async getCapabilities(deviceId, appConfig = {}) {
    throw new Error('getCapabilities() must be implemented by provider');
  }

  /**
   * Start a test session on a cloud device
   * @param {string} deviceId - Cloud device identifier
   * @param {Object} capabilities - Appium capabilities
   * @returns {Promise<Object>} - Session information
   */
  async startSession(deviceId, capabilities) {
    throw new Error('startSession() must be implemented by provider');
  }

  /**
   * Stop a test session
   * @param {string} sessionId - Session identifier
   * @returns {Promise<boolean>} - Success status
   */
  async stopSession(sessionId) {
    throw new Error('stopSession() must be implemented by provider');
  }

  /**
   * Get session status
   * @param {string} sessionId - Session identifier
   * @returns {Promise<Object>} - Session status
   */
  async getSessionStatus(sessionId) {
    throw new Error('getSessionStatus() must be implemented by provider');
  }

  /**
   * Upload app to cloud provider
   * @param {string} appPath - Local path to app file
   * @returns {Promise<string>} - Cloud app URL/ID
   */
  async uploadApp(appPath) {
    throw new Error('uploadApp() must be implemented by provider');
  }

  /**
   * Get Appium hub URL for this provider
   * @returns {string} - Hub URL
   */
  getHubUrl() {
    throw new Error('getHubUrl() must be implemented by provider');
  }

  /**
   * Get pricing information (optional)
   * @returns {Object} - Pricing details
   */
  getPricingInfo() {
    return {
      model: 'unknown',
      estimatedCostPerHour: 0,
      freeTier: false,
    };
  }

  /**
   * Validate configuration
   * @returns {Object} - Validation result { valid: boolean, errors: Array }
   */
  validateConfig() {
    return {
      valid: false,
      errors: ['Provider not configured'],
    };
  }

  /**
   * Get available platforms
   * @returns {Array<string>} - Supported platforms (android, ios)
   */
  getSupportedPlatforms() {
    return ['android', 'ios'];
  }

  /**
   * Filter devices by criteria
   * @param {Array} devices - Devices array
   * @param {Object} filter - Filter criteria (platform, osVersion, etc.)
   * @returns {Array} - Filtered devices
   */
  filterDevices(devices, filter = {}) {
    let filtered = devices;

    if (filter.platform) {
      filtered = filtered.filter(d => d.platform === filter.platform);
    }

    if (filter.osVersion) {
      filtered = filtered.filter(d => d.osVersion === filter.osVersion);
    }

    if (filter.deviceName) {
      filtered = filtered.filter(d =>
        d.deviceName?.toLowerCase().includes(filter.deviceName.toLowerCase())
      );
    }

    return filtered;
  }

  /**
   * Format device for common interface
   * @param {Object} rawDevice - Provider-specific device object
   * @returns {Object} - Standardized device object
   */
  formatDevice(rawDevice) {
    return {
      id: rawDevice.id || 'unknown',
      friendlyName: rawDevice.name || 'Unknown Device',
      deviceId: rawDevice.id || 'unknown',
      platform: rawDevice.platform || 'unknown',
      type: 'cloud',
      model: rawDevice.model || rawDevice.device || 'unknown',
      osVersion: rawDevice.os_version || rawDevice.osVersion || 'unknown',
      provider: this.providerName,
      available: rawDevice.available !== false,
      cloudMetadata: {
        provider: this.providerName,
        originalData: rawDevice,
      },
    };
  }
}

module.exports = BaseCloudProvider;
