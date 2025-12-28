# Mobile Test Farm - Quick Start Guide

Get up and running with the Mobile Test Farm in under 10 minutes using the Expo/React Native example app.

## Overview

This guide will help you:
1. Set up your development environment
2. Install and configure the Mobile Test Farm
3. Build the example Expo app
4. Register your first device
5. Run your first automated test

**Time Required:** ~10 minutes

---

## Step 1: Prerequisites (2 minutes)

### Check Your System

**macOS** (recommended):
```bash
# Check Node.js (22.21.1 required)
node --version

# Check Java (11+ required)
java -version

# Check Android SDK
echo $ANDROID_HOME
```

### Install Missing Prerequisites

**Node.js 22.21.1:**
```bash
# Install via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 22.21.1
nvm use 22.21.1
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
# Clone the repository
git clone https://github.com/VanyaHuaman/mobile-test-farm.git
cd mobile-test-farm

# Run automated setup
npm run setup
```

**What gets installed:**
- Appium 3.1.2 (automation server)
- UiAutomator2 driver 6.7.5 (Android automation)
- XCUITest driver 10.12.2 (iOS automation)
- WebDriverIO 9.21.0 (test framework)
- mitmproxy (for API mocking)
- All dependencies and certificates

---

## Step 3: Build the Example App (2 minutes)

The Expo/React Native example app is located at `examples/expo-app/`.

**For Android:**

```bash
cd examples/expo-app
npx expo run:android
```

Wait for the build to complete. The app will launch on your connected device/emulator.

**For iOS (macOS only):**

```bash
cd examples/expo-app
npx expo run:ios
```

**What this app includes:**
- Login screen with validation
- Home screen with bottom navigation
- Form with various input types
- Scrollable list with API data (JSONPlaceholder)
- Profile screen with settings

---

## Step 4: Start Services (30 seconds)

In the mobile-test-farm directory:

```bash
cd ~/mobile-test-farm
npm start
```

This starts both Appium and the Web Dashboard with automatic health checks.

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

**Keep this terminal running!** Both services need to run in the background for tests to work.

**Alternative:** If you prefer to start Appium manually:
```bash
npx appium
```

---

## Step 5: Connect Your First Device (2 minutes)

### Option A: Android Emulator (Fastest)

1. **Start Android Emulator:**
   ```bash
   # List available emulators
   emulator -list-avds

   # Start an emulator (replace with your AVD name)
   emulator -avd Pixel_9_API_34 &
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

### Option C: iOS Simulator (macOS only)

1. **List available simulators:**
   ```bash
   xcrun simctl list devices
   ```

2. **Launch a simulator:**
   ```bash
   open -a Simulator
   ```

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

## Step 7: Run Your First Test (1 minute)

**In another terminal** (keep npm start running):

```bash
cd ~/mobile-test-farm

# Run the login test
npm run test:login
```

**What this test does:**
1. Launches the Expo example app on your device
2. Enters username and password
3. Clicks the login button
4. Verifies navigation to Home screen
5. Confirms "Welcome to Home" text appears
6. Takes screenshots
7. Generates a test report

**Expected output:**
```
Running test on: Android Emulator (emulator-5554)
✓ App launched successfully
✓ Entered username: demo
✓ Entered password: ********
✓ Login button clicked
✓ Navigated to Home screen
✓ Home screen verified

Test passed!
```

---

## Step 8: Try More Tests (30 seconds)

```bash
# Form validation test
npm run test:form

# List scrolling test
npm run test:list

# Navigation test
npm run test:navigation

# Profile screen test
npm run test:profile

