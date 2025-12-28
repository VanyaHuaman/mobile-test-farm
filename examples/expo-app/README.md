# Expo Architecture Example App

A modern React Native Expo app using **Expo Router** and the **New Architecture** (Fabric + TurboModules), designed for mobile test automation with Appium.

## Features

This app includes common mobile UI patterns for testing:

- **Login Screen** - Text inputs, button interactions, form validation
- **Home Dashboard** - Navigation, buttons, static content
- **Form Screen** - Various input types (text, email, number, multiline), switches
- **List Screen** - Scrollable list, filtering, item interactions
- **Profile Screen** - User data display, settings options, destructive actions

## Modern Architecture

This app showcases:
- **Expo Router** - File-based routing system (similar to Next.js)
- **New Architecture** - React Native's Fabric renderer and TurboModules enabled
- **Type-safe Navigation** - Built-in type safety with Expo Router

## Test-Friendly Design

All interactive elements include:
- `testID` props for easy Appium element location
- `accessibilityLabel` for screen reader support
- Semantic component structure

## Getting Started

### Prerequisites

- Node.js (v20.x)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`

### Installation

```bash
npm install
```

### Running the App

#### Start Development Server
```bash
npm start
```

#### Run on Android
```bash
npm run android
```

#### Run on iOS
```bash
npm run ios
```

#### Run on Web
```bash
npm run web
```

## Test Credentials

For the Login screen:
- Username: `demo`
- Password: `password`

## App Structure

```
app/
├── _layout.js          # Root layout with Stack navigator
├── index.js            # Login screen (/)
├── home.js             # Home dashboard (/home)
├── form.js             # Form screen (/form)
├── list.js             # List screen (/list)
└── profile.js          # Profile screen (/profile)
```

**Expo Router** uses file-based routing - each file in the `app/` directory automatically becomes a route.

## Building for Testing

### Android APK (for Appium testing)

```bash
# Development build
npx expo export:android

# Production build (requires EAS)
eas build --platform android
```

### iOS IPA (for Appium testing)

```bash
# Requires macOS and Xcode
eas build --platform ios
```

## Appium Test IDs Reference

### Login Screen
- `username-input` - Username text input
- `password-input` - Password text input
- `login-button` - Login submit button
- `forgot-password-link` - Forgot password link

### Home Screen
- `menu-item-form` - Navigate to Form
- `menu-item-list` - Navigate to List
- `menu-item-profile` - Navigate to Profile
- `logout-button` - Logout button

### Form Screen
- `back-button` - Back navigation
- `name-input` - Full name input
- `email-input` - Email input
- `age-input` - Age input
- `bio-input` - Bio textarea
- `notifications-switch` - Notifications toggle
- `newsletter-switch` - Newsletter toggle
- `submit-button` - Submit form button
- `clear-button` - Clear form button

### List Screen
- `back-button` - Back navigation
- `filter-all` - Show all items
- `filter-pending` - Show pending items
- `filter-in-progress` - Show in-progress items
- `filter-completed` - Show completed items
- `list-item-{id}` - Individual list items (e.g., `list-item-1`)
- `task-list` - FlatList container

### Profile Screen
- `back-button` - Back navigation
- `profile-phone` - Phone number display
- `profile-location` - Location display
- `profile-member-since` - Member since display
- `setting-edit-profile` - Edit profile option
- `setting-notifications` - Notifications option
- `setting-privacy` - Privacy option
- `setting-help-&-support` - Help & support option
- `setting-about` - About option
- `delete-account-button` - Delete account button

## License

MIT
