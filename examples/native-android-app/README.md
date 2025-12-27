# Native Android Compose Example App

A demonstration Android app built with Jetpack Compose UI framework for showcasing mobile test automation patterns with native Android development.

## Features

- **Modern UI**: Built 100% with Jetpack Compose
- **Login Flow**: Form validation and authentication
- **Bottom Navigation**: Tab-based navigation between screens
- **API Integration**: Fetches data from JSONPlaceholder API
- **Profile Management**: User profile display with logout
- **Settings Screen**: Toggle settings and app information
- **Test-Ready**: All UI elements have semantic IDs for automation

## Technology Stack

- **Language**: Kotlin 100%
- **UI Framework**: Jetpack Compose 1.5.x
- **Architecture**: MVVM with ViewModels
- **Navigation**: Jetpack Navigation Compose
- **Networking**: Retrofit + OkHttp
- **Build System**: Gradle with Kotlin DSL
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 34 (Android 14)

## Project Structure

```
app/
├── build.gradle.kts              # App-level dependencies
├── proguard-rules.pro            # ProGuard configuration
└── src/main/
    ├── AndroidManifest.xml       # App manifest
    ├── java/com/example/nativecomposeapp/
    │   ├── MainActivity.kt       # Main entry point
    │   ├── ui/
    │   │   ├── screens/
    │   │   │   ├── LoginScreen.kt      # Login with validation
    │   │   │   ├── HomeScreen.kt       # Home with bottom nav
    │   │   │   ├── UsersListScreen.kt  # Users list from API
    │   │   │   ├── ProfileScreen.kt    # User profile
    │   │   │   └── SettingsScreen.kt   # App settings
    │   │   └── theme/
    │   │       ├── Color.kt            # App colors
    │   │       ├── Theme.kt            # Material theme
    │   │       └── Type.kt             # Typography
    │   ├── navigation/
    │   │   └── NavGraph.kt       # Navigation configuration
    │   ├── data/
    │   │   ├── api/
    │   │   │   ├── ApiService.kt       # Retrofit API interface
    │   │   │   └── RetrofitClient.kt   # HTTP client setup
    │   │   ├── model/
    │   │   │   └── User.kt             # User data model
    │   │   └── repository/
    │   │       └── UserRepository.kt   # Data repository
    │   └── viewmodel/
    │       └── UsersViewModel.kt # Users screen ViewModel
    └── res/
        ├── values/
        │   ├── strings.xml       # String resources
        │   ├── colors.xml        # Color resources
        │   └── themes.xml        # XML themes
        └── xml/
            ├── backup_rules.xml
            └── data_extraction_rules.xml
```

## Building the App

### Prerequisites

- JDK 11 or higher
- Android SDK with API 34
- ANDROID_HOME environment variable set

### Build Commands

```bash
# Build debug APK
./gradlew assembleDebug

# Clean and build
./gradlew clean assembleDebug

# Install on connected device
./gradlew installDebug

# Run all checks and build
./gradlew build
```

### Output Location

Debug APK: `app/build/outputs/apk/debug/app-debug.apk`

## App Information

### Package Details

- **Package Name**: `com.example.nativecomposeapp`
- **Main Activity**: `.MainActivity`
- **Version**: 1.0.0

### Test Credentials

```
Username: demo
Password: password123
```

### API Endpoints

