# Mobile Test Farm

[![Mobile Test Farm CI](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/mobile-tests.yml/badge.svg)](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/mobile-tests.yml)
[![Android Tests](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/test-android.yml/badge.svg)](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/test-android.yml)
[![iOS Tests](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/test-ios.yml/badge.svg)](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/test-ios.yml)

Automated mobile device testing infrastructure for running tests across multiple Android and iOS devices with user-friendly device management.

## Features

✅ **Universal Device Support** - Works with emulators, simulators, and physical devices
✅ **User-Friendly Device Names** - Use "Lenovo 11-inch Tablet" instead of cryptic IDs
✅ **Automated Testing** - Run end-to-end tests with Appium + WebDriverIO
✅ **Parallel Test Execution** - Run tests across multiple devices simultaneously
✅ **Page Object Model** - Maintainable test architecture with automatic screenshot on failure
✅ **HTML Test Reports** - Beautiful Allure reports with charts and history
✅ **CI/CD Ready** - GitHub Actions workflows for automated testing
✅ **Modern Test App** - Expo app with New Architecture (Fabric + TurboModules)
✅ **Device Registry** - Centralized device configuration and management
✅ **Cross-Platform** - Same tests run on both Android and iOS
✅ **Appium 3** - Latest Appium with modern architecture

## Quick Start

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
# Run on all registered devices in parallel
npm run test:parallel:all tests/specs/login.spec.js

# Run on all iOS devices in parallel
npm run test:parallel:ios tests/specs/login.spec.js

# Run on all Android devices in parallel
npm run test:parallel:android tests/specs/login.spec.js

# Run on specific devices in parallel
npm run test:parallel tests/specs/login.spec.js "iPhone 16 Pro Simulator" "Android Emulator (Pixel 64)"
```

**Benefits:**
- 2x+ faster execution (tests run simultaneously)
- Comprehensive cross-platform testing
- Scalable to many devices
- Same test code for all platforms

See [Parallel Testing Guide](docs/parallel-testing.md) for detailed information.

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
npm test                         # Run default test suite
npm run test:login               # Run login test (legacy)
npm run test:login:pom           # Run login test with Page Object Model
npm run test:login:release       # Run with release build
npm run test:parallel:all        # Run tests on all devices in parallel
npm run test:parallel:ios        # Run tests on iOS devices in parallel
npm run test:parallel:android    # Run tests on Android devices in parallel
npm run appium                   # Start Appium server
```

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
- ✅ Automatic screenshot on test failure
- ✅ Cross-platform element location
- ✅ Configuration-driven tests (.env support)

**Parallel Execution:**
- ✅ Parallel test runner across multiple devices
- ✅ Platform-specific test execution (iOS/Android)
- ✅ Test result aggregation
- ✅ 2x+ faster test execution

**CI/CD:**
- ✅ GitHub Actions workflows (Android, iOS, Full Suite)
- ✅ Automated testing on push and PR
- ✅ Test artifact collection (screenshots, logs)
- ✅ Status badges and PR integration

**Reporting:**
- ✅ Allure HTML report integration
- ✅ Rich test metadata (steps, screenshots, logs)
- ✅ Historical trend tracking
- ✅ Report generation and viewing scripts

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

### Phase 6: Next Steps (Optional)
- [ ] Video recording of test runs
- [ ] Advanced test cases (forms, lists, navigation)
- [ ] Performance metrics collection
- [ ] Web UI for test management
- [ ] Firebase Test Lab integration
- [ ] Visual regression testing

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

**Version:** 2.0.0
**Status:** Phases 1-3 Complete (Android, iOS, Parallel Testing)
**Last Updated:** December 2024
