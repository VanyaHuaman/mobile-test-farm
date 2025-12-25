const BaseCloudProvider = require('./BaseCloudProvider');

/**
 * AWSDeviceFarmProvider - AWS Device Farm integration
 *
 * Provides access to AWS Device Farm for mobile testing
 * Documentation: https://docs.aws.amazon.com/devicefarm/
 *
 * Note: AWS Device Farm uses AWS SDK and requires different authentication
 * Pricing: Pay per device-minute (~$0.17/min)
 */
class AWSDeviceFarmProvider extends BaseCloudProvider {
  constructor(config = {}) {
    super(config);
    this.providerName = 'aws';
    this.accessKeyId = config.accessKeyId || process.env.AWS_ACCESS_KEY_ID;
    this.secretAccessKey = config.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY;
    this.region = config.region || process.env.AWS_REGION || 'us-west-2';
    this.projectArn = config.projectArn || process.env.AWS_DEVICE_FARM_PROJECT_ARN;

    // AWS Device Farm Appium endpoint
    this.hubUrl = null; // Set dynamically per test run
  }

  /**
   * Initialize AWS Device Farm provider
   */
  async initialize() {
    const validation = this.validateConfig();
    if (!validation.valid) {
      console.warn(`⚠️  AWS Device Farm not configured: ${validation.errors.join(', ')}`);
      this.enabled = false;
      return false;
    }

    try {
      // AWS Device Farm requires AWS SDK - check if available
      try {
        this.AWS = require('aws-sdk');
      } catch (error) {
        console.warn('⚠️  AWS SDK not installed. Run: npm install aws-sdk');
        this.enabled = false;
        return false;
      }

      // Configure AWS SDK
      this.AWS.config.update({
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
        region: this.region,
      });

      this.deviceFarm = new this.AWS.DeviceFarm();

      // Test credentials by listing projects
      await this.deviceFarm.listProjects().promise();

      this.enabled = true;
      console.log('✅ AWS Device Farm provider initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize AWS Device Farm:', error.message);
      this.enabled = false;
      return false;
    }
  }

