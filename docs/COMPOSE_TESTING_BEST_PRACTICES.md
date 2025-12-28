# Jetpack Compose Testing Best Practices with Appium UIAutomator2

This guide documents proven patterns for testing Jetpack Compose apps with Appium UIAutomator2 driver.

## Table of Contents
1. [Setup: testTagsAsResourceId](#setup-testtagsasresourceid)
2. [Selector Strategy](#selector-strategy)
3. [Text Input Pattern](#text-input-pattern)
4. [Keyboard Handling](#keyboard-handling)
5. [Complete Examples](#complete-examples)

---

## Setup: testTagsAsResourceId

### Enable in Your Compose App

Add this to your MainActivity to make testTags visible as resource IDs:

```kotlin
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.testTagsAsResourceId
import androidx.compose.ui.ExperimentalComposeUiApi

class MainActivity : ComponentActivity() {
    @OptIn(ExperimentalComposeUiApi::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            YourAppTheme {
                Surface(
                    modifier = Modifier
                        .fillMaxSize()
                        .semantics {
                            // Makes testTags visible as resourceIds for UIAutomator2
                            testTagsAsResourceId = true
                        }
                ) {
                    AppNavGraph()
                }
            }
        }
    }
}
```

### Add TestTags to Compose Elements

Every interactive element needs both `testTag` and `contentDescription`:

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

TextField(
    value = username,
    onValueChange = { username = it },
    modifier = Modifier.semantics {
        testTag = "username-input"
        contentDescription = "username-input"
    }
)
```

---

## Selector Strategy

### Hybrid Approach: Use Both Selector Types

With `testTagsAsResourceId` enabled, you can use **different selector strategies** for different element types:

#### ✅ Accessibility IDs - Universal Fallback
Works for ALL elements (buttons, labels, inputs, navigation):

```javascript
selectors: {
  loginButton: {
    android: '~login-button',  // ~ prefix = accessibility ID
  },
  username: {
    android: '~username-input',
  }
}
```

**Pros**: Always works, simple syntax
**Cons**: May be slightly slower

#### ✅ Resource IDs - Optimized for Non-Input Elements
Best for buttons, labels, navigation, lists (NOT text input):

```javascript
selectors: {
  loginButton: {
    android: 'android=new UiSelector().resourceId("login-button")',
  },
  welcomeTitle: {
    android: 'android=new UiSelector().resourceId("welcome-title")',
  },
  // Pattern matching for dynamic IDs
  userItems: {
    android: 'android=new UiSelector().resourceIdMatches(".*user-item-.*")',
  }
}
```

**Pros**: Potentially faster, works well with dynamic lists
**Cons**: More verbose, doesn't help with text input

### Recommended Pattern

**Page Object Example**:
```javascript
class LoginPage extends BasePage {
  get selectors() {
    return {
      // Use accessibility IDs for TextFields (easier)
      usernameInput: {
        android: '~username-input',
      },
      passwordInput: {
        android: '~password-input',
      },

      // Can use either for buttons/labels
      loginButton: {
        android: '~login-button',  // Accessibility ID (simpler)
        // OR
        // android: 'android=new UiSelector().resourceId("login-button")',
      },

      errorMessage: {
        android: '~error-message',
      },
    };
  }
}
```

---

## Text Input Pattern

### ❌ What DOESN'T Work

Standard Appium `setValue()` **fails** on Compose TextFields:

```javascript
// THIS WILL FAIL ❌
await element.setValue("demo");
// Error: Cannot set the element to 'demo'. Did you interact with the correct element?
```

Even with `testTagsAsResourceId` enabled, `setValue()` doesn't work on Compose TextFields.

### ✅ What WORKS: Character-by-Character Input

Use `driver.keys()` with character array:

```javascript
async enterUsername(username) {
  const element = await this.getElement(this.selectors.usernameInput);

  // 1. Click to focus the TextField
  await element.click();
  await this.pause(300);

  // 2. Send characters one by one
  for (const char of username) {
    await this.driver.keys([char]);
    await this.pause(50);  // Small delay between characters
  }

  await this.pause(300);
  console.log(`✓ Entered username: ${username}`);
}
```

**Why this works**: Compose TextFields require actual keyboard events, not direct value setting.

---

## Keyboard Handling

### Problem: Keyboard Covers UI Elements

After text input, the on-screen keyboard often covers buttons/elements.

### ❌ What DOESN'T Work
```javascript
await this.driver.hideKeyboard();  // Unreliable on Android
```

### ✅ What WORKS: Android Back Button

```javascript
async login(username, password) {
  await this.enterUsername(username);
  await this.enterPassword(password);

  // Dismiss keyboard using back button
  try {
    await this.driver.back();
    await this.pause(500);
    console.log('✓ Keyboard dismissed');
  } catch (e) {
    console.log('✓ Keyboard already hidden');
  }

  await this.clickLoginButton();
}
```

---

## Complete Examples

### Full Login Page Object

```javascript
const BasePage = require('../../pages/BasePage');

class NativeLoginPage extends BasePage {
  get selectors() {
    return {
      screen: {
        android: '~login-screen',
      },
      usernameInput: {
        android: '~username-input',
      },
      passwordInput: {
        android: '~password-input',
      },
      loginButton: {
        android: '~login-button',
      },
      errorMessage: {
        android: '~error-message',
      },
    };
  }

  async enterUsername(username) {
    const element = await this.getElement(this.selectors.usernameInput);
    await element.click();
    await this.pause(300);

    // Compose TextFields require character-by-character input
    for (const char of username) {
      await this.driver.keys([char]);
      await this.pause(50);
    }

    await this.pause(300);
    console.log(`✓ Entered username: ${username}`);
  }

  async enterPassword(password) {
    const element = await this.getElement(this.selectors.passwordInput);
    await element.click();
    await this.pause(300);

    for (const char of password) {
      await this.driver.keys([char]);
      await this.pause(50);
    }

    await this.pause(300);
    console.log(`✓ Entered password`);
  }

  async clickLoginButton() {
    await this.click(this.selectors.loginButton);
    console.log('✓ Clicked login button');
  }

  async login(username, password) {
    await this.waitForElement(this.selectors.screen);
    await this.enterUsername(username);
    await this.enterPassword(password);

    // Dismiss keyboard before clicking button
    try {
      await this.driver.back();
      await this.pause(500);
      console.log('✓ Keyboard dismissed using back button');
    } catch (e) {
      console.log('✓ Keyboard already hidden');
    }

    await this.clickLoginButton();
  }

  async getErrorMessage() {
    try {
      return await this.getText(this.selectors.errorMessage);
    } catch (error) {
      return null;
    }
  }
}

module.exports = NativeLoginPage;
```

### List Page with Resource IDs

```javascript
class UsersListPage extends BasePage {
  get selectors() {
    return {
      screen: {
        android: '~users-list-screen',
      },
      title: {
        android: '~users-title',
      },
      retryButton: {
        android: '~retry-button',
      },
    };
  }

  /**
   * Get all user items using resource ID pattern matching
   * This leverages testTagsAsResourceId for efficient list queries
   */
  async getUserCount() {
    const userItems = await this.driver.$$(
      'android=new UiSelector().resourceIdMatches(".*user-item-.*")'
    );
    return userItems.length;
  }

  /**
   * Get specific user item by ID
   */
  async clickUserItem(userId) {
    const selector = {
      android: `~user-item-${userId}`,  // Can also use resourceId
    };
    await this.click(selector);
    console.log(`✓ Clicked user ${userId}`);
  }
}
```

---

## Summary: Key Takeaways

1. **Always enable `testTagsAsResourceId`** - It provides flexibility for future optimizations
2. **Use accessibility IDs (`~tag`) as default** - Simple and works everywhere
3. **Consider resource IDs for lists/navigation** - Can be more efficient with `resourceIdMatches()`
4. **Character-by-character text input is mandatory** - `setValue()` doesn't work on Compose TextFields
5. **Use `driver.back()` to dismiss keyboard** - More reliable than `hideKeyboard()`
6. **Add both `testTag` AND `contentDescription`** to every Compose element

---

## References

- [Appium UIAutomator2 Selectors](https://github.com/appium/appium-uiautomator2-driver#element-location)
- [Jetpack Compose Testing](https://developer.android.com/jetpack/compose/testing)
- [WebDriverIO Appium](https://webdriver.io/docs/api/appium)
