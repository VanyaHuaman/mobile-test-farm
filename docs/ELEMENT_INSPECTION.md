# Element Inspection Guide

Before writing tests, you need to know how to find element selectors in your app. This guide shows you how to inspect your mobile app's UI elements.

## Why You Need This

When writing tests, you need to tell Appium which elements to interact with:

```javascript
// You need to know what selector to use:
await driver.$('~login-button').click();  // ← How did you find "login-button"?
```

This guide shows you how to find those selectors.

---

## Method 1: Appium Inspector (Recommended)

Appium Inspector is a visual tool for inspecting your app's elements in real-time.

### Installation

```bash
# Download from GitHub releases
# https://github.com/appium/appium-inspector/releases

# macOS: Download Appium-Inspector-macos-*.dmg
# Install and open
```

### Setup

1. **Start Appium server:**
   ```bash
   npx appium
   ```

2. **Open Appium Inspector**

3. **Configure connection:**
   ```json
   {
     "platformName": "Android",
     "appium:automationName": "UiAutomator2",
     "appium:deviceName": "emulator-5554",
     "appium:app": "/path/to/your/app-debug.apk",
     "appium:appPackage": "com.yourcompany.yourapp",
     "appium:appActivity": ".MainActivity"
   }
   ```

4. **Click "Start Session"**

### Using Appium Inspector

Once connected:

1. **Screenshot** appears showing your app
2. **Click any element** in the screenshot
3. **Attributes panel** shows element properties:
   - `resource-id` (Android)
   - `accessibility id` (iOS/Android)
   - `class name`
   - `xpath`

4. **Use the selector** in your test:
   ```javascript
   // If element has resource-id="login-button"
   await driver.$('~login-button').click();

   // Or by ID (Android)
   await driver.$('id=login-button').click();

   // Or by text
   await driver.$('android=new UiSelector().text("Login")').click();
   ```

### Best Practices

**Priority order for selectors:**

1. **Accessibility ID** (best - works on both platforms)
   ```javascript
   await driver.$('~login-button').click();
   ```

2. **Resource ID** (Android) / **ID** (iOS)
   ```javascript
   await driver.$('id=com.app:id/login_button').click();
   ```

3. **Text** (use sparingly - breaks with translations)
   ```javascript
   await driver.$('android=new UiSelector().text("Login")').click();
   ```

4. **XPath** (last resort - slow and fragile)
   ```javascript
   await driver.$('//android.widget.Button[@text="Login"]').click();
   ```

---

## Method 2: Android - UI Automator Viewer

Built into Android SDK, no installation needed.

### Usage

```bash
# Launch UI Automator Viewer
~/Library/Android/sdk/tools/bin/uiautomatorviewer

# Or on some systems:
uiautomatorviewer
```

### Steps

1. **Connect device** or start emulator
2. **Open your app** to the screen you want to inspect
3. **Click "Device Screenshot" button** in UI Automator Viewer
4. **Click any element** in the screenshot
5. **View properties** in the right panel:
   - `resource-id`
   - `text`
   - `class`
   - `content-desc` (accessibility ID)

### Example

If you see:
- `resource-id`: `com.myapp:id/login_button`
- `content-desc`: `login-button`

Use in test:
```javascript
// By resource ID
await driver.$('id=com.myapp:id/login_button').click();

// By accessibility ID (better)
await driver.$('~login-button').click();
```

---

## Method 3: iOS - Accessibility Inspector

Built into Xcode for iOS apps.

### Usage

```bash
# Launch Accessibility Inspector
open -a "Accessibility Inspector"

# Or from Xcode menu:
# Xcode → Open Developer Tool → Accessibility Inspector
```

### Steps

1. **Select your simulator** from the dropdown
2. **Open your app** to the screen you want to inspect
3. **Click the crosshair icon** (Inspection tool)
4. **Hover over elements** in the simulator
5. **View properties**:
   - `Identifier` → accessibility ID
   - `Label` → text
   - `Type` → element class

### Example

If you see:
- `Identifier`: `login-button`
- `Label`: `Login`

Use in test:
```javascript
// By accessibility ID (best)
await driver.$('~login-button').click();

// By label text
await driver.$('-ios predicate string:label == "Login"').click();
```

---

## Method 4: Chrome DevTools (React Native/Expo)

For React Native and Expo apps with web views.

### Usage

1. **Enable debug mode** in your app
2. **Open Chrome** and navigate to: `chrome://inspect`
3. **Find your device/emulator** in the list
4. **Click "inspect"** next to your app
5. **Use DevTools** to inspect elements like a web page

### Example

```javascript
// If you find element with id="login-btn"
await driver.$('#login-btn').click();

// If you find by class
await driver.$('.login-button').click();
```

---

## Method 5: Manually in Code

Sometimes you can find elements by trial and error:

```javascript
// Try different selectors
const element = await driver.$('~login-button');  // accessibility ID
if (!await element.isExisting()) {
  element = await driver.$('id=login_button');    // resource ID
}
if (!await element.isExisting()) {
  element = await driver.$('//Button[@text="Login"]'); // xpath
}
```

---

## Common Selector Patterns

### Android

```javascript
// Accessibility ID (works if testID is set in React Native)
await driver.$('~my-element-id').click();

// Resource ID
await driver.$('id=com.app:id/button_login').click();

// UiSelector by text
await driver.$('android=new UiSelector().text("Login")').click();

// UiSelector by description
await driver.$('android=new UiSelector().description("Login button")').click();

// UiSelector by class and instance
await driver.$('android=new UiSelector().className("android.widget.Button").instance(0)').click();

// XPath
await driver.$('//android.widget.Button[@text="Login"]').click();
```

### iOS

```javascript
// Accessibility ID
await driver.$('~login-button').click();

// By type and label
await driver.$('-ios class chain:**/XCUIElementTypeButton[`label == "Login"`]').click();

// By predicate
await driver.$('-ios predicate string:label == "Login"').click();

// XPath
await driver.$('//XCUIElementTypeButton[@name="Login"]').click();
```

---

## Debugging Tips

### Element Not Found?

```javascript
// Print all elements on screen
const allElements = await driver.$$('//*');
for (const el of allElements) {
  const text = await el.getText();
  const id = await el.getAttribute('resource-id');
  console.log({ text, id });
}
```

### Wait for Element

```javascript
// Wait up to 10 seconds for element
const element = await driver.$('~login-button');
await element.waitForDisplayed({ timeout: 10000 });
await element.click();
```

### Check Element Exists

```javascript
const exists = await driver.$('~login-button').isExisting();
console.log('Element exists:', exists);
```

---

## Best Practices Summary

1. **Use accessibility IDs** when possible (best for cross-platform)
2. **Add testID** props in React Native/Expo:
   ```javascript
   <Button testID="login-button" title="Login" />
   ```

3. **Avoid XPath** unless absolutely necessary (slow and fragile)
4. **Avoid text selectors** (breaks with translations)
5. **Use Appium Inspector** to verify selectors before writing tests
6. **Wait for elements** before interacting with them

---

## Next Steps

Now that you can find elements, see:
- **[Writing Tests Guide](writing-tests.md)** - How to write your first test
- **[Page Object Model](test-suites.md#page-object-model)** - Organize your selectors

---

**Questions?** See the [Appium documentation](https://appium.io/docs/en/commands/element/find-elements/) for more selector strategies.