The app uses [JSONPlaceholder](https://jsonplaceholder.typicode.com/) API:
- **Base URL**: https://jsonplaceholder.typicode.com/
- **Users Endpoint**: /users

## Screens Overview

### 1. Login Screen

- Email/username input field
- Password input field with show/hide toggle
- Login button with loading state
- Form validation (empty field checks)
- Error message display
- Demo credentials hint

**Test IDs**:
- `login-screen` - Container
- `username-input` - Username field
- `password-input` - Password field
- `login-button` - Login button
- `error-message` - Error text

### 2. Home Screen

- App title bar
- Bottom navigation with 3 tabs:
  - Users (default)
  - Profile
  - Settings

**Test IDs**:
- `home-screen` - Container
- `users-tab` - Users tab button
- `profile-tab` - Profile tab button
- `settings-tab` - Settings tab button

### 3. Users List Screen

- Displays users from API
- Loading indicator while fetching
- User cards with name and email
- Error state with retry button
- Scrollable list (LazyColumn)

**Test IDs**:
- `users-list-screen` - Container
- `users-list` - LazyColumn
- `user-item-{id}` - Individual user card
- `loading-indicator` - Loading spinner
- `error-message` - Error text
- `retry-button` - Retry button

### 4. Profile Screen

- User information display
- Edit profile button
- Logout button

**Test IDs**:
- `profile-screen` - Container
- `profile-name` - Name row
- `profile-email` - Email row
- `profile-phone` - Phone row
- `edit-profile-button` - Edit button
- `logout-button` - Logout button

### 5. Settings Screen

- Notifications toggle
- Dark mode toggle
- App version display

**Test IDs**:
- `settings-screen` - Container
- `notifications-toggle` - Notifications switch
- `dark-mode-toggle` - Dark mode switch
- `app-version` - Version text

## Testing with Appium

This app is designed to be tested with the mobile-test-farm framework using Appium and WebDriverIO.

### Element Selection Strategy

All interactive elements use `Modifier.semantics` with both `testTag` and `contentDescription`:

```kotlin
Button(
    onClick = { /* ... */ },
    modifier = Modifier.semantics {
        testTag = "login-button"
        contentDescription = "login-button"
    }
) {
    Text("Login")
}
```

This ensures elements can be found by Appium using accessibility IDs:

```javascript
// In test code
await driver.$('~login-button').click();
```

### Running Tests

See the main [mobile-test-farm README](../../README.md) for complete testing instructions.

Quick start:

```bash
# Build the app
npm run build:native-android

# Run login tests
npm run test:native-android:login

# Run users list tests
npm run test:native-android:users

# Run profile tests
npm run test:native-android:profile

# Run all native Android tests
npm run test:native-android:all
```

## Development

### Adding New Screens

1. Create screen composable in `ui/screens/`
2. Add semantic IDs to all interactive elements
3. Add route to `NavGraph.kt`
4. Create corresponding page object in test framework
5. Write test spec

### Adding API Endpoints

1. Add method to `ApiService.kt`
2. Update `UserRepository.kt` or create new repository
3. Create/update ViewModel
4. Update UI screen to display data

## Dependencies

### Core Android
- androidx.core:core-ktx:1.12.0
- androidx.lifecycle:lifecycle-runtime-ktx:2.6.2
- androidx.activity:activity-compose:1.8.1

### Compose
- androidx.compose.ui:ui
- androidx.compose.material3:material3
- androidx.compose.material:material-icons-extended
- androidx.navigation:navigation-compose:2.7.5

### Networking
- com.squareup.retrofit2:retrofit:2.9.0
- com.squareup.retrofit2:converter-gson:2.9.0
- com.squareup.okhttp3:okhttp:4.12.0

### ViewModel
- androidx.lifecycle:lifecycle-viewmodel-compose:2.6.2

See `app/build.gradle.kts` for complete list.

## Troubleshooting

### Build Fails

```bash
# Clear build cache
./gradlew clean

# Invalidate caches in Android Studio
File > Invalidate Caches / Restart
```

### App Doesn't Launch

Check that:
- ANDROID_HOME is set correctly
- Android SDK tools are installed
- Device/emulator is connected: `adb devices`

### Network Issues

The app uses `android:usesCleartextTraffic="true"` in AndroidManifest.xml to allow HTTP traffic for the JSONPlaceholder API. For production apps, use HTTPS only.

## License

MIT License - This is example/demonstration code

## Related Documentation

- [Testing Native Android Compose Apps](../../docs/TESTING_NATIVE_ANDROID_COMPOSE.md)
- [Main Test Farm README](../../README.md)
- [Element Inspection Guide](../../docs/ELEMENT_INSPECTION.md)
- [Writing Tests Guide](../../docs/writing-tests.md)
