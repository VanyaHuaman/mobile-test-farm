# Mobile Test Farm

Automated mobile device testing infrastructure for running tests across multiple Android and iOS devices with user-friendly device management.

## Features

✅ **Universal Device Support** - Works with emulators, simulators, and physical devices
✅ **User-Friendly Device Names** - Use "Lenovo 11-inch Tablet" instead of cryptic IDs
✅ **Automated Testing** - Run end-to-end tests with Appium + WebDriverIO
✅ **Multi-Device Testing** - Test across multiple devices in parallel
✅ **Modern Test App** - Expo app with New Architecture (Fabric + TurboModules)
✅ **Device Registry** - Centralized device configuration and management
✅ **Cross-Platform** - Same tests run on both Android and iOS

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
# Default device
npm run test:login

# Specific device by ID
node tests/login-test.js android-emulator-1

# Specific device by friendly name
node tests/login-test.js "Lenovo 11-inch Tablet"
```

### Test on Multiple Devices

```javascript
const DeviceManager = require('./lib/device-manager');
const manager = new DeviceManager();

// Get all active devices
const devices = manager.listActiveDevices();

// Run test on each device
for (const device of devices) {
  console.log(`Testing on ${device.friendlyName}...`);
  // Run your test with device.id
}
```

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
npm run test                   # Run default test suite
npm run test:login             # Run login test
npm run appium                 # Start Appium server
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

- **[Device Management Guide](docs/device-management.md)** - Complete device management documentation
- **[Phase 1 Completion Report](docs/phase1-completion.md)** - Phase 1 implementation results
- **[Android Setup Guide](docs/setup-android.md)** - Android development environment setup
- **[iOS Setup Guide](docs/setup-ios.md)** - iOS development environment setup (Phase 2)
- **[Writing Tests Guide](docs/writing-tests.md)** - How to write automated tests

## Phase 1 Status: COMPLETE ✅

Phase 1 has been successfully implemented and tested:

- ✅ Android development environment configured
- ✅ Appium 2.19.0 with UiAutomator2 driver 4.2.9 installed
- ✅ Test application built with Expo Router + New Architecture
- ✅ First automated test (login flow) passing
- ✅ Universal device management system implemented
- ✅ Device registry with friendly names working
- ✅ CLI tools for device management created
- ✅ Comprehensive documentation written

**Test Results:**
- Application: expo-arch-example-app (43MB APK)
- Package: com.vanyahuaman.expoarchexampleapp
- Device: Android Emulator (API 36, Android 16)
- Test: Login flow - PASSED ✅

## Roadmap

### Phase 1: Foundation - Android Support ✅ COMPLETE
- ✅ Basic Appium setup for Android
- ✅ Single device automation working
- ✅ Test app with New Architecture
- ✅ Universal device management
- ✅ Device registry with friendly names

### Phase 2: iOS Support (Next)
- [ ] Install XCUITest driver
- [ ] iOS device discovery
- [ ] iOS simulator support
- [ ] Physical iOS device support
- [ ] Cross-platform test execution

### Phase 3: Multi-Device Testing
- [ ] Parallel test execution
- [ ] Device pools
- [ ] Test result aggregation
- [ ] Screenshot/video capture

### Phase 4: Automation and Polish
- [ ] CI/CD integration
- [ ] Web UI for test management
- [ ] Scheduled test runs
- [ ] Advanced reporting

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

**Version:** 1.0.0
**Status:** Phase 1 Complete
**Last Updated:** December 2024
