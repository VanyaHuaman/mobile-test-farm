# Mobile Test Farm

> **🤖 Native Android Compose Example** - This branch contains a complete native Android app built with Jetpack Compose.
> **✨ Want Expo/React Native?** Check out the [`master` branch](https://github.com/VanyaHuaman/mobile-test-farm/tree/master) for an Expo/React Native example.
> **📦 Want a clean template?** Check out the [`template` branch](https://github.com/VanyaHuaman/mobile-test-farm/tree/template) for a ready-to-use template.

[![Mobile Test Farm CI](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/mobile-tests.yml/badge.svg)](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/mobile-tests.yml)
[![Android Tests](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/test-android.yml/badge.svg)](https://github.com/VanyaHuaman/mobile-test-farm/actions/workflows/test-android.yml)

Automated mobile testing infrastructure demonstrating **native Android app testing with Jetpack Compose**. This branch shows Compose-specific testing patterns, character-by-character text input, and modern Android UI automation.

**Get started:**
```bash
git clone -b native-android-example https://github.com/VanyaHuaman/mobile-test-farm.git
cd mobile-test-farm
npm run setup
npm start
npm run build:native-android
npm run test:native-android:login
```

## Features

✅ **Native Android Compose Testing** - Proven patterns for Jetpack Compose UI automation
✅ **Character-by-Character Text Input** - Working solution for Compose TextFields
✅ **Accessibility & Resource IDs** - Hybrid selector strategy for maximum reliability
✅ **testTagsAsResourceId Support** - Experimental Compose API integration
✅ **Universal Device Support** - Emulators, physical devices, cloud farms
✅ **User-Friendly Device Names** - Use "Pixel 9 Emulator" instead of "emulator-5554"
✅ **Automated Testing** - End-to-end tests with Appium + WebDriverIO
✅ **Parallel Execution** - Run tests across multiple devices simultaneously
✅ **Page Object Model** - Maintainable architecture with auto screenshots
✅ **HTML Test Reports** - Beautiful Allure reports with charts and history
✅ **CI/CD Ready** - GitHub Actions workflows included
✅ **Web Dashboard** - User-friendly UI for non-technical team members
✅ **API Mocking** - MITM proxy + Mockoon for zero-code-change mocking
✅ **Traffic Recording** - Auto-record API calls on test failure
✅ **Appium 3** - Latest Appium with Node.js 22 compatibility

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
cd mobile-test-farm
npm run setup
```

This installs:
- ✅ Appium 3.1.2
- ✅ UiAutomator2 driver 6.7.5
- ✅ WebDriverIO 9.21.0
- ✅ mitmproxy (API mocking)
- ✅ All dependencies

### Start Services

```bash
npm start
```

This starts Appium + Dashboard with health checks:
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

### Build the Native Android App

```bash
npm run build:native-android
```

**App location:** `examples/native-android-app/app/build/outputs/apk/debug/app-debug.apk`

**App features:**
- Login screen with Compose TextFields
- Home screen with bottom navigation
- Users list with API data (JSONPlaceholder)
- Profile screen with settings
- 100% Kotlin with Jetpack Compose
- Modern Material Design 3

### Register a Device

```bash
npm run devices sync
npm run devices register
```

### Run Your First Test

```bash
npm run test:native-android:login
```

## Native Android Compose App

### Location

`examples/native-android-app/`

### Structure

```
examples/native-android-app/
├── app/
│   ├── build.gradle.kts
│   └── src/main/
│       ├── AndroidManifest.xml
│       └── java/com/example/nativecomposeapp/
│           ├── MainActivity.kt                # Entry point with testTagsAsResourceId
│           ├── ui/                           # Compose screens
│           │   ├── LoginScreen.kt
│           │   ├── HomeScreen.kt
│           │   ├── UsersListScreen.kt
│           │   └── ProfileScreen.kt
│           ├── navigation/NavGraph.kt
│           ├── data/UserRepository.kt
│           └── viewmodel/UsersViewModel.kt
├── build.gradle.kts
├── settings.gradle.kts
└── README.md
```

### Key Configuration

**Package:** `com.example.nativecomposeapp`
**Activity:** `.MainActivity`
**Min SDK:** 24 (Android 7.0)
**Target SDK:** 34 (Android 14)
**Compose:** 1.5.x

### Build Commands

```bash
# Build debug APK
npm run build:native-android

# Clean build
npm run build:native-android:clean

# Or use Gradle directly
cd examples/native-android-app
./gradlew assembleDebug
```

## Compose Testing Best Practices

### 1. Character-by-Character Text Input

Compose TextFields don't work with `element.setValue()`. Use character-by-character input:

```javascript
async enterUsername(username) {
  const element = await this.getElement(this.selectors.usernameInput);
  await element.click();
  await this.pause(300);

  // REQUIRED for Compose - character by character
  for (const char of username) {
    await this.driver.keys([char]);
    await this.pause(50);
  }

  await this.pause(300);
}
```

### 2. Keyboard Dismissal

Use `driver.back()` instead of `hideKeyboard()`:

```javascript
await this.driver.back();
await this.pause(500);
```

### 3. testTagsAsResourceId

Enable in MainActivity for flexibility:

```kotlin
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.testTagsAsResourceId

@OptIn(ExperimentalComposeUiApi::class)
override fun onCreate(savedInstanceState: Bundle?) {
    setContent {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .semantics { testTagsAsResourceId = true }
        ) {
            AppNavGraph()
        }
    }
}
```

### 4. Hybrid Selector Strategy

```javascript
selectors = {
  usernameInput: {
    android: '~username-input',  // Accessibility ID (primary)
  },
  userListItem: {
    android: 'id:user-item-1',   // Resource ID (for lists/patterns)
  },
};
```

### 5. Add testTags to Compose Elements

```kotlin
TextField(
    value = username,
    onValueChange = { username = it },
    modifier = Modifier.semantics {
        testTag = "username-input"
        contentDescription = "username-input"  // For Appium
    }
)
```

See [COMPOSE_TESTING_BEST_PRACTICES.md](docs/COMPOSE_TESTING_BEST_PRACTICES.md) for complete guide.

## Running Tests

### Native Android Tests

```bash
# Login test (all 4 scenarios)
npm run test:native-android:login

# Users list with API
npm run test:native-android:users

# Profile screen
npm run test:native-android:profile

# All native Android tests
npm run test:native-android:all
```

### Run on Specific Device

```bash
node tests/specs/native-android/login.spec.js pixel-9
node tests/specs/native-android/login.spec.js "Pixel 9 Emulator"
```

### Parallel Testing

```bash
npm run test:parallel:all
```

## Device Management

### Register Devices

```bash
npm run devices sync
npm run devices register
```

### List Devices

```bash
npm run devices list
```

**Example output:**
```
📱 Registered Devices:

✅ 🖥️  Pixel 9 Emulator
   ID: pixel-9
   Device ID: emulator-5554
   Platform: android | Type: emulator
   Model: sdk_gphone64_x86_64 | OS: Android 14
```

### Use in Tests

```javascript
await testBase.runTest("pixel-9", APP_CONFIG, async (driver) => {
  // Test code
});
```

See [Device Management Guide](docs/device-management.md).

## Test Reporting

```bash
npm run report:serve
```

Reports include:
- Pass/fail statistics
- Screenshots on failure
- Device information
- Test history

See [HTML Reporting Guide](docs/html-reporting.md).

## API Mocking

```bash
# Setup MITM proxy
npm run setup:mitm:android

# Run with mocking
MOCKOON_ENABLED=true npm run test:native-android:users

# Test error scenarios
MOCKOON_ENABLED=true MOCKOON_MOCK_FILE=mocks/environments/error-scenarios.json npm run test:native-android:users
```

See [API Mocking Guide](docs/MOCKING.md) and [MITM Setup Guide](docs/MITM_SETUP.md).

## Available Commands

### Services
```bash
npm start                        # Start Appium + Dashboard (recommended)
npm run appium                   # Start Appium only
npm run dashboard                # Start Dashboard only
npm run services:check           # Check if running
```

### Native Android App
```bash
npm run build:native-android       # Build debug APK
npm run build:native-android:clean # Clean build
npm run test:native-android:login  # Login tests
npm run test:native-android:users  # Users list tests
npm run test:native-android:profile # Profile tests
npm run test:native-android:all    # All tests
```

### Device Management
```bash
npm run devices list             # List devices
npm run devices sync             # Discover devices
npm run devices register         # Register device
```

### Testing
```bash
npm run test:parallel:all        # Parallel testing
npm run report:serve             # View reports
```

### API Mocking
```bash
npm run setup:mitm:android       # Setup MITM
```

## Documentation

- 📖 [Quick Start Guide](QUICKSTART.md) - Get running in 10 minutes
- 🤖 [Compose Testing Guide](docs/COMPOSE_TESTING_BEST_PRACTICES.md) - Compose patterns
- 🔧 [Device Management](docs/device-management.md) - Register and manage devices
- 🧪 [Test Suites](docs/test-suites.md) - Writing tests
- 🎭 [API Mocking](docs/MOCKING.md) - Mock API responses
- 📊 [HTML Reporting](docs/html-reporting.md) - Generate reports
- ⚡ [Parallel Testing](docs/parallel-testing.md) - Multi-device testing
- ☁️ [Cloud Integration](docs/CLOUD_INTEGRATION.md) - BrowserStack, Sauce Labs
- 🔍 [Element Inspection](docs/ELEMENT_INSPECTION.md) - Find UI elements
- 🚀 [CI/CD Integration](docs/ci-cd-integration.md) - GitHub Actions
- 🌐 [Web Dashboard](docs/web-dashboard.md) - Use the web UI
- 🔧 [Android Setup](docs/setup-android.md) - Detailed Android config
- 🔐 [MITM Setup](docs/MITM_SETUP.md) - Proxy configuration

## Architecture

```
mobile-test-farm/
├── bin/
│   ├── check-services.js         # Health checks
│   ├── devices.js                # Device CLI
│   └── setup.js                  # Automated setup
├── config/
│   ├── test.config.js
│   ├── devices.json
│   └── capabilities/
├── tests/
│   ├── specs/
│   │   └── native-android/       # Native Android tests
│   │       ├── login.spec.js
│   │       ├── users-list.spec.js
│   │       └── profile.spec.js
│   ├── page-objects/
│   │   └── native-android/       # Compose page objects
│   │       ├── LoginPage.js
│   │       ├── HomePage.js
│   │       ├── UsersListPage.js
│   │       └── ProfilePage.js
│   └── helpers/
├── examples/
│   └── native-android-app/       # Native Compose app
│       ├── app/
│       ├── build.gradle.kts
│       └── settings.gradle.kts
├── lib/
├── server/                       # Web Dashboard
├── mocks/                        # API mocks
├── docs/                         # Documentation
│   └── COMPOSE_TESTING_BEST_PRACTICES.md
├── allure-results/
└── allure-report/
```

## Compose Testing Patterns Demonstrated

### 1. Login Tests (4 scenarios)

- ✅ Valid credentials
- ✅ Empty username
- ✅ Empty password
- ✅ Invalid credentials

All use character-by-character text input and `driver.back()` for keyboard dismissal.

### 2. Users List Tests

- LazyColumn scrolling
- API integration (JSONPlaceholder)
- Loading states
- Error handling

### 3. Navigation Tests

- Bottom navigation
- Screen transitions
- Back navigation

### 4. Form Input Tests

- TextField interaction
- Button clicks
- Validation states

## Best Practices

### 1. Always Use Character-by-Character Input

```javascript
// ❌ DON'T - doesn't work with Compose
await element.setValue('text');

// ✅ DO - works with Compose
for (const char of 'text') {
  await driver.keys([char]);
  await pause(50);
}
```

### 2. Dismiss Keyboard with Back Button

```javascript
// ✅ Reliable
await driver.back();
await pause(500);
```

### 3. Use Accessibility IDs as Primary Selectors

```javascript
// ✅ Primary approach
selectors = {
  loginButton: {
    android: '~login-button',
  },
};
```

### 4. Enable testTagsAsResourceId

Adds flexibility for future optimizations without breaking existing tests.

### 5. Use Page Object Model

Keep tests maintainable:

```javascript
const loginPage = new LoginPage(driver);
await loginPage.login('demo', 'password');
```

## Troubleshooting

### "Element not found"

Check testTags in Compose code:

```kotlin
modifier = Modifier.semantics {
    testTag = "my-element"
    contentDescription = "my-element"
}
```

### "Text input not working"

Use character-by-character input (required for Compose).

### "App not installed"

Rebuild:

```bash
npm run build:native-android:clean
```

### Gradle build fails

```bash
cd examples/native-android-app
./gradlew clean
./gradlew assembleDebug
```

### Tests pass locally but fail in CI

Ensure APK is built in CI before tests run.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Add tests
5. Update documentation
6. Submit pull request

## License

ISC

## Support

- 📖 [Documentation](docs/)
- 🐛 [Report issues](https://github.com/VanyaHuaman/mobile-test-farm/issues)
- 💬 [Discussions](https://github.com/VanyaHuaman/mobile-test-farm/discussions)

---

**Happy Testing with Jetpack Compose!** 🚀
