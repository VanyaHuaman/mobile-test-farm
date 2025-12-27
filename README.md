# Mobile Test Farm

> **📦 Template Branch** - This is the clean starter template for new projects.
> **✨ Want to see examples?** Check out the [`master` branch](https://github.com/VanyaHuaman/mobile-test-farm/tree/master) for a complete working example with a real Expo app.

[![Mobile Test Farm CI](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/mobile-tests.yml/badge.svg)](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/mobile-tests.yml)
[![Android Tests](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/test-android.yml/badge.svg)](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/test-android.yml)
[![iOS Tests](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/test-ios.yml/badge.svg)](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/test-ios.yml)

Automated mobile device testing infrastructure for running tests across multiple Android and iOS devices with user-friendly device management.

**Start your project:**
```bash
git clone -b template https://github.com/VanyaHuaman/mobile-test-farm.git my-mobile-tests
cd my-mobile-tests
npm run setup
```

See **[GETTING_STARTED.md](GETTING_STARTED.md)** for a quick setup guide.

## Features

✅ **Universal Device Support** - Works with emulators, simulators, and physical devices
✅ **Cloud Device Farms** - Run tests on BrowserStack, Sauce Labs, AWS, Firebase
✅ **User-Friendly Device Names** - Use "Lenovo 11-inch Tablet" instead of cryptic IDs
✅ **Automated Testing** - Run end-to-end tests with Appium + WebDriverIO
✅ **Parallel Test Execution** - Run tests across multiple devices simultaneously
✅ **Hybrid Testing** - Mix local devices with cloud devices in parallel
✅ **Page Object Model** - Maintainable test architecture with automatic screenshot on failure
✅ **Video Recording** - Automatic video recording on test failure for debugging
✅ **HTML Test Reports** - Beautiful Allure reports with charts, videos, and history
✅ **CI/CD Ready** - GitHub Actions workflows for automated testing
✅ **Device Registry** - Centralized device configuration and management
✅ **Cross-Platform** - Same tests run on both Android and iOS
✅ **Appium 3** - Latest Appium with modern architecture
✅ **Multi-Platform Notifications** - Slack, Teams, Discord, Email, Custom Webhooks
✅ **Test Retry Logic** - Automatic retry for failed tests with configurable attempts
✅ **Nightly Test Runs** - Scheduled daily test execution via GitHub Actions
✅ **Web Dashboard** - User-friendly web UI for device management and test execution
✅ **Transparent API Mocking** - MITM proxy + Mockoon for zero-code-change mocking on Android & iOS
✅ **Test Variants** - Multiple test configurations for different scenarios (500 errors, timeouts, etc.)
✅ **Traffic Recording** - Automatic API call recording on test failure for debugging

## Quick Start

### Option 1: Automated Setup (Recommended for First Time)

Run the one-command setup script that automatically installs and configures everything:

```bash
cd mobile-test-farm
npm run setup
```

This interactive script will:
- ✅ Check your system requirements (Node.js, Java, Android SDK, Xcode)
- ✅ Install missing dependencies (Homebrew, mitmproxy, Appium)
- ✅ Configure environment variables automatically
- ✅ Install Appium drivers (UiAutomator2, XCUITest)
- ✅ Set up MITM proxy certificates for API mocking
- ✅ Verify everything is working

After setup completes, configure your app:

#### Configure Your App

Edit `config/test.config.js` to point to your mobile app:

```javascript
apps: {
  android: {
    debug: '/path/to/your/app-debug.apk',  // ← Update with your APK path
  },
  ios: {
    simulator: '/path/to/YourApp.app',     // ← Update with your .app path
  },
},
appInfo: {
  android: {
    package: 'com.yourcompany.yourapp',    // ← Your app's package name
    activity: '.MainActivity',              // ← Usually this for React Native/Expo
  },
  ios: {
    bundleId: 'com.yourcompany.yourapp',   // ← Your app's bundle identifier
  },
},
```

**Find your package/bundle ID:**

```bash
# Android - Find package name
adb shell pm list packages | grep yourapp
# Example output: package:com.mycompany.myapp

# iOS - Find bundle ID
/usr/libexec/PlistBuddy -c "Print CFBundleIdentifier" /path/to/YourApp.app/Info.plist
# Example output: com.mycompany.myapp
```

Or set via environment variables:

```bash
export ANDROID_APP_DEBUG=/path/to/your/app-debug.apk
export ANDROID_PACKAGE=com.yourcompany.yourapp
export IOS_APP_SIMULATOR=/path/to/YourApp.app
export IOS_BUNDLE_ID=com.yourcompany.yourapp
```

#### Run Your First Test

```bash
# Start Appium server
npx appium

# In another terminal, sync and register your devices
npm run devices sync
npm run devices register

# Run a test (update the test to match your app)
npm run test:login

# Or use the Web Dashboard
npm run dashboard
```

### Option 2: Web Dashboard (Recommended for Teams)

```bash
# Start the dashboard server
npm run dashboard
```

Open your browser to: **http://localhost:3000**

The web dashboard provides:
- Visual device management
- One-click test execution
- Real-time test output
- Results browser
- No command-line knowledge required

See [Web Dashboard Guide](docs/web-dashboard.md) for detailed instructions.

### Option 3: Manual Installation

If you prefer to install components manually:

#### 1. Install Node.js 22.21.1 LTS

```bash
# Using nvm (recommended)
nvm install 22.21.1
nvm use 22.21.1

# Verify installation
node --version  # Should show v22.21.1
npm --version   # Should show 10.9.4
```

#### 2. Install Dependencies

```bash
cd mobile-test-farm
npm install
```

#### 3. Install Appium and Drivers

```bash
# Install Appium globally
npm install -g appium

# Install drivers
appium driver install uiautomator2  # For Android
appium driver install xcuitest      # For iOS (macOS only)
```

#### 4. Install Additional Tools

```bash
# macOS
brew install mitmproxy

# Linux
pip3 install mitmproxy
```

#### 5. Set Up Environment Variables

Add to your `~/.zshrc` or `~/.bashrc`:

```bash
export ANDROID_HOME=~/Library/Android/sdk
export JAVA_HOME=/path/to/jdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### 6. Start Appium and Run Tests

```bash
# Start Appium server
npx appium

# Connect devices
npm run devices sync
npm run devices register

# Run your first test
npm run test:login
```

## Prerequisites

### Minimum Requirements (Automated Setup)

If using **`npm run setup`** (recommended), you only need:

- **Node.js 22.21.1 LTS** - [Install via nvm](https://github.com/nvm-sh/nvm)
- **Android Studio** or **Android SDK** - For Android testing ([Download](https://developer.android.com/studio))
- **Xcode** - For iOS testing on macOS ([App Store](https://apps.apple.com/us/app/xcode/id497799835))

The setup script will automatically install:
- ✅ Appium 3.1.2
- ✅ Appium drivers (UiAutomator2, XCUITest)
- ✅ mitmproxy
- ✅ Homebrew (if missing on macOS)
- ✅ Configure environment variables

### Full Requirements (Manual Setup)

If installing manually:

**macOS:**
- Node.js 22.21.1 LTS (Jod) - Required for Appium 3.x
- npm 10.9.4 (comes with Node.js)
- Appium 3.1.2 (installed via `npm install -g appium`)
- Android SDK with platform-tools (for ADB)
- Java Development Kit (JDK) 11+
- Xcode (for iOS support)
- mitmproxy (for API mocking): `brew install mitmproxy`
- Mockoon CLI (for mock server): Installed via project dependencies

**Environment Variables:**
```bash
export ANDROID_HOME=~/Library/Android/sdk
export JAVA_HOME=/path/to/jdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Device Requirements

**Android:**
- USB debugging enabled (Settings > Developer Options > USB Debugging)
- Connected via USB or running emulator

**iOS:**
- Developer Mode enabled
- Xcode installed
- Physical device or iOS Simulator

## Project Structure

```
mobile-test-farm/
├── bin/                    # CLI tools
│   └── devices.js         # Device management CLI
├── config/                # Configuration
│   └── devices.json       # Device registry
├── lib/                   # Core libraries
│   └── device-manager.js  # Device management API
├── tests/                 # Test scripts
│   └── login-test.js      # Example login test
├── docs/                  # Documentation
│   ├── device-management.md    # Device management guide
│   ├── setup-android.md        # Android setup
│   ├── setup-ios.md            # iOS setup
│   └── writing-tests.md        # Test development guide
├── results/               # Test results and screenshots
└── package.json          # Dependencies and scripts
```

## Device Management

### List Registered Devices

```bash
npm run devices list
```

Output:
```
📱 Registered Devices:

────────────────────────────────────────────────────────────────────
✅ 🖥️  Android Emulator (Pixel 64)
   ID: android-emulator-1
   Device ID: emulator-5554
   Platform: android | Type: emulator
   Model: sdk_gphone64_arm64 | OS: Android 14
────────────────────────────────────────────────────────────────────
✅ 📱 Lenovo 11-inch Tablet
   ID: lenovo-11-inch-tablet
   Device ID: ZY223K7LXM
   Platform: android | Type: physical
   Model: Lenovo_TB-X606F | OS: Android 10
   Notes: QA Testing Device
────────────────────────────────────────────────────────────────────

Total: 2 device(s) | Active: 2
```

### Sync Connected Devices

```bash
npm run devices sync
```

Discovers all connected Android devices and shows their registration status.

### Register New Device

```bash
npm run devices register
```

Interactive prompts guide you through:
1. Select device from discovered list
2. Enter friendly name (e.g., "Lenovo 11-inch Tablet")
3. Enter OS version
4. Add optional notes

### Get Device Details

```bash
npm run devices get "Lenovo 11-inch Tablet"
# or
npm run devices get android-emulator-1
```

### Remove Device

```bash
npm run devices remove lenovo-11-inch-tablet
```

## Running Tests

### Basic Test Execution

```bash
# Default device (Page Object Model)
npm test

# Specific device by ID
npm run test:login:pom android-emulator-1

# Specific device by friendly name
npm run test:login:pom "Lenovo 11-inch Tablet"
```

### Parallel Test Execution

Run tests across multiple devices simultaneously for faster execution:

```bash
# Run on specific devices in parallel
npm run test:parallel tests/specs/login.spec.js device1 device2

# Run on all local devices
npm run test:parallel:all

# Run on local + cloud devices (hybrid mode)
npm run test:parallel:hybrid

# Run on cloud devices only
npm run test:parallel:cloud

# Run on specific cloud provider
npm run test:parallel tests/specs/login.spec.js --cloud --provider=browserstack

# Control concurrency (max 5 tests at once)
npm run test:parallel tests/specs/form.spec.js --all-local --max=5

# Verbose output
npm run test:parallel tests/specs/login.spec.js --all-local --verbose
```

**Benefits:**
- **10x+ faster execution** - Tests run simultaneously across devices
- **Hybrid mode** - Mix local devices with cloud devices (BrowserStack, Sauce Labs, AWS, Firebase)
- **Concurrency control** - Limit parallel executions to manage resources
- **Event-driven monitoring** - Real-time progress tracking
- **Graceful shutdown** - Ctrl+C stops all running tests cleanly
- **Cost optimization** - Use local devices first, cloud for broader coverage

**Examples:**
```bash
# Run on 2 local devices + 3 cloud devices in parallel
node run-parallel.js tests/specs/login.spec.js \
  android-emulator-1 \
  iphone-16-pro-simulator \
  browserstack-iPhone-15-Pro \
  saucelabs-Pixel-8 \
  aws-Galaxy-S23

# Run on all BrowserStack devices
npm run test:parallel tests/specs/form.spec.js --cloud --provider=browserstack
```

See [Parallel Testing Guide](docs/parallel-testing.md) and [Cloud Integration Guide](docs/CLOUD_INTEGRATION.md) for detailed information.

## API Mocking with MITM Proxy

The test farm includes a transparent API mocking system that works on both Android and iOS **without any app code changes**. Apps believe they're calling the real API, but traffic is transparently intercepted and redirected to Mockoon mock server.

### How It Works

```
Mobile App → HTTPS API Call → MITM Proxy (port 8888) →
Mockoon (port 3001) → Mock Response → App
```

**Key Benefits:**
- ✅ Zero app code changes required
- ✅ Works on both Android and iOS
- ✅ Transparent certificate handling
- ✅ Automatic traffic recording on failure
- ✅ Test different API scenarios (errors, timeouts, edge cases)

### Quick Example

```bash
# Enable mocking for a test run
MOCKOON_ENABLED=true npm run test:users -- pixel-9

# The test will use mock data instead of real API
# App is completely unaware of the mocking
```

### Create Custom Mocks

Edit `mocks/environments/jsonplaceholder-simple.json`:

```json
{
  "routes": [
    {
      "method": "get",
      "endpoint": "users",
      "responses": [{
        "body": "[{\"id\": 1, \"name\": \"Test User\"}]",
        "statusCode": 200
      }]
    }
  ]
}
```

### Test Different Scenarios

**Test 500 Error:**
```bash
MOCKOON_ENABLED=true MOCKOON_MOCK_FILE=mocks/environments/error-500.json npm run test:users
```

**Test Network Timeout:**
```bash
MOCKOON_ENABLED=true MOCKOON_MOCK_FILE=mocks/environments/timeout.json npm run test:users
```

**Test Empty Response:**
```bash
MOCKOON_ENABLED=true MOCKOON_MOCK_FILE=mocks/environments/empty.json npm run test:users
```

### Platform-Specific Setup

**Android Emulators:**
- Automatically configured via `adb` device proxy
- Debug builds trust mitmproxy certificate
- No app code changes needed

**iOS Simulators:**
- Uses macOS system proxy settings
- Certificate installed in macOS keychain
- Metro bundler bypass configured automatically
- No app code changes needed

### Using MITM Proxy with Physical Devices

**Android Physical Devices:**

1. **Configure WiFi Proxy:**
   - Connect device to same WiFi network as your computer
   - Open WiFi settings on device
   - Long press on connected network → Modify Network
   - Advanced Options → Manual Proxy
   - Set hostname to your computer's local IP (e.g., `192.168.1.100`)
   - Set port to `8888`

2. **Install Certificate:**
   ```bash
   # Push certificate to device
   adb push ~/.mitmproxy/mitmproxy-ca-cert.pem /sdcard/Download/

   # On device: Settings → Security → Install from storage
   # Select the certificate file
   ```

3. **For Debug Builds:**
   - Debug-specific network security config already trusts user certificates
   - No additional app changes needed

**iOS Physical Devices:**

1. **Configure WiFi Proxy:**
   - Connect device to same WiFi network as your Mac
   - Settings → WiFi → (i) on connected network
   - Configure Proxy → Manual
   - Server: Your Mac's local IP (e.g., `192.168.1.100`)
   - Port: `8888`

2. **Install Certificate:**
   - Email the certificate to yourself or use AirDrop
   - Certificate location: `~/.mitmproxy/mitmproxy-ca-cert.pem`
   - On device: Open the certificate file
   - Follow prompts to install profile

3. **Enable Full Trust:**
   - Settings → General → About → Certificate Trust Settings
   - Enable full trust for mitmproxy certificate

### Using MITM Proxy with Cloud Devices

Your **local MITM proxy** (running on localhost:8888) cannot be accessed by cloud devices. However, **mocking still works with cloud devices** using these approaches:

**Option 1: Cloud Provider Tunneling (Recommended)**

Many cloud providers support tunneling to access localhost:

**BrowserStack Local:**
```bash
# Download BrowserStack Local binary
# Start tunnel to expose your localhost
./BrowserStackLocal --key YOUR_ACCESS_KEY

# Now cloud devices can access localhost:8888 and localhost:3001
# Run tests normally with MOCKOON_ENABLED=true
```

**Sauce Connect:**
```bash
# Start Sauce Connect tunnel
sc -u YOUR_USERNAME -k YOUR_ACCESS_KEY

# Cloud devices can now access your local MITM proxy
```

**AWS Device Farm:**
- Supports VPC endpoints for private network access
- Can route to private mock servers

**Option 2: Deploy Mock Server Publicly**

Deploy Mockoon to a public server and update MITM proxy configuration:

```bash
# 1. Deploy Mockoon to cloud (Heroku, AWS, DigitalOcean, etc.)
# Example public URL: https://your-mockoon.herokuapp.com

# 2. Update MITM proxy to redirect to public Mockoon
# Edit mocks/mitm-scripts/test-mitm-proxy.py:
MOCKOON_HOST = "your-mockoon.herokuapp.com"
MOCKOON_PORT = 443  # HTTPS

# 3. Cloud devices route through cloud-accessible MITM proxy
```

**Option 3: Direct Mockoon (No MITM Proxy)**

Configure app to connect directly to Mockoon:

```bash
# If using public Mockoon server
# No MITM proxy needed - app points directly to mock server
# Requires app code to support configurable API URL
```

**Option 4: Use Cloud Provider's Mock Features**

Some providers offer built-in API mocking:
- Firebase Test Lab: Network profile simulation
- AWS Device Farm: Custom network configurations

**Recommended Approaches:**

| Scenario | Best Option | Why |
|----------|-------------|-----|
| Quick cloud testing | BrowserStack Local / Sauce Connect | Easy setup, works with existing MITM config |
| Production cloud testing | Deploy Mockoon publicly | More reliable, no tunnel needed |
| Hybrid testing | Local with MITM, Cloud with real API | Leverages strengths of both |
| CI/CD automation | Deploy Mockoon publicly | No local dependencies |

### Debugging Failed Tests

When a test fails with mocking enabled, transaction logs are automatically saved to `mocks/recordings/`:

```bash
# View failed test transactions
cat mocks/recordings/FAILED-users-api-test-pixel-9-2025-12-26.json
```

The log shows:
- All API calls intercepted
- Request/response details
- Mock server activity
- Proxy routing information

See [API Mocking Guide](docs/MOCKING.md) and [MITM Setup Guide](docs/MITM_SETUP.md) for detailed configuration.

## Available Commands

### Device Management
```bash
npm run devices list           # List all registered devices
npm run devices sync           # Discover connected devices
npm run devices register       # Register new device
npm run devices get <name>     # Get device details
npm run devices remove <id>    # Remove device
```

### Testing
```bash
# Individual Test Suites
npm test                         # Run default test suite (login)
npm run test:login:pom           # Run login test with Page Object Model
npm run test:form                # Run form interaction tests
npm run test:list                # Run list filtering and interaction tests
npm run test:profile             # Run profile and settings tests
npm run test:navigation          # Run complete navigation flow tests

# Run All Suites Sequentially
npm run test:suite:all           # Run all test suites on default device

# Parallel Test Execution
npm run test:parallel:all        # Run on all local devices in parallel
npm run test:parallel:hybrid     # Run on local + cloud devices in parallel
npm run test:parallel:cloud      # Run on cloud devices only in parallel
npm run test:parallel:help       # Show parallel execution help

# Appium Server
npm run appium                   # Start Appium server

# Notifications
npm run notify:test              # Test notification configuration

# Web Dashboard
npm run dashboard                # Start web dashboard server (http://localhost:3000)
npm run dashboard:dev            # Start dashboard with auto-reload (requires nodemon)
```

## Test Reliability & Notifications

### Multi-Platform Notifications

Get instant test results on your preferred communication platform:

- **Slack** - Team channels and direct messages
- **Microsoft Teams** - Team channels
- **Discord** - Server channels
- **Email** - Via webhook services (SendGrid, Mailgun, etc.)
- **Custom Webhook** - Any REST API endpoint

**Setup:**
1. Copy `.env.example` to `.env`
2. Add webhook URLs for your preferred platform(s)
3. Test configuration: `npm run notify:test`

**Example (.env):**
```bash
NOTIFICATIONS_ENABLED=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/YOUR/WEBHOOK/URL
```

### Test Retry Logic

Automatically retry failed tests to handle flaky tests and transient issues:

- Configurable retry attempts (default: 2)
- Configurable delay between retries (default: 3000ms)
- Detailed logging of retry attempts
- Track which attempt succeeded

**Configuration (.env):**
```bash
TEST_RETRY_ENABLED=true
TEST_MAX_RETRIES=2
TEST_RETRY_DELAY=3000
```

### Nightly Test Runs

Automated daily test execution via GitHub Actions:

- Runs at 2 AM UTC every day
- Manual trigger option with suite selection
- Full CI/CD pipeline (Android + iOS)
- Artifact upload (reports, screenshots, videos)
- Notification on failure

See [Notifications & Automation Guide](docs/quick-wins.md) for detailed setup and usage.

## Documentation

### Core Guides
- **[Web Dashboard Guide](docs/web-dashboard.md)** - User-friendly web UI for test management
- **[API Mocking Guide](docs/MOCKING.md)** - Transparent API mocking with MITM proxy + Mockoon
- **[MITM Proxy Setup](docs/MITM_SETUP.md)** - Detailed MITM proxy configuration for Android & iOS
- **[Cloud Integration Guide](docs/CLOUD_INTEGRATION.md)** - BrowserStack, Sauce Labs, AWS, Firebase integration
- **[Parallel Testing Guide](docs/parallel-testing.md)** - Run tests across multiple devices simultaneously
- **[Device Management Guide](docs/device-management.md)** - Complete device management documentation

### Testing & Reporting
- **[Test Suites Guide](docs/test-suites.md)** - Comprehensive test suite documentation
- **[Test Variants Guide](docs/TEST-VARIANTS.md)** - Run tests with different mock scenarios
- **[Writing Tests Guide](docs/writing-tests.md)** - How to write automated tests
- **[Video Recording Guide](docs/video-recording.md)** - Automatic video recording for debugging
- **[HTML Reporting Guide](docs/html-reporting.md)** - Beautiful test reports with Allure

### Setup & Configuration
- **[Android Setup Guide](docs/setup-android.md)** - Android development environment setup
- **[iOS Setup Guide](docs/setup-ios.md)** - iOS development environment setup
- **[CI/CD Integration Guide](docs/ci-cd-integration.md)** - Automated testing with GitHub Actions
- **[Notifications & Automation](docs/quick-wins.md)** - Multi-platform notifications, test retry, scheduled runs

## Current Status

### Completed Features ✅

**Infrastructure:**
- ✅ Appium 3.1.2 with modern architecture (Node.js 22.21.1)
- ✅ UiAutomator2 driver 6.7.5 for Android
- ✅ XCUITest driver 10.12.2 for iOS
- ✅ WebDriverIO 9.21.0 test framework

**Device Management:**
- ✅ Universal device registry with friendly names
- ✅ Android device discovery (emulators and physical)
- ✅ iOS device discovery (simulators and physical)
- ✅ Cross-platform device configuration
- ✅ CLI tools for device management

**Test Architecture:**
- ✅ Page Object Model implementation
- ✅ Comprehensive test suites (Login, Form, List, Profile, Navigation)
- ✅ Automatic screenshot and video on test failure
- ✅ Cross-platform element location
- ✅ Configuration-driven tests (.env support)
- ✅ Centralized test data management

**Parallel Execution:**
- ✅ Parallel test runner across multiple devices
- ✅ Hybrid local + cloud device execution
- ✅ Concurrency control and resource management
- ✅ Event-driven test monitoring
- ✅ Test result aggregation and summary reports
- ✅ 10x+ faster test execution with multiple devices

**Cloud Device Farms:**
- ✅ BrowserStack integration (3000+ devices)
- ✅ Sauce Labs integration (2000+ devices, multi-region)
- ✅ AWS Device Farm integration (300+ devices, pay-per-use)
- ✅ Firebase Test Lab integration (50+ devices, best free tier)
- ✅ Unified device API (same code for local and cloud)
- ✅ Hybrid testing mode (local + cloud simultaneously)
- ✅ Dashboard cloud device visibility
- ✅ Automatic hub routing (local Appium vs cloud providers)

**CI/CD:**
- ✅ GitHub Actions workflows (Android, iOS, Full Suite)
- ✅ Automated testing on push and PR
- ✅ Test artifact collection (screenshots, logs)
- ✅ Status badges and PR integration

**Reporting:**
- ✅ Allure HTML report integration
- ✅ Rich test metadata (steps, screenshots, logs, videos)
- ✅ Historical trend tracking
- ✅ Report generation and viewing scripts
- ✅ Automatic video recording on test failure
- ✅ Video attachment to Allure reports

**Notifications & Automation:**
- ✅ Multi-platform notifications (Slack, Teams, Discord, Email, Webhooks)
- ✅ Flexible notification configuration via environment variables
- ✅ Test retry logic with configurable attempts and delays
- ✅ Scheduled test runs via GitHub Actions (daily + manual trigger)
- ✅ Test summary reports with aggregated results

**Web Dashboard:**
- ✅ Express.js server with REST API
- ✅ Socket.IO for real-time updates
- ✅ Modern responsive web UI
- ✅ Device management interface
- ✅ One-click test execution
- ✅ Live test output streaming
- ✅ Results browser
- ✅ Report and artifact viewing

**API Mocking & Testing:**
- ✅ Transparent MITM proxy (mitmproxy) for traffic interception
- ✅ Mockoon integration for mock API responses
- ✅ Zero app code changes required for mocking
- ✅ Platform-specific proxy configuration (Android via adb, iOS via macOS)
- ✅ Automatic certificate trust in debug builds
- ✅ Transaction logging on test failure
- ✅ Support for multiple mock environments (errors, timeouts, edge cases)
- ✅ Test variants for different API scenarios

**Verified Platforms:**
- ✅ iOS: iPhone 16 Pro Simulator - PASSED (with MITM mocking)
- ✅ Android: Pixel 64 Emulator - PASSED (with MITM mocking)
- ✅ Parallel Execution: Both platforms simultaneously - PASSED
- ✅ Mock Verification: Confirmed traffic flows through Mockoon transparently

## Troubleshooting

### Device Not Detected

**Android:**
```bash
# Check if ADB can see the device
adb devices -l

# Restart ADB server if needed
adb kill-server
adb start-server
```

### Appium Connection Issues

```bash
# Check if Appium is running
curl http://localhost:4723/status

# Restart Appium if needed
pkill -f appium
npx appium
```

### Permission Issues

If you see "unauthorized" in `adb devices`:
1. Check device for authorization prompt
2. Select "Always allow from this computer"
3. Click OK

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

ISC

## Support

For issues and questions:
- Check the [documentation](docs/)
- Review the [API Mocking Guide](docs/MOCKING.md) for mocking setup
- Review the [MITM Setup Guide](docs/MITM_SETUP.md) for proxy configuration
- Open an issue on GitHub

---

**Version:** 5.0.0
**Features:** Android & iOS Support • Parallel Testing • CI/CD Integration • HTML Reporting • Video Recording • Notifications & Automation • Web Dashboard • Cloud Device Farms • Transparent API Mocking
**Last Updated:** December 2025