  /**
   * Validate AWS Device Farm configuration
   */
  validateConfig() {
    const errors = [];

    if (!this.accessKeyId) {
      errors.push('AWS_ACCESS_KEY_ID not set');
    }

    if (!this.secretAccessKey) {
      errors.push('AWS_SECRET_ACCESS_KEY not set');
    }

    if (!this.projectArn) {
      errors.push('AWS_DEVICE_FARM_PROJECT_ARN not set');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Discover available AWS Device Farm devices
   */
  async discoverDevices() {
    if (!this.enabled) {
      return [];
    }

    try {
      const result = await this.deviceFarm.listDevices({}).promise();
      return result.devices.map(device => this.formatDevice(device));
    } catch (error) {
      console.error('❌ Failed to discover AWS Device Farm devices:', error.message);
      return [];
    }
  }

  /**
   * Get Appium capabilities for AWS Device Farm device
   */
  async getCapabilities(deviceId, appConfig = {}) {
    // AWS Device Farm capabilities are set via test spec and device pool
    // Rather than traditional Appium caps
    const capabilities = {
      platformName: appConfig.platformName,
      deviceName: deviceId,
      ...appConfig,
    };

    return capabilities;
  }

  /**
   * Get AWS Device Farm hub URL
   */
  getHubUrl() {
    // AWS Device Farm provides endpoint per test run
    // This is set when creating a remote web driver run
    return this.hubUrl || 'https://devicefarm-appium.us-west-2.amazonaws.com/wd/hub';
  }

  /**
   * Upload app to AWS Device Farm
   */
  async uploadApp(appPath) {
    const fs = require('fs');
    const path = require('path');

    if (!fs.existsSync(appPath)) {
      throw new Error(`App file not found: ${appPath}`);
    }

    try {
      // Create upload
      const createUploadParams = {
        name: path.basename(appPath),
        type: appPath.endsWith('.apk') ? 'ANDROID_APP' : 'IOS_APP',
        projectArn: this.projectArn,
      };

      const uploadResponse = await this.deviceFarm.createUpload(createUploadParams).promise();
      const uploadArn = uploadResponse.upload.arn;
      const uploadUrl = uploadResponse.upload.url;

      // Upload file to S3
      const https = require('https');
      const fileBuffer = fs.readFileSync(appPath);

      await new Promise((resolve, reject) => {
        const req = https.request(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Length': fileBuffer.length,
          },
        }, (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${res.statusCode}`));
          }
        });

        req.on('error', reject);
        req.write(fileBuffer);
        req.end();
      });

      // Wait for processing
      let upload = uploadResponse.upload;
      while (upload.status === 'PROCESSING' || upload.status === 'INITIALIZED') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const getUploadResponse = await this.deviceFarm.getUpload({ arn: uploadArn }).promise();
        upload = getUploadResponse.upload;
      }

      if (upload.status !== 'SUCCEEDED') {
        throw new Error(`Upload failed with status: ${upload.status}`);
      }

      console.log(`✅ App uploaded to AWS Device Farm: ${uploadArn}`);
      return uploadArn;
    } catch (error) {
      console.error('❌ Failed to upload app to AWS Device Farm:', error.message);
      throw error;
    }
  }

  /**
   * Get AWS Device Farm pricing information
   */
  getPricingInfo() {
    return {
      model: 'pay-per-use',
      estimatedCostPerHour: 10.2, // ~$0.17/min * 60
      freeTier: true,
      notes: '1000 device minutes free per month, then $0.17/min',
    };
  }

  /**
   * Format AWS Device Farm device to common interface
   */
  formatDevice(rawDevice) {
    return {
      id: `aws-${rawDevice.arn.split('/').pop()}`,
      friendlyName: `${rawDevice.name} (AWS)`,
      deviceId: rawDevice.arn,
      platform: rawDevice.platform?.toLowerCase() || 'unknown',
      type: 'cloud',
      model: rawDevice.model,
      osVersion: rawDevice.os || 'unknown',
      provider: this.providerName,
      available: rawDevice.availability === 'AVAILABLE',
      cloudMetadata: {
        provider: this.providerName,
        arn: rawDevice.arn,
        manufacturer: rawDevice.manufacturer,
        formFactor: rawDevice.formFactor,
        resolution: rawDevice.resolution,
        heapSize: rawDevice.heapSize,
        memory: rawDevice.memory,
        cpu: rawDevice.cpu,
        originalData: rawDevice,
      },
    };
  }

  /**
   * Start session (AWS specific)
   */
  async startSession(deviceId, capabilities) {
    // AWS Device Farm requires creating a test run
    // This is more complex than other providers
    return {
      hubUrl: this.getHubUrl(),
      capabilities: await this.getCapabilities(deviceId, capabilities),
      note: 'AWS Device Farm requires test run creation via AWS SDK',
    };
  }

  /**
   * Stop session
   */
  async stopSession(sessionId) {
    // Handled by AWS Device Farm automatically
    return true;
  }

  /**
   * Get session status
   */
  async getSessionStatus(runArn) {
    try {
      const response = await this.deviceFarm.getRun({ arn: runArn }).promise();
      return response.run;
    } catch (error) {
      console.error('Failed to get run status:', error.message);
      return null;
    }
  }

  /**
   * Create device pool for testing
   */
  async createDevicePool(name, deviceArns) {
    try {
      const params = {
        name,
        projectArn: this.projectArn,
        rules: deviceArns.map(arn => ({
          attribute: 'ARN',
          operator: 'EQUALS',
          value: arn,
        })),
      };

      const response = await this.deviceFarm.createDevicePool(params).promise();
      return response.devicePool;
    } catch (error) {
      console.error('Failed to create device pool:', error.message);
      throw error;
    }
  }
}

module.exports = AWSDeviceFarmProvider;
