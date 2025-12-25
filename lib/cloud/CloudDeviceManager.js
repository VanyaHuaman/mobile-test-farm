const BrowserStackProvider = require('./BrowserStackProvider');
const SauceLabsProvider = require('./SauceLabsProvider');
const AWSDeviceFarmProvider = require('./AWSDeviceFarmProvider');
const FirebaseTestLabProvider = require('./FirebaseTestLabProvider');

/**
 * CloudDeviceManager - Manages all cloud device farm providers
 *
 * Provides unified interface to access devices from multiple cloud providers:
 * - BrowserStack ✅
 * - Sauce Labs ✅
 * - AWS Device Farm ✅
 * - Firebase Test Lab ✅
 */
class CloudDeviceManager {
  constructor() {
    this.providers = new Map();
    this.initializeProviders();
  }

  /**
   * Initialize all cloud providers
   */
  async initializeProviders() {
    console.log('\n🌐 Initializing cloud device providers...\n');

    // BrowserStack
    const browserstack = new BrowserStackProvider();
    await browserstack.initialize();
    this.providers.set('browserstack', browserstack);

    // Sauce Labs
    const sauceLabs = new SauceLabsProvider();
    await sauceLabs.initialize();
    this.providers.set('saucelabs', sauceLabs);

    // AWS Device Farm
    const awsDeviceFarm = new AWSDeviceFarmProvider();
    await awsDeviceFarm.initialize();
    this.providers.set('aws', awsDeviceFarm);

    // Firebase Test Lab
    const firebaseTestLab = new FirebaseTestLabProvider();
    await firebaseTestLab.initialize();
    this.providers.set('firebase', firebaseTestLab);

    const enabledProviders = Array.from(this.providers.values())
      .filter(p => p.isEnabled())
      .map(p => p.getProviderName());

    if (enabledProviders.length > 0) {
      console.log(`✅ Enabled cloud providers: ${enabledProviders.join(', ')}\n`);
    } else {
      console.log('⚠️  No cloud providers configured\n');
    }
  }

  /**
   * Get all enabled providers
   */
  getEnabledProviders() {
    return Array.from(this.providers.values()).filter(p => p.isEnabled());
  }

  /**
   * Get specific provider by name
   */
  getProvider(providerName) {
    return this.providers.get(providerName);
  }

  /**
   * Check if any cloud providers are enabled
   */
  hasEnabledProviders() {
    return this.getEnabledProviders().length > 0;
  }

  /**
   * Discover devices from all enabled cloud providers
   */
  async discoverAllDevices() {
    const enabledProviders = this.getEnabledProviders();

    if (enabledProviders.length === 0) {
      console.log('⚠️  No cloud providers enabled');
      return [];
    }

    console.log('\n🔍 Discovering cloud devices...\n');

    const allDevices = [];

    for (const provider of enabledProviders) {
      try {
        console.log(`  📡 ${provider.getProviderName()}...`);
        const devices = await provider.discoverDevices();
        console.log(`     Found ${devices.length} device(s)`);
        allDevices.push(...devices);
      } catch (error) {
        console.error(`     ❌ Error: ${error.message}`);
      }
    }

    console.log(`\n✅ Total cloud devices discovered: ${allDevices.length}\n`);
    return allDevices;
  }

  /**
   * Discover devices from specific provider
   */
  async discoverDevices(providerName) {
    const provider = this.getProvider(providerName);

    if (!provider) {
      throw new Error(`Provider '${providerName}' not found`);
    }

    if (!provider.isEnabled()) {
      throw new Error(`Provider '${providerName}' is not enabled`);
    }

    return await provider.discoverDevices();
  }

  /**
   * Get devices by platform from all providers
   */
  async getDevicesByPlatform(platform) {
    const allDevices = await this.discoverAllDevices();
    return allDevices.filter(d => d.platform === platform);
  }

  /**
   * Get capabilities for a cloud device
   */
  async getCapabilities(deviceId, appConfig = {}) {
    // Determine provider from device ID
    let provider;

    if (deviceId.startsWith('browserstack-')) {
      provider = this.getProvider('browserstack');
    } else if (deviceId.startsWith('saucelabs-')) {
      provider = this.getProvider('saucelabs');
    } else if (deviceId.startsWith('aws-')) {
      provider = this.getProvider('aws');
    } else if (deviceId.startsWith('firebase-')) {
      provider = this.getProvider('firebase');
    } else {
      throw new Error(`Cannot determine provider for device: ${deviceId}`);
    }

    if (!provider || !provider.isEnabled()) {
      throw new Error(`Provider for device '${deviceId}' is not enabled`);
    }

    // Extract actual device ID (remove provider prefix)
    const actualDeviceId = deviceId.replace(/^[a-z]+-/, '');
    return await provider.getCapabilities(actualDeviceId, appConfig);
  }

  /**
   * Get hub URL for a cloud device
   */
  getHubUrl(deviceId) {
    // Determine provider from device ID
    if (deviceId.startsWith('browserstack-')) {
      return this.getProvider('browserstack')?.getHubUrl();
    } else if (deviceId.startsWith('saucelabs-')) {
      return this.getProvider('saucelabs')?.getHubUrl();
    } else if (deviceId.startsWith('aws-')) {
      return this.getProvider('aws')?.getHubUrl();
    } else if (deviceId.startsWith('firebase-')) {
      return this.getProvider('firebase')?.getHubUrl();
    }

    throw new Error(`Cannot determine provider for device: ${deviceId}`);
  }

  /**
   * Upload app to specific cloud provider
   */
  async uploadApp(providerName, appPath) {
    const provider = this.getProvider(providerName);

    if (!provider) {
      throw new Error(`Provider '${providerName}' not found`);
    }

    if (!provider.isEnabled()) {
      throw new Error(`Provider '${providerName}' is not enabled`);
    }

    return await provider.uploadApp(appPath);
  }

  /**
   * Get all provider configuration status
   */
  getProvidersStatus() {
    const status = [];

    for (const [name, provider] of this.providers.entries()) {
      const validation = provider.validateConfig();
      status.push({
        name,
        enabled: provider.isEnabled(),
        configured: validation.valid,
        errors: validation.errors,
        pricingInfo: provider.getPricingInfo(),
        platforms: provider.getSupportedPlatforms(),
      });
    }

    return status;
  }

  /**
   * Print providers status
   */
  printProvidersStatus() {
    const status = this.getProvidersStatus();

    console.log('\n☁️  Cloud Device Providers Status:\n');
    console.log('─'.repeat(80));

    status.forEach(provider => {
      const statusIcon = provider.enabled ? '✅' : provider.configured ? '⏸️ ' : '❌';
      const statusText = provider.enabled ? 'ENABLED' : provider.configured ? 'DISABLED' : 'NOT CONFIGURED';

      console.log(`${statusIcon} ${provider.name.toUpperCase()} - ${statusText}`);
      console.log(`   Platforms: ${provider.platforms.join(', ')}`);
      console.log(`   Pricing: ${provider.pricingInfo.model} (${provider.pricingInfo.notes || 'See provider docs'})`);

      if (!provider.configured) {
        console.log(`   ⚠️  Configuration errors:`);
        provider.errors.forEach(err => {
          console.log(`      - ${err}`);
        });
      }

      console.log('─'.repeat(80));
    });

    console.log('');
  }
}

module.exports = CloudDeviceManager;
