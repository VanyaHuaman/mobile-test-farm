# Mobile Test Farm

[![Mobile Test Farm CI](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/mobile-tests.yml/badge.svg)](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/mobile-tests.yml)
[![Android Tests](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/test-android.yml/badge.svg)](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/test-android.yml)
[![iOS Tests](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/test-ios.yml/badge.svg)](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/test-ios.yml)

Automated mobile device testing infrastructure for running tests across multiple Android and iOS devices with user-friendly device management.

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
✅ **Modern Test App** - Expo app with New Architecture (Fabric + TurboModules)
✅ **Device Registry** - Centralized device configuration and management
✅ **Cross-Platform** - Same tests run on both Android and iOS
✅ **Appium 3** - Latest Appium with modern architecture
✅ **Multi-Platform Notifications** - Slack, Teams, Discord, Email, Custom Webhooks
✅ **Test Retry Logic** - Automatic retry for failed tests with configurable attempts
✅ **Nightly Test Runs** - Scheduled daily test execution via GitHub Actions
✅ **Web Dashboard** - User-friendly web UI for device management and test execution
✅ **API Mocking** - Mockoon CLI integration for realistic API mocking and traffic recording
✅ **Test Variants** - Multiple test configurations for different scenarios (500 errors, timeouts, etc.)

## Quick Start

### Option 1: Web Dashboard (Recommended for Teams)

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

### Option 2: Command Line

### 1. Install Dependencies

```bash
cd mobile-test-farm
npm install
```

### 2. Start Appium Server

```bash
npx appium
```

Leave this running in the background.

### 3. Connect and Register Devices

**For Android Emulator:**
```bash
# Start your Android emulator first
# Then sync to discover connected devices
npm run devices sync

# Register the device with a friendly name
npm run devices register
```

**For Physical Devices:**
- Enable USB debugging on Android devices
- Connect via USB
- Run `npm run devices sync` to discover
- Run `npm run devices register` to add with friendly name

### 4. Run Your First Test

```bash
# Run on default device (android-emulator-1)
npm run test:login

# Run on specific device by name
node tests/login-test.js "Lenovo 11-inch Tablet"
```

## Prerequisites

### Required Software

**macOS:**
- Node.js 18+ and npm
- Android SDK with platform-tools (for ADB)
- Java Development Kit (JDK) 11+
- Xcode (for iOS support)

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

**iOS (Phase 2):**
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
│   ├── phase1-completion.md    # Phase 1 results
│   ├── setup-android.md        # Android setup
│   ├── setup-ios.md            # iOS setup (Phase 2)
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

# Quick Wins
npm run notify:test              # Test notification configuration

