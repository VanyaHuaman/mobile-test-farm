# Testing Native Android Compose Apps with Appium

This guide explains how to test native Android apps built with Jetpack Compose using the Mobile Test Farm framework.

## Table of Contents

- [Overview](#overview)
- [Compose Semantics for Testing](#compose-semantics-for-testing)
- [Finding Compose Elements](#finding-compose-elements)
- [Common Patterns](#common-patterns)
- [Page Object Model](#page-object-model)
- [Test Examples](#test-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

Jetpack Compose is Android's modern declarative UI framework. Unlike traditional XML-based Android UIs, Compose builds interfaces through composable functions written in Kotlin.

**Key Differences from XML Views**:
- No resource IDs like `R.id.button_login`
- Elements are functions, not XML tags
- Uses `Modifier.semantics` instead of XML attributes
- Dynamic UI generation at runtime

**Why This Matters for Testing**:
Compose elements don't automatically have IDs. You must explicitly add semantic properties for Appium to find them.

---

## Compose Semantics for Testing

### Adding Test IDs to Compose Elements

In Compose, use `Modifier.semantics` to add test identifiers:

```kotlin
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.testTag

Button(
    onClick = { /* action */ },
    modifier = Modifier.semantics {
        testTag = "login-button"              // For Compose Testing
        contentDescription = "login-button"    // For Appium
    }
) {
    Text("Login")
}
```

**Important**: Always set both:
1. `testTag` - Used by Compose testing library
2. `contentDescription` - Used by Appium (accessibility service)

### TextField/Input Elements

```kotlin
OutlinedTextField(
    value = username,
    onValueChange = { username = it },
    label = { Text("Username") },
    modifier = Modifier.semantics {
        testTag = "username-input"
        contentDescription = "username-input"
    }
)
```

### Container Elements

```kotlin
Column(
    modifier = Modifier
        .fillMaxSize()
        .semantics {
            testTag = "login-screen"
            contentDescription = "login-screen"
        }
) {
    // Screen content
}
```

### List Items (LazyColumn)

For dynamic lists, use item IDs in the semantic properties:

```kotlin
LazyColumn {
    items(users) { user ->
        Card(
            modifier = Modifier.semantics {
                testTag = "user-item-${user.id}"
                contentDescription = "user-item-${user.id}"
            }
        ) {
            Text(
                text = user.name,
                modifier = Modifier.semantics {
                    testTag = "user-name-${user.id}"
                    contentDescription = "user-name-${user.id}"
                }
            )
        }
    }
}
```

---

## Finding Compose Elements

### Using Accessibility ID (Recommended)

This is the best method for finding Compose elements:

```javascript
// In your test
await driver.$('~login-button').click();
await driver.$('~username-input').setValue('demo');
```

The `~` prefix tells Appium to find elements by accessibility ID (contentDescription).

### Why Other Methods Don't Work Well

❌ **Resource ID**: Compose elements don't have resource IDs
❌ **XPath**: Slow and fragile for Compose
❌ **Text**: Breaks with translations and dynamic content

✅ **Accessibility ID**: Fast, reliable, works perfectly with Compose semantics

---

## Common Patterns

### 1. Testing Login Form

**Compose Code**:
```kotlin
@Composable
fun LoginScreen(onLoginSuccess: () -> Unit) {
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    Column(
        modifier = Modifier.semantics {
            testTag = "login-screen"
            contentDescription = "login-screen"
        }
    ) {
        OutlinedTextField(
            value = username,
            onValueChange = { username = it },
            modifier = Modifier.semantics {
                testTag = "username-input"
                contentDescription = "username-input"
            }
        )

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.semantics {
                testTag = "password-input"
                contentDescription = "password-input"
            }
        )

        Button(
            onClick = { /* login logic */ },
            modifier = Modifier.semantics {
                testTag = "login-button"
                contentDescription = "login-button"
            }
        ) {
            Text("Login")
        }
    }
}
```

**Test Code**:
```javascript
const loginPage = new LoginPage(driver, 'android');

await loginPage.waitForLoginScreen();
await driver.$('~username-input').setValue('demo');
await driver.$('~password-input').setValue('password123');
await driver.$('~login-button').click();
```

### 2. Testing Bottom Navigation

**Compose Code**:
```kotlin
NavigationBar(
    modifier = Modifier.semantics {
        testTag = "bottom-navigation"
        contentDescription = "bottom-navigation"
    }
) {
    NavigationBarItem(
        icon = { Icon(Icons.Default.Group, contentDescription = "Users") },
        label = { Text("Users") },
        selected = selectedTab == Tab.Users,
        onClick = { selectedTab = Tab.Users },
        modifier = Modifier.semantics {
            testTag = "users-tab"
            contentDescription = "users-tab"
        }
    )
}
```

**Test Code**:
```javascript
await driver.$('~users-tab').click();
await driver.pause(500); // Wait for animation
```

### 3. Testing LazyColumn Lists

**Compose Code**:
```kotlin
LazyColumn(
    modifier = Modifier.semantics {
        testTag = "users-list"
        contentDescription = "users-list"
    }
) {
    items(users) { user ->
        UserCard(
            user = user,
            modifier = Modifier.semantics {
                testTag = "user-item-${user.id}"
                contentDescription = "user-item-${user.id}"
            }
        )
    }
}
```

**Test Code**:
```javascript
// Find first user
const user1 = await driver.$('~user-item-1');
expect(await user1.isDisplayed()).toBe(true);

// Count users
const userItems = await driver.$$('android=new UiSelector().resourceIdMatches(".*user-item-.*")');
console.log(`Found ${userItems.length} users`);
```

### 4. Testing Loading States

**Compose Code**:
```kotlin
when (val state = uiState) {
    is UiState.Loading -> {
        CircularProgressIndicator(
            modifier = Modifier.semantics {
                testTag = "loading-indicator"
                contentDescription = "loading-indicator"
            }
        )
    }
    is UiState.Success -> {
        // Content
    }
    is UiState.Error -> {
        Text(
            text = state.message,
            modifier = Modifier.semantics {
                testTag = "error-message"
                contentDescription = "error-message"
            }
        )
    }
}
```

**Test Code**:
```javascript
// Wait for loading to finish
const loadingIndicator = await driver.$('~loading-indicator');
await loadingIndicator.waitForDisplayed({ timeout: 5000 });
await loadingIndicator.waitForDisplayed({ timeout: 10000, reverse: true });

// Or check for error
const isError = await driver.$('~error-message').isExisting();
```

---

## Page Object Model

### Base Page Class

```javascript
// tests/pages/BasePage.js
class BasePage {
  constructor(driver, platform) {
    this.driver = driver;
    this.platform = platform;
  }

  async getElement(selectors) {
    const selector = selectors[this.platform];
    return await this.driver.$(selector);
  }

  async click(selectors) {
    const element = await this.getElement(selectors);
    await element.click();
  }

  async setText(selectors, text) {
    const element = await this.getElement(selectors);
    await element.setValue(text);
  }

  async getText(selectors) {
    const element = await this.getElement(selectors);
    return await element.getText();
  }
}

module.exports = BasePage;
```

### Page Object Example

```javascript
// tests/page-objects/native-android/LoginPage.js
const BasePage = require('../BasePage');

class LoginPage extends BasePage {
  get selectors() {
    return {
      screen: { android: '~login-screen' },
      usernameInput: { android: '~username-input' },
      passwordInput: { android: '~password-input' },
      loginButton: { android: '~login-button' },
      errorMessage: { android: '~error-message' },
    };
  }

  async waitForLoginScreen() {
    await this.waitForElement(this.selectors.screen);
  }

  async login(username, password) {
    await this.waitForLoginScreen();
    await this.setText(this.selectors.usernameInput, username);
    await this.setText(this.selectors.passwordInput, password);
    await this.click(this.selectors.loginButton);
  }

  async getErrorMessage() {
    return await this.getText(this.selectors.errorMessage);
  }
}

module.exports = LoginPage;
```

---

## Test Examples

### Complete Login Test

```javascript
const TestBase = require('../../helpers/TestBase');
const LoginPage = require('../../page-objects/native-android/LoginPage');
const HomePage = require('../../page-objects/native-android/HomePage');
const config = require('../../../config/test.config');

const APP_CONFIG = {
  'appium:app': config.apps.android.debug,
  'appium:appPackage': config.appInfo.android.package,
  'appium:appActivity': config.appInfo.android.activity,
  'appium:noReset': false,
};

async function testLogin() {
  const testBase = new TestBase();
  const deviceName = process.argv[2] || 'android-emulator-1';

  try {
    await testBase.runTest(
      deviceName,
      APP_CONFIG,
      async (driver) => {
        const loginPage = new LoginPage(driver, 'android');
        const homePage = new HomePage(driver, 'android');

        // Perform login
        await loginPage.login('demo', 'password123');

        // Verify home screen
        await homePage.verifyOnHomePage();

        console.log('✅ Login test passed');
      },
      'native-android-login-test'
    );

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testLogin();
```

### API Integration Test

```javascript
async function testUsersListWithAPI() {
  const testBase = new TestBase();

  await testBase.runTest(
    'android-emulator-1',
    APP_CONFIG,
    async (driver) => {
      const loginPage = new LoginPage(driver, 'android');
      const homePage = new HomePage(driver, 'android');
      const usersPage = new UsersListPage(driver, 'android');

      // Login
      await loginPage.login('demo', 'password123');

      // Wait for home screen (users tab is default)
      await homePage.waitForHomeScreen();

      // Wait for users to load from API
      await usersPage.waitForUsersToLoad();

      // Verify users are displayed
      const userCount = await usersPage.getUserCount();
      expect(userCount).toBeGreaterThan(0);

      console.log(`✅ Loaded ${userCount} users from API`);
    },
    'native-android-users-api-test'
  );
}
```

---

## Best Practices

### 1. Consistent Naming Convention

Use descriptive, kebab-case names for test IDs:

```kotlin
// Good
testTag = "login-button"
testTag = "username-input"
testTag = "user-item-${id}"

// Bad
testTag = "btn1"
testTag = "field"
testTag = "item"
```

### 2. Always Add Both Properties

```kotlin
// Always do this
modifier = Modifier.semantics {
    testTag = "my-element"          // For Compose Testing
    contentDescription = "my-element" // For Appium
}

// Not just this
modifier = Modifier.testTag("my-element")  // Won't work with Appium
```

### 3. Use Semantic Containers

Group related elements under semantic containers:

```kotlin
Column(
    modifier = Modifier.semantics {
        testTag = "login-form"
        contentDescription = "login-form"
    }
) {
    // All form fields inside
}
```

### 4. Dynamic IDs for Lists

For lists, include the item ID in the test tag:

```kotlin
items(users) { user ->
    Card(
        modifier = Modifier.semantics {
            testTag = "user-item-${user.id}"
            contentDescription = "user-item-${user.id}"
        }
    )
}
```

### 5. Wait for Animations

Compose animations can affect element visibility. Add small pauses after navigation:

```javascript
await driver.$('~profile-tab').click();
await driver.pause(300); // Wait for tab switch animation
```

### 6. Handle Loading States

Always wait for loading states to resolve:

```javascript
// Wait for loading to disappear
const loading = await driver.$('~loading-indicator');
try {
    await loading.waitForDisplayed({ timeout: 2000 });
    await loading.waitForDisplayed({ timeout: 10000, reverse: true });
} catch (e) {
    // Loading might not appear if data loads instantly
}
```

---

## Troubleshooting

### Element Not Found

**Problem**: `Error: An element could not be located on the page`

**Solutions**:

1. **Check contentDescription is set**:
```kotlin
// Make sure you have this
modifier = Modifier.semantics {
    contentDescription = "your-element-id"
}
```

2. **Verify selector syntax**:
```javascript
// Correct
await driver.$('~login-button')

// Wrong
await driver.$('login-button')  // Missing ~ prefix
```

3. **Use Appium Inspector** to verify the element exists and its properties

### Element Not Clickable

**Problem**: Element found but click fails

**Solutions**:

1. **Wait for element to be displayed**:
```javascript
const element = await driver.$('~login-button');
await element.waitForDisplayed({ timeout: 5000 });
await element.click();
```

2. **Check if element is covered** by another UI component

3. **Add small delay** after navigation or animations:
```javascript
await driver.pause(500);
await element.click();
```

### LazyColumn Items Not Found

**Problem**: List items don't appear in UI hierarchy

**Solution**: Scroll the list to make items visible:

```javascript
// Scroll down to load more items
await driver.execute('mobile: scrollGesture', {
    left: 100,
    top: 500,
    width: 200,
    height: 800,
    direction: 'down',
    percent: 1.0
});
```

### Compose State Not Updating

**Problem**: UI doesn't reflect state changes

**Solution**: Make sure ViewModel uses proper state management:

```kotlin
// Use StateFlow or MutableState
private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
val uiState: StateFlow<UiState> = _uiState.asStateFlow()

// Collect state in Composable
val uiState by viewModel.uiState.collectAsState()
```

---

## Additional Resources

- [Jetpack Compose Testing Documentation](https://developer.android.com/jetpack/compose/testing)
- [Compose Semantics Guide](https://developer.android.com/jetpack/compose/semantics)
- [Appium Android Documentation](https://appium.io/docs/en/drivers/android-uiautomator2/)
- [Mobile Test Farm README](../README.md)
- [Element Inspection Guide](ELEMENT_INSPECTION.md)

---

## Next Steps

1. Review the [Native Android Compose Example App](../examples/native-android-app/)
2. Run the example tests: `npm run test:native-android:all`
3. Build your own Compose app with semantic IDs
4. Create page objects for your screens
5. Write comprehensive test suites

**Happy Testing with Compose!** 🚀
