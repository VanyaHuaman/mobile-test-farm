# Mobile Test Farm - Quick Start Guide (Native Android Compose)

Get up and running with native Android Jetpack Compose testing in under 10 minutes.

## Overview

This guide shows you how to:
1. Set up your environment
2. Install the Mobile Test Farm
3. Build the native Android Compose app
4. Register a device
5. Run automated Compose UI tests

**Time Required:** ~10 minutes

---

## Step 1: Prerequisites (2 minutes)

### Check Your System

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
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 22.21.1
nvm use 22.21.1
```

**Java JDK:**
```bash
brew install openjdk@11
export JAVA_HOME=/usr/local/opt/openjdk@11
```

**Android SDK:**
1. Download [Android Studio](https://developer.android.com/studio)
2. Install Android SDK
3. Set environment:
   ```bash
   export ANDROID_HOME=~/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

---

## Step 2: Install Mobile Test Farm (1 minute)

```bash
git clone -b native-android-example https://github.com/VanyaHuaman/mobile-test-farm.git
cd mobile-test-farm
npm run setup
```

**What gets installed:**
- Appium 3.1.2
- UiAutomator2 driver 6.7.5
- WebDriverIO 9.21.0
- mitmproxy (API mocking)
- All dependencies

---

## Step 3: Build the Native Android App (2 minutes)

```bash
npm run build:native-android
```

**App location:** `examples/native-android-app/app/build/outputs/apk/debug/app-debug.apk`

**App features:**
- Login (Compose TextFields with character-by-character input)
- Home (bottom navigation)
- Users list (LazyColumn with JSONPlaceholder API)
- Profile (settings)
- 100% Kotlin + Jetpack Compose

---

## Step 4: Start Services (30 seconds)

```bash
npm start
```

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
```

---

## Step 5: Connect Android Device (2 minutes)

### Option A: Emulator

```bash
emulator -list-avds
emulator -avd Pixel_9_API_34 &
adb devices
```

### Option B: Physical Device

1. Enable USB Debugging (Settings → Developer Options)
2. Connect via USB
3. Accept authorization prompt
4. Verify: `adb devices`

---

## Step 6: Register Device (1 minute)

```bash
npm run devices sync
npm run devices register
```

Follow prompts to register your device with a friendly name.

---

## Step 7: Run Your First Compose Test (1 minute)

```bash
npm run test:native-android:login
```

**What this tests:**
1. Launches native Compose app
2. Enters username character-by-character (required for Compose)
3. Enters password character-by-character
4. Dismisses keyboard with back button
5. Clicks login button
6. Verifies home screen

**All 4 login scenarios:**
- ✅ Valid credentials
- ✅ Empty username
- ✅ Empty password
- ✅ Invalid credentials

---

## Step 8: Try More Tests (30 seconds)

```bash
npm run test:native-android:users     # LazyColumn + API
npm run test:native-android:profile   # Profile screen
npm run test:native-android:all       # All tests
```

---

## Step 9: View Reports (30 seconds)

```bash
npm run report:serve
```

---

## Success! 🎉

### What You've Accomplished:

✅ Built native Android Compose app
✅ Started services with one command
✅ Registered a device
✅ Ran Compose UI tests
✅ Learned character-by-character text input

### Next Steps:

1. **Learn Compose Patterns:** [docs/COMPOSE_TESTING_BEST_PRACTICES.md](docs/COMPOSE_TESTING_BEST_PRACTICES.md)
2. **Try API Mocking:** `MOCKOON_ENABLED=true npm run test:native-android:users`
3. **Parallel Testing:** `npm run test:parallel:all`
4. **Web Dashboard:** http://localhost:3000

---

## Compose Testing Quick Reference

### Character-by-Character Input (REQUIRED)

```javascript
// ❌ DON'T - doesn't work with Compose
await element.setValue('demo');

// ✅ DO - works with Compose
const element = await this.getElement(selector);
await element.click();
await this.pause(300);
for (const char of 'demo') {
  await this.driver.keys([char]);
  await this.pause(50);
}
```

### Keyboard Dismissal

```javascript
await this.driver.back();
await this.pause(500);
```

### Add testTags

```kotlin
TextField(
    modifier = Modifier.semantics {
        testTag = "username-input"
        contentDescription = "username-input"
    }
)
```

---

## Troubleshooting

### "Element not found"
Check testTags in Compose code

### "Text input not working"
Use character-by-character pattern

### "App not installed"
`npm run build:native-android:clean`

### "Appium connection refused"
`npm start`

---

## Essential Commands

```bash
# Services
npm start

# Build
npm run build:native-android

# Test
npm run test:native-android:login
npm run test:native-android:all

# Devices
npm run devices list
npm run devices sync

# Reports
npm run report:serve
```

---

## Support

- 📖 [README.md](README.md)
- 🤖 [Compose Testing Guide](docs/COMPOSE_TESTING_BEST_PRACTICES.md)
- 🐛 [Report issues](https://github.com/VanyaHuaman/mobile-test-farm/issues)

---

**Happy Testing with Jetpack Compose!** 🚀