# Web Dashboard
npm run dashboard                # Start web dashboard server (http://localhost:3000)
npm run dashboard:dev            # Start dashboard with auto-reload (requires nodemon)
```

## Quick Wins

The Mobile Test Farm includes several quick-win improvements for immediate productivity gains:

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

See [Quick Wins Documentation](docs/quick-wins.md) for detailed setup and usage.

## Test Application

The project includes a test Expo app at `/Users/vanyahuaman/expo-arch-example-app`:

**Features:**
- Built with Expo Router (file-based routing)
- New Architecture enabled (Fabric + TurboModules)
- 5 test screens: Login, Home, Form, List, Profile
- All elements tagged with testID for automation
- Cross-platform (Android & iOS)

**Build for Android:**
```bash
cd ~/expo-arch-example-app
npx expo run:android
```

**Build for iOS (Phase 2):**
```bash
cd ~/expo-arch-example-app
npx expo run:ios
```

## Documentation

- **[Web Dashboard Guide](docs/web-dashboard.md)** - User-friendly web UI for test management
- **[Cloud Integration Guide](docs/CLOUD_INTEGRATION.md)** - BrowserStack, Sauce Labs, AWS, Firebase integration
- **[Quick Wins Guide](docs/quick-wins.md)** - Multi-platform notifications, test retry, nightly runs
- **[Test Suites Guide](docs/test-suites.md)** - Comprehensive test suite documentation
- **[Test Variants Guide](docs/TEST-VARIANTS.md)** - Run tests with different mock scenarios (NEW)
- **[API Mocking Guide](docs/MOCKING.md)** - Mockoon CLI integration and traffic recording (NEW)
- **[Video Recording Guide](docs/video-recording.md)** - Automatic video recording for debugging
- **[HTML Reporting Guide](docs/html-reporting.md)** - Beautiful test reports with Allure
- **[CI/CD Integration Guide](docs/ci-cd-integration.md)** - Automated testing with GitHub Actions
- **[Device Management Guide](docs/device-management.md)** - Complete device management documentation
- **[Parallel Testing Guide](docs/parallel-testing.md)** - Run tests across multiple devices simultaneously
- **[Phase 1 Completion Report](docs/phase1-completion.md)** - Phase 1 implementation results
- **[Android Setup Guide](docs/setup-android.md)** - Android development environment setup
- **[iOS Setup Guide](docs/setup-ios.md)** - iOS development environment setup
- **[Writing Tests Guide](docs/writing-tests.md)** - How to write automated tests

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

**Quick Wins:**
- ✅ Multi-platform notifications (Slack, Teams, Discord, Email, Webhooks)
- ✅ Flexible notification configuration via environment variables
- ✅ Test retry logic with configurable attempts and delays
- ✅ Nightly test runs via GitHub Actions (scheduled + manual)
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

**Test Application:**
- ✅ Expo Router + React Native New Architecture
- ✅ Cross-platform app (Android & iOS)
- ✅ Comprehensive testID coverage
- ✅ Debug and release build support

**Test Results:**
- ✅ iOS: iPhone 16 Pro Simulator - PASSED
- ✅ Android: Pixel 64 Emulator - PASSED
- ✅ Parallel Execution: Both platforms simultaneously - PASSED

## Roadmap

### Phase 1: Foundation - Android Support ✅ COMPLETE

### Phase 2: iOS Support ✅ COMPLETE

### Phase 3: Parallel Test Execution ✅ COMPLETE

### Phase 4: CI/CD Integration ✅ COMPLETE

### Phase 5: HTML Test Reporting ✅ COMPLETE

### Phase 6: Video Recording ✅ COMPLETE

### Phase 7: Advanced Test Cases ✅ COMPLETE

### Phase 8: Quick Wins ✅ COMPLETE
- ✅ Multi-platform notifications (Slack, Teams, Discord, Email, Webhooks)
- ✅ Test retry logic with configurable attempts
- ✅ Nightly test runs via GitHub Actions
- ✅ Test summary reports

### Phase 9: Web Dashboard ✅ COMPLETE
- ✅ Express.js server with REST API and WebSocket
- ✅ Modern responsive web UI (HTML/CSS/JavaScript)
- ✅ Device management interface (discover, register, remove)
- ✅ Test execution interface (select suites/devices, run tests)
- ✅ Real-time test output streaming
- ✅ Test results browser
- ✅ Reports and artifacts viewing

### Phase 10: Cloud Device Farm Integration ✅ COMPLETE
- ✅ BrowserStack provider integration
- ✅ Sauce Labs provider integration
- ✅ AWS Device Farm provider integration
- ✅ Firebase Test Lab provider integration
- ✅ Unified cloud device API
- ✅ Hybrid local + cloud execution
- ✅ Dashboard cloud device display
- ✅ Parallel execution across cloud devices

### Phase 11: Next Steps (Optional)
- [ ] Performance metrics collection
- [ ] Visual regression testing
- [ ] AI-powered self-healing locators
- [ ] Cost tracking dashboard for cloud devices
- [ ] Automatic device selection (smart routing)
- [ ] Cloud device filtering and search

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
- Review [Phase 1 Completion Report](docs/phase1-completion.md)
- Open an issue on GitHub

---

**Version:** 5.0.0
**Status:** Phases 1-10 Complete (Android, iOS, Parallel Testing, CI/CD, Reporting, Quick Wins, Web Dashboard, Cloud Integration)
**Last Updated:** December 2025