# API mocking test
npm run test:users
```

---

## Step 9: View Test Report (30 seconds)

Generate a beautiful HTML report with charts and screenshots:

```bash
npm run report:serve
```

Your browser will open with an interactive Allure report showing:
- ✅ Pass/fail statistics
- ✅ Test execution timeline
- ✅ Screenshots
- ✅ Device information
- ✅ Test history

---

## Success! 🎉

You now have a working Mobile Test Farm setup with the Expo example app!

### What You've Accomplished:

✅ Installed Appium and dependencies
✅ Built the Expo/React Native example app
✅ Started Appium + Dashboard with one command
✅ Connected and registered a device
✅ Ran automated tests on your device
✅ Generated beautiful HTML reports

### Next Steps:

1. **Try the Web Dashboard:**
   ```bash
   # Already running if you used npm start
   # Open http://localhost:3000
   ```
   - Visual device management
   - One-click test execution
   - Real-time test output

2. **Test with API Mocking:**
   ```bash
   # Run tests with mocked API responses
   MOCKOON_ENABLED=true npm run test:users
   ```

3. **Add More Devices:**
   ```bash
   npm run devices register
   ```

4. **Run Tests in Parallel:**
   ```bash
   # Run on all registered devices simultaneously
   npm run test:parallel:all
   ```

5. **Connect Your Own App:**

   Edit `config/test.config.js`:
   ```javascript
   apps: {
     android: {
       debug: '/path/to/your/app-debug.apk',
     },
   },
   appInfo: {
     android: {
       package: 'com.yourcompany.yourapp',
       activity: '.MainActivity',
     },
   },
   ```

6. **Write Your Own Tests:**
   - See [Test Suites Guide](docs/test-suites.md)
   - Example tests in `tests/specs/` directory
   - Page objects in `tests/page-objects/`

7. **Try Native Android:**
   ```bash
   # Check out the native Android Compose example
   git checkout native-android-example
   ```

8. **Explore Documentation:**
   - [Device Management Guide](docs/device-management.md)
   - [API Mocking Guide](docs/MOCKING.md)
   - [Parallel Testing Guide](docs/parallel-testing.md)
   - [Web Dashboard Guide](docs/web-dashboard.md)

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
# Check if services are running
npm run services:check

# If not, start services
npm start
```

### "Device unauthorized"
1. Check your device for USB debugging authorization prompt
2. Select "Always allow from this computer"
3. Click OK
4. Run `adb devices` again

### "App not installed"
```bash
# Rebuild the Expo app
cd examples/expo-app
npx expo run:android  # or run:ios
```

### Test fails with "Element not found"
```bash
# Make sure the app is running
# Check that you're using the correct device
npm run devices list

# Try running the app manually first
cd examples/expo-app
npx expo run:android
```

### Build fails for Expo app
```bash
# Clean and rebuild
cd examples/expo-app
rm -rf android/build
rm -rf node_modules
npm install
npx expo run:android
```

---

## Quick Reference

### Essential Commands

```bash
# Services
npm start                      # Start Appium + Dashboard
npm run services:check         # Check if services are running

# Device Management
npm run devices list           # List all devices
npm run devices sync           # Discover devices
npm run devices register       # Add new device

# Testing
npm run test:login             # Run login test
npm run test:form              # Run form test
npm run test:list              # Run list test
npm run test:users             # Run API test

# Parallel Testing
npm run test:parallel:all      # Run on all devices

# Reporting
npm run report:serve           # Generate and view report

# Build Example App
cd examples/expo-app
npx expo run:android           # Build Android
npx expo run:ios               # Build iOS

# Android
adb devices                    # List connected devices
adb logcat                     # View device logs
emulator -list-avds            # List emulators
```

### File Locations

- **Test Farm**: `~/mobile-test-farm/`
- **Example App**: examples/expo-app/`
- **Android APK**: examples/expo-app/android/app/build/outputs/apk/debug/app-debug.apk`
- **iOS .app**: examples/expo-app/ios/build/Build/Products/Debug-iphonesimulator/expoarchexample.app`
- **Device Config**: `~/mobile-test-farm/config/devices.json`
- **Test Scripts**: `~/mobile-test-farm/tests/specs/`
- **Page Objects**: `~/mobile-test-farm/tests/page-objects/`
- **Test Config**: `~/mobile-test-farm/config/test.config.js`

---

## Support

Need help?
- 📖 Check [README.md](README.md) for detailed documentation
- 🔧 See [Troubleshooting](#troubleshooting) section above
- 📝 Review [docs/](docs/) for guides
- 🐛 [Report issues](https://github.com/VanyaHuaman/mobile-test-farm/issues)
- 💬 [Start a discussion](https://github.com/VanyaHuaman/mobile-test-farm/discussions)

---

**Happy Testing!** 🚀
