#!/usr/bin/env node

/**
 * Setup MITM Proxy for Mobile Testing
 *
 * This script handles:
 * 1. Installing mitmproxy (if needed)
 * 2. Generating certificates
 * 3. Installing certificates on Android emulators
 * 4. Installing certificates on iOS simulators
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const MitmProxyManager = require('../lib/MitmProxyManager');
const DeviceManager = require('../lib/device-manager');

const MITM_CERT_DIR = path.join(os.homedir(), '.mitmproxy');

class MitmSetup {
  constructor() {
    this.mitmManager = new MitmProxyManager();
    this.deviceManager = new DeviceManager();
  }

  /**
   * Check if mitmproxy is installed
   */
  checkMitmproxyInstalled() {
    console.log('\n🔍 Checking mitmproxy installation...\n');

    if (this.mitmManager.isInstalled()) {
      try {
        const version = execSync('mitmdump --version', { encoding: 'utf8' }).trim();
        console.log(`✅ mitmproxy is installed: ${version}`);
        return true;
      } catch (error) {
        console.log('✅ mitmproxy is installed');
        return true;
      }
    } else {
      console.log('❌ mitmproxy is NOT installed\n');
      console.log('📦 Installation instructions:');
      console.log('   macOS:   brew install mitmproxy');
      console.log('   Linux:   pip install mitmproxy');
      console.log('   Windows: pip install mitmproxy\n');
      return false;
    }
  }

  /**
   * Generate mitmproxy certificates
   */
  async generateCertificates() {
    console.log('\n🔐 Setting up certificates...\n');

    const status = this.mitmManager.getCertificateStatus();

    if (status.exists && Object.values(status.certificates).some(exists => exists)) {
      console.log(`✅ Certificates already exist at: ${MITM_CERT_DIR}`);
      console.log('\nCertificate files:');
      Object.entries(status.certificates).forEach(([file, exists]) => {
        console.log(`   ${exists ? '✅' : '❌'} ${file}`);
      });
      return true;
    }

    try {
      await this.mitmManager.generateCertificates();
      return true;
    } catch (error) {
      console.error('❌ Failed to generate certificates:', error.message);
      return false;
    }
  }

  /**
   * Create mitmproxy config file
   */
  createMitmproxyConfig() {
    console.log('\n⚙️  Creating mitmproxy configuration...\n');

    const configPath = path.join(MITM_CERT_DIR, 'config.yaml');
    const configContent = `# mitmproxy configuration for Mobile Test Farm
# This config maps Android emulator's 10.0.2.2 (host) to localhost
# Port 8889 is used to avoid conflicts with Charles Proxy (8888)

map_remote:
  - "|http://10.0.2.2|http://localhost"
  - "|https://10.0.2.2|https://localhost"
listen_port: 8889
`;

    try {
      // Check if config already exists
      if (fs.existsSync(configPath)) {
        console.log(`✅ Config already exists at: ${configPath}`);
        console.log('   Skipping config creation (use --force to overwrite)\n');
        return true;
      }

      // Create config directory if it doesn't exist
      if (!fs.existsSync(MITM_CERT_DIR)) {
        fs.mkdirSync(MITM_CERT_DIR, { recursive: true });
      }

      // Write config file
      fs.writeFileSync(configPath, configContent, 'utf8');
      console.log(`✅ Created config at: ${configPath}`);
      console.log('\nConfiguration:');
      console.log('   • Port: 8889 (avoids Charles Proxy conflict on 8888)');
      console.log('   • Maps Android emulator 10.0.2.2 → localhost');
      console.log('   • Enables HTTPS requests from React Native apps\n');
      return true;
    } catch (error) {
      console.error(`❌ Failed to create config: ${error.message}`);
      return false;
    }
  }

  /**
   * Install certificate on Android emulator
   */
  async installAndroidCertificate(deviceId) {
    console.log(`\n📱 Installing certificate on Android device: ${deviceId}\n`);

    const certPath = this.mitmManager.getCertificatePath('android');

    if (!fs.existsSync(certPath)) {
      console.error(`❌ Certificate not found: ${certPath}`);
      console.log('   Run certificate generation first\n');
      return false;
    }

    try {
      // Check if device is connected
      const devicesOutput = execSync('adb devices', { encoding: 'utf8' });
      if (!devicesOutput.includes(deviceId)) {
        console.error(`❌ Device ${deviceId} not found`);
        console.log('\nConnected devices:');
        console.log(devicesOutput);
        return false;
      }

      // Push certificate to device
      console.log('📤 Pushing certificate to device...');
      execSync(`adb -s ${deviceId} push "${certPath}" /sdcard/mitmproxy-ca-cert.cer`, { stdio: 'inherit' });

      console.log('\n✅ Certificate pushed to /sdcard/mitmproxy-ca-cert.cer');
      console.log('\n⚠️  MANUAL STEP REQUIRED:');
      console.log('   1. Open Settings on the Android device/emulator');
      console.log('   2. Go to Security → Encryption & credentials → Install a certificate');
      console.log('   3. Select "CA certificate"');
      console.log('   4. Tap "Install anyway" (if warned)');
      console.log('   5. Navigate to Downloads or SD card');
      console.log('   6. Select "mitmproxy-ca-cert.cer"');
      console.log('   7. Name it "mitmproxy" and tap OK\n');

      console.log('🤖 Or use this automated approach (requires root):');
      console.log(`   adb -s ${deviceId} shell "su -c 'cp /sdcard/mitmproxy-ca-cert.cer /system/etc/security/cacerts/'"\n`);

      return true;
    } catch (error) {
      console.error(`❌ Failed to install certificate: ${error.message}`);
      return false;
    }
  }

  /**
   * Install certificate on iOS simulator
   */
  async installIOSCertificate(deviceId) {
    console.log(`\n📱 Installing certificate on iOS simulator: ${deviceId}\n`);

    const certPath = this.mitmManager.getCertificatePath('ios');

    if (!fs.existsSync(certPath)) {
      console.error(`❌ Certificate not found: ${certPath}`);
      console.log('   Run certificate generation first\n');
      return false;
    }

    try {
      // Install certificate using simctl
      console.log('📤 Installing certificate on simulator...');
      execSync(`xcrun simctl keychain ${deviceId} add-root-cert "${certPath}"`, { stdio: 'inherit' });

      console.log(`\n✅ Certificate installed on iOS simulator ${deviceId}`);
      console.log('\n⚠️  Trust the certificate:');
      console.log('   1. Open Settings app on simulator');
      console.log('   2. Go to General → About → Certificate Trust Settings');
      console.log('   3. Enable "mitmproxy"\n');

      return true;
    } catch (error) {
      console.error(`❌ Failed to install certificate: ${error.message}`);

      if (error.message.includes('No devices are booted')) {
        console.log('\n💡 Tip: Boot the simulator first:');
        console.log(`   xcrun simctl boot ${deviceId}`);
        console.log(`   or: open -a Simulator\n`);
      }

      return false;
    }
  }

  /**
   * Setup for all Android emulators
   */
  async setupAndroid() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  ANDROID EMULATOR SETUP');
    console.log('═══════════════════════════════════════════════════════════');

    const devices = this.deviceManager.discoverAndroidDevices();

    if (devices.length === 0) {
      console.log('\n⚠️  No Android devices found');
      console.log('   Start an emulator first, then run this script again\n');
      return;
    }

    console.log(`\n✅ Found ${devices.length} Android device(s):\n`);
    devices.forEach((device, index) => {
      const icon = device.type === 'emulator' ? '🖥️ ' : '📱';
      console.log(`   ${index + 1}. ${icon} ${device.deviceId} (${device.model})`);
    });

    // Install on all emulators
    for (const device of devices) {
      if (device.type === 'emulator') {
        await this.installAndroidCertificate(device.deviceId);
      } else {
        console.log(`\n⏭️  Skipping physical device: ${device.deviceId}`);
        console.log('   Physical devices require different setup\n');
      }
    }
  }

  /**
   * Setup for all iOS simulators
   */
  async setupIOS() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  IOS SIMULATOR SETUP');
    console.log('═══════════════════════════════════════════════════════════');

    const devices = this.deviceManager.discoverIOSSimulators();

    if (devices.length === 0) {
      console.log('\n⚠️  No iOS simulators booted');
      console.log('   Boot a simulator first, then run this script again');
      console.log('   Command: open -a Simulator\n');
      return;
    }

    console.log(`\n✅ Found ${devices.length} booted iOS simulator(s):\n`);
    devices.forEach((device, index) => {
      console.log(`   ${index + 1}. 📲 ${device.model} (${device.deviceId.substring(0, 8)}...)`);
    });

    // Install on all simulators
    for (const device of devices) {
      await this.installIOSCertificate(device.deviceId);
    }
  }

  /**
   * Main setup flow
   */
  async run(options = {}) {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  MITM Proxy Setup for Mobile Test Farm                   ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');

    // Step 1: Check mitmproxy installation
    const isInstalled = this.checkMitmproxyInstalled();
    if (!isInstalled) {
      console.log('\n❌ Please install mitmproxy first, then run this script again\n');
      process.exit(1);
    }

    // Step 2: Generate certificates
    const certsGenerated = await this.generateCertificates();
    if (!certsGenerated) {
      console.log('\n❌ Certificate generation failed\n');
      process.exit(1);
    }

    // Step 3: Create mitmproxy config
    const configCreated = this.createMitmproxyConfig();
    if (!configCreated) {
      console.log('\n⚠️  Config creation failed (continuing anyway)\n');
    }

    // Step 4: Install on devices
    if (options.platform === 'android' || !options.platform) {
      await this.setupAndroid();
    }

    if (options.platform === 'ios' || !options.platform) {
      await this.setupIOS();
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  SETUP COMPLETE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n✅ MITM proxy setup finished!');
    console.log('\n📝 Next steps:');
    console.log('   1. Complete any manual certificate trust steps above');
    console.log('   2. Run a test with mocking enabled');
    console.log('   3. The app will use Mockoon automatically via proxy\n');
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  if (args.includes('--android')) {
    options.platform = 'android';
  } else if (args.includes('--ios')) {
    options.platform = 'ios';
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log('\nUsage: node setup-mitm.js [options]\n');
    console.log('Options:');
    console.log('  --android    Setup Android emulators only');
    console.log('  --ios        Setup iOS simulators only');
    console.log('  --help       Show this help message\n');
    console.log('Examples:');
    console.log('  node setup-mitm.js              # Setup both platforms');
    console.log('  node setup-mitm.js --android    # Android only');
    console.log('  node setup-mitm.js --ios        # iOS only\n');
    process.exit(0);
  }

  const setup = new MitmSetup();
  setup.run(options).catch(error => {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  });
}

module.exports = MitmSetup;
