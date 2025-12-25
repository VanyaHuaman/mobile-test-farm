const BaseCloudProvider = require('./BaseCloudProvider');

/**
 * FirebaseTestLabProvider - Firebase Test Lab integration
 *
 * Provides access to Firebase Test Lab for mobile testing
 * Documentation: https://firebase.google.com/docs/test-lab
 *
 * Note: Firebase Test Lab uses Google Cloud SDK
 * Pricing: Free tier available (10 tests/day on physical devices, 5 tests/day on virtual devices)
 */
class FirebaseTestLabProvider extends BaseCloudProvider {
  constructor(config = {}) {
    super(config);
    this.providerName = 'firebase';
    this.projectId = config.projectId || process.env.FIREBASE_PROJECT_ID;
    this.credentialsPath = config.credentialsPath || process.env.GOOGLE_APPLICATION_CREDENTIALS;

    // Firebase Test Lab doesn't provide direct Appium access
    // Tests are run via gcloud CLI or REST API
    this.hubUrl = null;
  }

  /**
   * Initialize Firebase Test Lab provider
   */
  async initialize() {
    const validation = this.validateConfig();
    if (!validation.valid) {
      console.warn(`⚠️  Firebase Test Lab not configured: ${validation.errors.join(', ')}`);
      this.enabled = false;
      return false;
    }

    try {
      // Check if Google Cloud SDK is available
      const { execSync } = require('child_process');

      try {
        execSync('gcloud --version', { stdio: 'pipe' });
      } catch (error) {
        console.warn('⚠️  gcloud CLI not installed. See: https://cloud.google.com/sdk/docs/install');
        this.enabled = false;
        return false;
      }

      // Authenticate with service account
      if (this.credentialsPath) {
        execSync(`gcloud auth activate-service-account --key-file=${this.credentialsPath}`, {
          stdio: 'pipe',
        });
      }

      // Set project
      execSync(`gcloud config set project ${this.projectId}`, { stdio: 'pipe' });

      this.enabled = true;
      console.log('✅ Firebase Test Lab provider initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Test Lab:', error.message);
      this.enabled = false;
      return false;
    }
  }

