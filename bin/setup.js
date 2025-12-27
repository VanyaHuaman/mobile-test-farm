#!/usr/bin/env node

/**
 * Mobile Test Farm - One-Command Setup Script
 *
 * Automatically installs and configures everything needed to run mobile tests.
 *
 * Usage: npm run setup
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function exec(command, options = {}) {
  try {
    return execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return null;
  }
}

function execSilent(command) {
  try {
    return execSync(command, { stdio: 'pipe' }).toString().trim();
  } catch (error) {
    return null;
  }
}

function commandExists(command) {
  return execSilent(`which ${command}`) !== null;
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// OS Detection
function detectOS() {
  const platform = os.platform();
  if (platform === 'darwin') return 'macos';
  if (platform === 'linux') return 'linux';
  if (platform === 'win32') return 'windows';
  return 'unknown';
}

// Check Node.js version
function checkNodeVersion() {
  logInfo('Checking Node.js version...');
  const nodeVersion = process.version;
  const requiredVersion = 'v22.21.1';

  if (nodeVersion === requiredVersion) {
    logSuccess(`Node.js ${nodeVersion} detected`);
    return true;
  } else if (nodeVersion.startsWith('v22.')) {
    logWarning(`Node.js ${nodeVersion} detected (recommended: ${requiredVersion})`);
    return true;
  } else {
    logError(`Node.js ${nodeVersion} detected (required: ${requiredVersion})`);
    logInfo('Please install Node.js 22.21.1 LTS:');
    log('  nvm install 22.21.1 && nvm use 22.21.1', 'cyan');
    return false;
  }
}

// Check Java version
function checkJava() {
  logInfo('Checking Java installation...');

  if (!commandExists('java')) {
    logWarning('Java not found');
    return { installed: false, version: null };
  }

  const javaVersionOutput = execSilent('java -version 2>&1');
  const versionMatch = javaVersionOutput.match(/version "(\d+)/);
  const version = versionMatch ? parseInt(versionMatch[1]) : 0;

  if (version >= 11) {
    logSuccess(`Java ${version} detected`);
    return { installed: true, version };
  } else {
    logWarning(`Java ${version} detected (required: 11+)`);
    return { installed: false, version };
  }
}

// Check Android SDK
function checkAndroidSDK() {
  logInfo('Checking Android SDK...');

  const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;

  if (!androidHome) {
    logWarning('ANDROID_HOME not set');
    return { installed: false, path: null };
  }

  if (!fs.existsSync(androidHome)) {
    logWarning(`ANDROID_HOME points to non-existent path: ${androidHome}`);
    return { installed: false, path: androidHome };
  }

  const platformTools = path.join(androidHome, 'platform-tools');
  if (!fs.existsSync(platformTools)) {
    logWarning('platform-tools not found in Android SDK');
    return { installed: false, path: androidHome };
  }

  logSuccess(`Android SDK found at ${androidHome}`);
  return { installed: true, path: androidHome };
}

// Check Xcode (macOS only)
function checkXcode(platform) {
  if (platform !== 'macos') return { installed: false, skip: true };

  logInfo('Checking Xcode...');

  if (!commandExists('xcodebuild')) {
    logWarning('Xcode not installed');
    return { installed: false, skip: false };
  }

  const xcodeVersion = execSilent('xcodebuild -version');
  logSuccess(`Xcode installed: ${xcodeVersion.split('\n')[0]}`);
  return { installed: true, skip: false };
}

// Check Homebrew (macOS only)
function checkHomebrew(platform) {
  if (platform !== 'macos') return { installed: false, skip: true };

  logInfo('Checking Homebrew...');

  if (!commandExists('brew')) {
    logWarning('Homebrew not installed');
    return { installed: false, skip: false };
  }

  logSuccess('Homebrew installed');
  return { installed: true, skip: false };
}

// Install Homebrew
async function installHomebrew() {
  logInfo('Installing Homebrew...');
  log('This may take a few minutes and will require your password.', 'yellow');

  const installScript = '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"';
  exec(installScript);

  logSuccess('Homebrew installed');
}

// Check and install mitmproxy
async function setupMitmproxy(platform) {
  logInfo('Checking mitmproxy...');

  if (commandExists('mitmdump')) {
    const version = execSilent('mitmdump --version');
    logSuccess(`mitmproxy already installed: ${version}`);
    return true;
  }

  logWarning('mitmproxy not found, installing...');

  if (platform === 'macos') {
    exec('brew install mitmproxy');
    logSuccess('mitmproxy installed via Homebrew');
  } else if (platform === 'linux') {
    logInfo('Installing mitmproxy via pip...');
    exec('pip3 install mitmproxy');
    logSuccess('mitmproxy installed via pip');
  } else {
    logWarning('Please install mitmproxy manually:');
    log('  pip install mitmproxy', 'cyan');
    return false;
  }

  return true;
}

// Check and install Appium
async function setupAppium() {
  logInfo('Checking Appium...');

  // Check if Appium is installed globally
  const appiumVersion = execSilent('appium --version');

  if (appiumVersion) {
    if (appiumVersion.startsWith('3.')) {
      logSuccess(`Appium ${appiumVersion} already installed`);
      return true;
    } else {
      logWarning(`Appium ${appiumVersion} detected (upgrading to 3.x)`);
      exec('npm uninstall -g appium');
    }
  }

  logInfo('Installing Appium 3.x globally...');
  exec('npm install -g appium');

  const newVersion = execSilent('appium --version');
  logSuccess(`Appium ${newVersion} installed`);

  return true;
}

// Install Appium drivers
async function installAppiumDrivers(platform) {
  logInfo('Checking Appium drivers...');

  const installedDrivers = execSilent('appium driver list --installed');

  // Install UiAutomator2 for Android
  if (!installedDrivers || !installedDrivers.includes('uiautomator2')) {
    logInfo('Installing UiAutomator2 driver for Android...');
    exec('appium driver install uiautomator2');
    logSuccess('UiAutomator2 driver installed');
  } else {
    logSuccess('UiAutomator2 driver already installed');
  }

  // Install XCUITest for iOS (macOS only)
  if (platform === 'macos') {
    if (!installedDrivers || !installedDrivers.includes('xcuitest')) {
      logInfo('Installing XCUITest driver for iOS...');
      exec('appium driver install xcuitest');
      logSuccess('XCUITest driver installed');
    } else {
      logSuccess('XCUITest driver already installed');
    }
  }
}

// Setup environment variables
async function setupEnvironmentVariables(androidSDK) {
  logInfo('Setting up environment variables...');

  const homeDir = os.homedir();
  const shell = process.env.SHELL || '/bin/bash';
  let rcFile;

  if (shell.includes('zsh')) {
    rcFile = path.join(homeDir, '.zshrc');
  } else {
    rcFile = path.join(homeDir, '.bashrc');
  }

  // Check if environment variables are already set
  let rcContent = '';
  if (fs.existsSync(rcFile)) {
    rcContent = fs.readFileSync(rcFile, 'utf8');
  }

  const envVars = [];

  // Android SDK
  if (androidSDK.installed && !rcContent.includes('ANDROID_HOME')) {
    envVars.push(`export ANDROID_HOME="${androidSDK.path}"`);
    envVars.push('export PATH=$PATH:$ANDROID_HOME/platform-tools');
    envVars.push('export PATH=$PATH:$ANDROID_HOME/tools');
    envVars.push('export PATH=$PATH:$ANDROID_HOME/tools/bin');
  }

  // Java Home (if not set)
  if (!process.env.JAVA_HOME && !rcContent.includes('JAVA_HOME')) {
    const javaHome = execSilent('which java | xargs dirname | xargs dirname');
    if (javaHome) {
      envVars.push(`export JAVA_HOME="${javaHome}"`);
    }
  }

  if (envVars.length > 0) {
    logInfo(`Adding environment variables to ${rcFile}...`);

    const envBlock = [
      '',
      '# Mobile Test Farm - Environment Variables',
      ...envVars,
      ''
    ].join('\n');

    fs.appendFileSync(rcFile, envBlock);
    logSuccess('Environment variables added to shell profile');
    logWarning('Run "source ' + rcFile + '" or restart your terminal to apply changes');

    // Apply to current process
    envVars.forEach(line => {
      const match = line.match(/export (\w+)="?([^"]+)"?/);
      if (match) {
        process.env[match[1]] = match[2];
      }
    });
  } else {
    logSuccess('Environment variables already configured');
  }
}

// Install npm dependencies
async function installNpmDependencies() {
  logInfo('Installing npm dependencies...');
  exec('npm install');
  logSuccess('npm dependencies installed');
}

// Run MITM setup
async function runMitmSetup(platform) {
  logInfo('Setting up MITM proxy certificates...');

  const setupScript = path.join(__dirname, 'setup-mitm.js');

  if (!fs.existsSync(setupScript)) {
    logWarning('MITM setup script not found, skipping...');
    return;
  }

  // Check if devices are connected
  const androidDevices = execSilent('adb devices | grep -v "List" | grep "device$"');
  const hasAndroid = androidDevices && androidDevices.length > 0;

  let hasIOS = false;
  if (platform === 'macos') {
    const iosDevices = execSilent('xcrun simctl list devices | grep "Booted"');
    hasIOS = iosDevices && iosDevices.length > 0;
  }

  if (!hasAndroid && !hasIOS) {
    logWarning('No devices detected. MITM setup will be skipped.');
    logInfo('Run "npm run setup:mitm" after connecting devices.');
    return;
  }

  if (hasAndroid) {
    exec('node bin/setup-mitm.js android', { ignoreError: true });
  }

  if (hasIOS) {
    exec('node bin/setup-mitm.js ios', { ignoreError: true });
  }

  logSuccess('MITM setup completed');
}

// Verify Appium is working
async function verifyAppium() {
  logInfo('Verifying Appium installation...');

  const status = execSilent('appium driver list');
  if (status && (status.includes('uiautomator2') || status.includes('xcuitest'))) {
    logSuccess('Appium is ready');
    return true;
  } else {
    logError('Appium verification failed');
    return false;
  }
}

// Main setup function
async function setup() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'bright');
  log('║         Mobile Test Farm - One-Command Setup              ║', 'bright');
  log('╚════════════════════════════════════════════════════════════╝\n', 'bright');

  const platform = detectOS();
  logInfo(`Detected platform: ${platform}`);

  if (platform === 'unknown') {
    logError('Unsupported operating system');
    process.exit(1);
  }

  // Step 1: Check prerequisites
  logSection('Step 1: Checking Prerequisites');

  const nodeOk = checkNodeVersion();
  if (!nodeOk) {
    logError('Please install Node.js 22.21.1 and run this script again');
    process.exit(1);
  }

  const java = checkJava();
  const androidSDK = checkAndroidSDK();
  const xcode = checkXcode(platform);
  const homebrew = checkHomebrew(platform);

  // Step 2: Install missing dependencies
  logSection('Step 2: Installing Missing Dependencies');

  // Install Homebrew if needed (macOS)
  if (platform === 'macos' && !homebrew.installed && !homebrew.skip) {
    const answer = await question('Install Homebrew? (y/n): ');
    if (answer.toLowerCase() === 'y') {
      await installHomebrew();
    } else {
      logWarning('Skipping Homebrew installation');
    }
  }

  // Check Java
  if (!java.installed) {
    logWarning('Java 11+ is required for Android testing');
    if (platform === 'macos') {
      logInfo('Install Java via Homebrew:');
      log('  brew install openjdk@11', 'cyan');
      const answer = await question('Install Java now? (y/n): ');
      if (answer.toLowerCase() === 'y') {
        exec('brew install openjdk@11');
        logSuccess('Java installed');
      }
    } else {
      logInfo('Please install Java 11+ manually');
    }
  }

  // Check Android SDK
  if (!androidSDK.installed) {
    logWarning('Android SDK not found');
    logInfo('Please install Android Studio or Android SDK manually');
    logInfo('Download from: https://developer.android.com/studio');
    logInfo('After installation, set ANDROID_HOME in your shell profile');

    const answer = await question('Continue without Android SDK? Tests will only work with iOS (y/n): ');
    if (answer.toLowerCase() !== 'y') {
      process.exit(1);
    }
  }

  // Check Xcode
  if (platform === 'macos' && !xcode.installed) {
    logWarning('Xcode not found - required for iOS testing');
    logInfo('Install Xcode from the Mac App Store');
    logInfo('After installation, run: sudo xcode-select --switch /Applications/Xcode.app');
  }

  // Install mitmproxy
  await setupMitmproxy(platform);

  // Step 3: Install npm dependencies
  logSection('Step 3: Installing Project Dependencies');
  await installNpmDependencies();

  // Step 4: Install Appium and drivers
  logSection('Step 4: Installing Appium and Drivers');
  await setupAppium();
  await installAppiumDrivers(platform);

  // Step 5: Setup environment variables
  logSection('Step 5: Configuring Environment Variables');
  await setupEnvironmentVariables(androidSDK);

  // Step 6: Setup MITM certificates
  logSection('Step 6: Setting Up MITM Proxy');
  await runMitmSetup(platform);

  // Step 7: Verify installation
  logSection('Step 7: Verifying Installation');
  const appiumOk = await verifyAppium();

  // Final summary
  logSection('Setup Complete!');

  if (appiumOk) {
    logSuccess('All components installed successfully');
    log('\nNext steps:', 'bright');
    log('  1. Start Appium server: npx appium', 'cyan');
    log('  2. Connect your devices (emulator/simulator/physical)', 'cyan');
    log('  3. Register devices: npm run devices sync', 'cyan');
    log('  4. Run a test: npm run test:login', 'cyan');
    log('\nOr use the Web Dashboard:', 'bright');
    log('  npm run dashboard', 'cyan');
    log('  Then open: http://localhost:3000', 'cyan');
  } else {
    logWarning('Setup completed with warnings');
    logInfo('Please check the errors above and resolve them');
  }

  log('\n📖 Full documentation: README.md', 'blue');
  log('❓ Need help? https://github.com/VanyaHuaman/mobile-test-farm/issues\n', 'blue');

  rl.close();
}

// Run setup
setup().catch(error => {
  logError(`Setup failed: ${error.message}`);
  console.error(error);
  rl.close();
  process.exit(1);
});
