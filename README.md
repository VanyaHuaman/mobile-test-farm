# Mobile Test Farm

> **✨ Expo/React Native Example** - This branch contains a complete working example with an Expo/React Native app.
> **🤖 Want native Android with Jetpack Compose?** Check out the [`native-android-example` branch](https://github.com/VanyaHuaman/mobile-test-farm/tree/native-android-example) for a native Android Compose app with test examples.
> **📦 Want a clean starter template?** Check out the [`template` branch](https://github.com/VanyaHuaman/mobile-test-farm/tree/template) for a ready-to-use template without example apps.

[![Mobile Test Farm CI](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/mobile-tests.yml/badge.svg)](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/mobile-tests.yml)
[![Android Tests](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/test-android.yml/badge.svg)](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/test-android.yml)
[![iOS Tests](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/test-ios.yml/badge.svg)](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/test-ios.yml)

Automated mobile device testing infrastructure for running tests across multiple Android and iOS devices with user-friendly device management.

**Explore the Expo/React Native example:**
```bash
git clone https://github.com/VanyaHuaman/mobile-test-farm.git
cd mobile-test-farm
npm run setup
npm start
```

**Start a new project from template:**
```bash
git clone -b template https://github.com/VanyaHuaman/mobile-test-farm.git my-mobile-tests
cd my-mobile-tests
npm run setup
```

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

### Option 1: Automated Setup (Recommended)

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
- ✅ Build the example Expo app (optional)

Then connect your app (or use the included Expo example):

```javascript
// config/test.config.js
apps: {
  android: {
    debug: '/path/to/your/app-debug.apk',  // ← Your APK path
  },
  ios: {
    simulator: '/path/to/YourApp.app',     // ← Your .app path
  },
},
appInfo: {
  android: {
    package: 'com.yourcompany.yourapp',    // ← Your package name
    activity: '.MainActivity',              // ← Usually .MainActivity
  },
  ios: {
    bundleId: 'com.yourcompany.yourapp',   // ← Your bundle ID
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

#### Start Services and Run Tests

**Option A: One-Command Startup (Recommended)**

```bash
# Start Appium + Dashboard with one command
npm start
```

This starts:
- ✅ Appium server (http://localhost:4723)
- ✅ Web Dashboard (http://localhost:3000)
- ✅ Health checks to verify everything is ready

**Expected output:**
```
🚀 Mobile Test Farm - Starting Services
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Appium is ready
✅ Dashboard is ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All services are ready!

📱 Dashboard: http://localhost:3000
🔌 Appium:    http://localhost:4723

Press Ctrl+C to stop all services
```

**Then in another terminal:**

```bash
# Sync and register your devices
npm run devices sync
npm run devices register

# Run a test
npm run test:login

# Or use the Web Dashboard at http://localhost:3000
```

**Option B: Manual Startup**

If you prefer to start services separately:

```bash
# Terminal 1: Start Appium
npx appium

# Terminal 2: Start Dashboard (optional)
npm run dashboard

# Terminal 3: Run tests
npm run test:login
```

### Option 2: Web Dashboard (Recommended for Teams)

```bash
# Start the dashboard server (or use npm start)
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
pip install mitmproxy
```

#### 5. Set Environment Variables

```bash
# Add to ~/.zshrc or ~/.bashrc
export ANDROID_HOME=~/Library/Android/sdk
export JAVA_HOME=/path/to/jdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### 6. Start Services and Run Tests

```bash
# Start Appium + Dashboard
npm start

# In another terminal, connect devices
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
- ✅ UiAutomator2 driver 6.7.5 (Android)
- ✅ XCUITest driver 10.12.2 (iOS)
- ✅ WebDriverIO 9.21.0
- ✅ mitmproxy (for API mocking)
- ✅ All npm dependencies

### Full Requirements (Manual Installation)

If installing manually, you need:

#### Required for All Platforms
- Node.js 22.21.1+ LTS
- npm 10.9.4+
- Git

#### Required for Android Testing
- Android SDK (API 34+)
- Java JDK 11+
- Android Studio (recommended) or command-line tools
- USB debugging enabled on physical devices

#### Required for iOS Testing (macOS only)
- macOS 12+
- Xcode 14+
- Xcode Command Line Tools
- iOS Simulator or physical device with dev certificate

#### Optional (Recommended)
- mitmproxy - For transparent API mocking
- Allure - For HTML test reports (auto-installed)
- Docker - For containerized testing (future)

See detailed setup guides:
- [Android Setup Guide](docs/setup-android.md)
- [iOS Setup Guide](docs/setup-ios.md)

## Device Management

### Register a Device

```bash
# Discover connected devices
npm run devices sync

# Register interactively
npm run devices register
```

**Example registration:**
```
📝 Register New Device

Select device: emulator-5554 (sdk_gphone64_arm64)
Enter friendly name: Android Emulator
Enter OS version: Android 14
Enter notes: Test device for automation

✅ Device registered successfully!
   ID: android-emulator
   Device ID: emulator-5554
```

### List Registered Devices

```bash
npm run devices list
```

**Example output:**
```
📱 Registered Devices:

────────────────────────────────────────────────────────────────────
✅ 🖥️  Android Emulator
   ID: android-emulator
   Device ID: emulator-5554
   Platform: android | Type: emulator
   Model: sdk_gphone64_arm64 | OS: Android 14
   Notes: Test device for automation
────────────────────────────────────────────────────────────────────

Total: 1 device(s) | Active: 1
```

### Use Device in Tests

```javascript
// Use by friendly name (case-insensitive)
node tests/login-test.js "Android Emulator"

// Or by device ID
node tests/login-test.js android-emulator
```

See [Device Management Guide](docs/device-management.md) for advanced usage.

## Running Tests

### Quick Test Commands

```bash
# Login test
npm run test:login

# Form validation
npm run test:form

# List scrolling
npm run test:list

# Navigation flows
npm run test:navigation

# Profile screen
npm run test:profile

# API tests with mocking
npm run test:users
npm run test:posts

# Run all UI tests
npm run test:suite:all

# Run all API tests
npm run test:api:all
```

### Run Test on Specific Device

```bash
# By friendly name
node tests/specs/login.spec.js "Android Emulator"

# By device ID
node tests/specs/login.spec.js android-emulator
```

### Parallel Testing

Run tests across multiple devices simultaneously:

```bash
# Parallel on all local devices
npm run test:parallel:all

# Parallel on local + cloud (hybrid)
npm run test:parallel:hybrid

# Parallel on cloud devices only
npm run test:parallel:cloud

# Custom parallel execution
node run-parallel.js tests/specs/login.spec.js pixel-9 iphone-16-pro
```

See [Parallel Testing Guide](docs/parallel-testing.md) for details.

## Test Reporting

### Generate Allure Report

```bash
# Generate report
npm run report:generate

# Open report
npm run report:open

# Or generate and serve
npm run report:serve
```

Reports include:
- ✅ Pass/fail rates with charts
- ✅ Test execution timeline
- ✅ Screenshots on failure
- ✅ Video recordings (if configured)
- ✅ Device information
- ✅ Test history and trends

See [HTML Reporting Guide](docs/html-reporting.md) for configuration.

## API Mocking & Traffic Interception

### Setup MITM Proxy

```bash
# Automated setup (recommended)
npm run setup:mitm

# Or platform-specific
npm run setup:mitm:android
npm run setup:mitm:ios
```

### Run Tests with Mocking

```bash
# Run with mock API responses
MOCKOON_ENABLED=true npm run test:users

# Use specific mock file
MOCKOON_ENABLED=true MOCKOON_MOCK_FILE=mocks/environments/error-scenarios.json npm run test:users

# Test with API recording (records on failure)
npm run test:users  # Failed test automatically records API traffic
```

### Mock Files

Mock configurations are in `mocks/environments/`:
- `jsonplaceholder-simple.json` - Basic mocked responses
- `error-scenarios.json` - 500 errors, timeouts, malformed responses
- `empty-data.json` - Empty arrays, null responses

### Traffic Recording

When tests fail, API traffic is automatically recorded to `mocks/recordings/`:

```bash
# View recorded traffic from failed test
cat mocks/recordings/FAILED-users-api-test-pixel-9-2025-12-28.json
```

See [API Mocking Guide](docs/MOCKING.md) and [MITM Setup Guide](docs/MITM_SETUP.md) for details.

## Available Commands

### Device Management
```bash
npm run devices list           # List all registered devices
npm run devices sync           # Discover connected devices
npm run devices register       # Register a new device interactively
```

### Testing
```bash
npm run test:login             # Login flow test
npm run test:form              # Form validation test
npm run test:list              # List scrolling test
npm run test:navigation        # Navigation test
npm run test:profile           # Profile screen test
npm run test:users             # Users API test
npm run test:posts             # Posts API test
npm run test:suite:all         # Run all UI tests
npm run test:api:all           # Run all API tests
```

### Parallel Testing
```bash
npm run test:parallel          # Run tests in parallel
npm run test:parallel:all      # Parallel on all local devices
npm run test:parallel:hybrid   # Parallel on local + cloud
npm run test:parallel:cloud    # Parallel on cloud only
npm run test:parallel:help     # Show parallel execution help
```

### Reporting
```bash
npm run report:generate        # Generate Allure HTML report
npm run report:open            # Open generated report
npm run report:serve           # Generate and serve report
npm run report:clean           # Clean report directories
```

### Services
```bash
npm start                      # Start Appium + Dashboard (recommended)
npm run dev                    # Alias for npm start
npm run appium                 # Start Appium server only
npm run dashboard              # Start Dashboard only
npm run services:check         # Check if services are running
npm run services:wait          # Wait for services to be ready
```

### API Mocking
```bash
npm run setup:mitm             # Setup MITM proxy certificates
npm run setup:mitm:android     # Setup for Android only
npm run setup:mitm:ios         # Setup for iOS only
```

### Notifications
```bash
npm run notify:test            # Test notification configuration
```

## Documentation

- 📖 [Quick Start Guide](QUICKSTART.md) - Get up and running in 10 minutes
- 🔧 [Device Management](docs/device-management.md) - Register and manage devices
- 🧪 [Test Suites](docs/test-suites.md) - Writing and organizing tests
- 🎭 [API Mocking](docs/MOCKING.md) - Mock API responses with MITM + Mockoon
- 📊 [HTML Reporting](docs/html-reporting.md) - Generate beautiful test reports
- 🎥 [Video Recording](docs/video-recording.md) - Record test failures
- ⚡ [Parallel Testing](docs/parallel-testing.md) - Run tests across multiple devices
- ☁️ [Cloud Integration](docs/CLOUD_INTEGRATION.md) - Use BrowserStack, Sauce Labs, etc.
- 🔍 [Element Inspection](docs/ELEMENT_INSPECTION.md) - Find and inspect UI elements
- 🚀 [CI/CD Integration](docs/ci-cd-integration.md) - GitHub Actions workflows
- 🌐 [Web Dashboard](docs/web-dashboard.md) - Use the web UI
- 🔧 [Android Setup](docs/setup-android.md) - Detailed Android configuration
- 🍎 [iOS Setup](docs/setup-ios.md) - Detailed iOS configuration
- 🎯 [Test Variants](docs/TEST-VARIANTS.md) - Multiple test configurations
- 🔐 [MITM Setup](docs/MITM_SETUP.md) - Transparent proxy configuration

## Example App (Expo/React Native)

This branch includes a complete Expo/React Native example app located at `../expo-arch-example-app/`.

**Features:**
- Login screen with validation
- Home screen with navigation
- Form with various input types
- Scrollable list with API data
- Profile screen
- Built with React Native + Expo

**Build the example app:**

```bash
# Android
cd ../expo-arch-example-app
npx expo run:android

# iOS
npx expo run:ios
```

**Run tests against the example app:**

```bash
cd mobile-test-farm
npm run test:login
npm run test:form
npm run test:list
```

## Architecture

```
mobile-test-farm/
├── bin/                       # Utility scripts
│   ├── devices.js            # Device management CLI
│   ├── check-services.js     # Service health checks
│   └── setup.js              # Automated setup script
├── config/
│   ├── test.config.js        # Test configuration
│   ├── devices.json          # Device registry
│   └── capabilities/         # Appium capabilities
├── tests/
│   ├── specs/                # Test specifications
│   ├── page-objects/         # Page Object Model
│   └── helpers/              # Test utilities
├── lib/
│   ├── device-manager.js     # Device management
│   ├── TestBase.js           # Base test class
│   └── DriverFactory.js      # WebDriver factory
├── server/
│   └── index.js              # Web Dashboard server
├── mocks/
│   ├── environments/         # Mock configurations
│   └── recordings/           # Traffic recordings
├── allure-results/           # Test results
├── allure-report/            # Generated HTML reports
└── docs/                     # Documentation
```

## Best Practices

### 1. Use Device Registry

Always register devices with friendly names:

```bash
npm run devices register
```

Then reference by name in tests:

```javascript
await testBase.runTest("Android Emulator", config, async (driver) => {
  // Test code
});
```

### 2. Use Page Object Model

Keep tests maintainable with page objects:

```javascript
const LoginPage = require('../page-objects/LoginPage');

const loginPage = new LoginPage(driver);
await loginPage.login('user@example.com', 'password');
await loginPage.verifyHomeScreen();
```

### 3. Enable Auto Screenshots

Screenshots are automatically captured on failure. View them in Allure reports.

### 4. Use API Mocking for Reliability

Mock flaky APIs to ensure test reliability:

```bash
MOCKOON_ENABLED=true npm run test:users
```

### 5. Run Tests in Parallel

Save time by running on multiple devices:

```bash
npm run test:parallel:all
```

### 6. Use the Web Dashboard

For non-technical team members, use the web UI:

```bash
npm start
# Open http://localhost:3000
```

## Troubleshooting

### "No devices found"
```bash
# Check ADB connection
adb devices

# Restart ADB if needed
adb kill-server && adb start-server

# Re-discover devices
npm run devices sync
```

### "Appium connection refused"
```bash
# Check if services are running
npm run services:check

# If not, start services
npm start
```

### "App not installed"
```bash
# Check app path in config/test.config.js
# Rebuild your app
cd ../expo-arch-example-app
npx expo run:android  # or run:ios
```

### "Element not found"
```bash
# Use Appium Inspector to find correct selectors
# See docs/ELEMENT_INSPECTION.md for details
```

### Tests failing intermittently
```bash
# Use API mocking to eliminate network flakiness
MOCKOON_ENABLED=true npm run test:users
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

## License

ISC

## Support

- 📖 Check the [documentation](docs/)
- 🐛 [Report issues](https://github.com/VanyaHuaman/mobile-test-farm/issues)
- 💬 [Start a discussion](https://github.com/VanyaHuaman/mobile-test-farm/discussions)

---

**Happy Testing!** 🚀
