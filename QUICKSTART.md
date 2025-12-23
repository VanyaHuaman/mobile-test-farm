# Mobile Test Farm - Quick Start Guide

Get up and running with the Mobile Test Farm in under 10 minutes.

## Overview

This guide will help you:
1. Set up your development environment
2. Install and configure the Mobile Test Farm
3. Register your first device
4. Run your first automated test

**Time Required:** ~10 minutes

---

## Step 1: Prerequisites (2 minutes)

### Check Your System

**macOS** (recommended):
```bash
# Check Node.js (18+ required)
node --version

# Check Java (11+ required)
java -version

# Check Android SDK
echo $ANDROID_HOME
```

### Install Missing Prerequisites

**Node.js:**
```bash
# Install via Homebrew
brew install node
```

**Java JDK:**
```bash
# Install via Homebrew
brew install openjdk@11

# Set JAVA_HOME
export JAVA_HOME=/usr/local/opt/openjdk@11
```

**Android SDK:**
1. Download [Android Studio](https://developer.android.com/studio)
2. Install Android SDK via Android Studio
3. Set environment variable:
   ```bash
   export ANDROID_HOME=~/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

---

## Step 2: Install Mobile Test Farm (1 minute)

```bash
# Navigate to project directory
cd ~/mobile-test-farm

# Install dependencies
npm install
```

**What gets installed:**
- Appium 2.19.0 (automation server)
- UiAutomator2 driver 4.2.9 (Android automation)
- WebDriverIO 9.21.0 (test framework)
- Device management tools

---

## Step 3: Verify Installation (1 minute)

```bash
# Check Appium installation
npx appium --version
# Expected: 2.19.0 or higher

# Check UiAutomator2 driver
npx appium driver list --installed
# Expected: ✔ uiautomator2@4.2.9 installed

# Verify device tools
npm run devices list
# Expected: Shows device registry (may be empty)
```

---

## Step 4: Start Appium Server (30 seconds)

**In a new terminal window:**

```bash
cd ~/mobile-test-farm
npx appium
```

**Expected output:**
```
[Appium] Welcome to Appium v2.19.0
[Appium] Appium REST http interface listener started on http://0.0.0.0:4723
[Appium] Available drivers:
[Appium]   - uiautomator2@4.2.9 (automationName 'UiAutomator2')
```

**Keep this terminal running!** Appium needs to run in the background for tests to work.

---

## Step 5: Connect Your First Device (2 minutes)

### Option A: Android Emulator (Fastest)

1. **Start Android Emulator:**
   ```bash
   # List available emulators
   emulator -list-avds

   # Start an emulator (replace with your AVD name)
   emulator -avd Pixel_4_API_30 &
   ```

2. **Verify connection:**
   ```bash
   adb devices
   # Expected: emulator-5554   device
   ```

### Option B: Physical Android Device

1. **Enable USB Debugging:**
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable "USB Debugging"

2. **Connect via USB**

3. **Verify connection:**
   ```bash
   adb devices
   # Expected: ZY223K7LXM   device
   ```

4. **Accept authorization prompt** on device if it appears

---

## Step 6: Register Your Device (1 minute)

### Discover Connected Devices

```bash
npm run devices sync
```

**Example output:**
```
🔍 Discovered 1 Android device(s):

🆕 emulator-5554 - NEW (not registered)
```

### Register the Device

```bash
npm run devices register
```

**Interactive prompts:**
```
📝 Register New Device

📋 Available unregistered devices:

[1] emulator-5554 (sdk_gphone64_arm64)

Select device number (or "q" to quit): 1

Enter friendly name (e.g., "Lenovo 11-inch Tablet"): Android Emulator

Enter OS version (default: "unknown"): Android 14

Enter notes (optional): Test device for automation

✅ Device registered successfully!
   ID: android-emulator
   Name: Android Emulator
   Device ID: emulator-5554
```

### Verify Registration

```bash
npm run devices list
```

**Expected output:**
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

---

## Step 7: Build the Test App (2 minutes)

The test app is already created in `~/expo-arch-example-app`. Now we build it:

```bash
cd ~/expo-arch-example-app

# Build for Android
npx expo run:android
```

**What happens:**
1. Gradle downloads dependencies (first time only)
2. App is compiled
3. APK is built and installed on device
4. App launches automatically

**Expected result:**
- APK location: `android/app/build/outputs/apk/debug/app-debug.apk` (43MB)
- App should launch on your device/emulator
- You should see a login screen

**Test manually:**
- Username: `demo`
- Password: `password`
- Tap "Login" → Should navigate to Home screen ✅

---

## Step 8: Run Your First Automated Test (1 minute)

**In the mobile-test-farm directory:**

```bash
cd ~/mobile-test-farm

# Run the login test
npm run test:login
```

**Expected output:**
```
🚀 Mobile Test Farm - Login Test

Using device: android-emulator (Android Emulator)
Capabilities: {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'emulator-5554',
  'appium:app': '/Users/.../app-debug.apk',
  'appium:appPackage': 'com.vanyahuaman.expoarchexampleapp',
  'appium:appActivity': '.MainActivity',
  'appium:noReset': false
}

Connecting to Appium server...
✅ Session created successfully

Starting test: Login Flow
  ✓ App launched
  ✓ Login screen displayed
  ✓ Username field found
  ✓ Password field found
  ✓ Entering credentials...
  ✓ Tapping login button...
  ✓ Navigated to Home screen
  ✓ Home title verified: "Welcome to Home"

✅ Login test passed!

Session ended
```

**What the test does:**
1. Launches the app
2. Finds username and password fields
3. Enters credentials (demo/password)
4. Taps the login button
5. Verifies navigation to Home screen
6. Confirms "Welcome to Home" text appears

---

## Step 9: Run Test on Specific Device (30 seconds)

If you have multiple devices registered:

```bash
# By device ID
node tests/login-test.js android-emulator

# By friendly name (case-insensitive)
node tests/login-test.js "Android Emulator"
```

---

## Success! 🎉

You now have a working Mobile Test Farm setup!

### What You've Accomplished:

✅ Installed Appium and dependencies
✅ Started Appium server
✅ Connected and registered a device
✅ Built the test app
✅ Ran your first automated test

### Next Steps:

1. **Add More Devices:**
   ```bash
   npm run devices register
   ```

2. **Write More Tests:**
   - See [Writing Tests Guide](docs/writing-tests.md)
   - Example tests in `tests/` directory

3. **Test on Multiple Devices:**
   ```javascript
   // Example: tests/multi-device-test.js
   const DeviceManager = require('./lib/device-manager');
   const manager = new DeviceManager();

   const devices = manager.listActiveDevices();
   for (const device of devices) {
     console.log(`Testing on ${device.friendlyName}...`);
     // Run test
   }
   ```

4. **Explore Documentation:**
   - [Device Management Guide](docs/device-management.md)
   - [Phase 1 Completion Report](docs/phase1-completion.md)
   - [Android Setup Guide](docs/setup-android.md)

---

## Troubleshooting

### "No devices found"
```bash
# Check ADB connection
adb devices

# Restart ADB if needed
adb kill-server && adb start-server

# Try discovery again
npm run devices sync
```

### "Appium connection refused"
```bash
# Check if Appium is running
curl http://localhost:4723/status

# If not, start Appium
npx appium
```

### "Device unauthorized"
1. Check your device for USB debugging authorization prompt
2. Select "Always allow from this computer"
3. Click OK
4. Run `adb devices` again

### Test fails with "Element not found"
```bash
# App might not be installed
cd ~/expo-arch-example-app
npx expo run:android

# Or rebuild
cd ~/expo-arch-example-app/android
./gradlew clean
cd ..
npx expo run:android
```

---

## Quick Reference

### Essential Commands

```bash
# Device Management
npm run devices list          # List all devices
npm run devices sync          # Discover devices
npm run devices register      # Add new device

# Testing
npm run test:login            # Run login test
node tests/login-test.js "Device Name"  # Test specific device

# Appium
npx appium                    # Start server
curl http://localhost:4723/status  # Check status

# Android
adb devices                   # List connected devices
adb logcat                    # View device logs
emulator -list-avds           # List emulators
```

### File Locations

- **Test Farm**: `~/mobile-test-farm/`
- **Test App**: `~/expo-arch-example-app/`
- **APK**: `~/expo-arch-example-app/android/app/build/outputs/apk/debug/app-debug.apk`
- **Device Config**: `~/mobile-test-farm/config/devices.json`
- **Test Scripts**: `~/mobile-test-farm/tests/`

---

## Support

Need help?
- 📖 Check [README.md](README.md) for detailed documentation
- 🔧 See [Troubleshooting](#troubleshooting) section above
- 📝 Review [docs/](docs/) for guides
- 🐛 Report issues on GitHub

**Happy Testing!** 🚀