  /**
   * Validate Firebase Test Lab configuration
   */
  validateConfig() {
    const errors = [];

    if (!this.projectId) {
      errors.push('FIREBASE_PROJECT_ID not set');
    }

    if (!this.credentialsPath) {
      errors.push('GOOGLE_APPLICATION_CREDENTIALS not set');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Discover available Firebase Test Lab devices
   */
  async discoverDevices() {
    if (!this.enabled) {
      return [];
    }

    try {
      const { execSync } = require('child_process');

      // Get Android devices
      const androidOutput = execSync('gcloud firebase test android models list --format=json', {
        encoding: 'utf8',
      });
      const androidDevices = JSON.parse(androidOutput);

      // Get iOS devices
      let iosDevices = [];
      try {
        const iosOutput = execSync('gcloud firebase test ios models list --format=json', {
          encoding: 'utf8',
        });
        iosDevices = JSON.parse(iosOutput);
      } catch (error) {
        // iOS may not be available in all regions
        console.warn('⚠️  iOS devices not available');
      }

      const allDevices = [
        ...androidDevices.map(d => ({ ...d, platform: 'android' })),
        ...iosDevices.map(d => ({ ...d, platform: 'ios' })),
      ];

      return allDevices.map(device => this.formatDevice(device));
    } catch (error) {
      console.error('❌ Failed to discover Firebase Test Lab devices:', error.message);
      return [];
    }
  }

  /**
   * Get capabilities for Firebase Test Lab device
   */
  async getCapabilities(deviceId, appConfig = {}) {
    // Firebase Test Lab doesn't use traditional Appium capabilities
    // Tests are configured via test matrix
    return {
      deviceId,
      ...appConfig,
    };
  }

  /**
   * Get hub URL (not applicable for Firebase)
   */
  getHubUrl() {
    // Firebase Test Lab doesn't provide direct Appium hub access
    return null;
  }

  /**
   * Upload app to Firebase Test Lab
   */
  async uploadApp(appPath) {
    const fs = require('fs');
    const path = require('path');

    if (!fs.existsSync(appPath)) {
      throw new Error(`App file not found: ${appPath}`);
    }

    try {
      const { execSync } = require('child_process');
      const fileName = path.basename(appPath);
      const bucketPath = `gs://${this.projectId}_test_lab_uploads/${fileName}`;

      // Upload to Google Cloud Storage
      execSync(`gsutil cp ${appPath} ${bucketPath}`, { stdio: 'pipe' });

      console.log(`✅ App uploaded to Firebase Test Lab: ${bucketPath}`);
      return bucketPath;
    } catch (error) {
      console.error('❌ Failed to upload app to Firebase Test Lab:', error.message);
      throw error;
    }
  }

  /**
   * Get Firebase Test Lab pricing information
   */
  getPricingInfo() {
    return {
      model: 'freemium',
      estimatedCostPerHour: 0, // Free tier available
      freeTier: true,
      notes: 'Free: 10 physical/day, 5 virtual/day. Paid: ~$1-5/hour depending on device',
    };
  }

  /**
   * Format Firebase Test Lab device to common interface
   */
  formatDevice(rawDevice) {
    return {
      id: `firebase-${rawDevice.id}`,
      friendlyName: `${rawDevice.name} (Firebase)`,
      deviceId: rawDevice.id,
      platform: rawDevice.platform || 'android',
      type: 'cloud',
      model: rawDevice.name,
      osVersion: rawDevice.supportedVersionIds?.join(', ') || 'unknown',
      provider: this.providerName,
      available: rawDevice.supportedVersionIds?.length > 0,
      cloudMetadata: {
        provider: this.providerName,
        formFactor: rawDevice.form,
        manufacturer: rawDevice.manufacturer,
        supportedVersionIds: rawDevice.supportedVersionIds,
        tags: rawDevice.tags,
        originalData: rawDevice,
      },
    };
  }

  /**
   * Run test on Firebase Test Lab
   */
  async runTest(appPath, testType = 'instrumentation', options = {}) {
    try {
      const { execSync } = require('child_process');

      const platform = options.platform || 'android';
      const deviceIds = options.deviceIds || [];
      const osVersions = options.osVersions || [];

      let command = `gcloud firebase test ${platform} run`;
      command += ` --app ${appPath}`;

      if (testType === 'instrumentation' && options.testApp) {
        command += ` --test ${options.testApp}`;
      }

      if (deviceIds.length > 0) {
        command += ` --device model=${deviceIds.join(',')}`;
      }

      if (osVersions.length > 0) {
        command += ` version=${osVersions.join(',')}`;
      }

      command += ' --format=json';

      const output = execSync(command, { encoding: 'utf8' });
      const result = JSON.parse(output);

      console.log('✅ Test submitted to Firebase Test Lab');
      return result;
    } catch (error) {
      console.error('❌ Failed to run test on Firebase Test Lab:', error.message);
      throw error;
    }
  }

  /**
   * Start session (not applicable)
   */
  async startSession(deviceId, capabilities) {
    return {
      note: 'Firebase Test Lab runs tests via gcloud CLI, not direct Appium sessions',
    };
  }

  /**
   * Stop session (not applicable)
   */
  async stopSession(sessionId) {
    return true;
  }

  /**
   * Get test status
   */
  async getSessionStatus(testMatrixId) {
    try {
      const { execSync } = require('child_process');
      const output = execSync(`gcloud firebase test results describe ${testMatrixId} --format=json`, {
        encoding: 'utf8',
      });
      return JSON.parse(output);
    } catch (error) {
      console.error('Failed to get test status:', error.message);
      return null;
    }
  }

  /**
   * Get supported platforms
   */
  getSupportedPlatforms() {
    return ['android', 'ios'];
  }
}

module.exports = FirebaseTestLabProvider;
