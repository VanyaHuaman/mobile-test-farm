# Test Suites Documentation

Comprehensive guide to all test suites in the Mobile Test Farm.

## Overview

The Mobile Test Farm now includes 5 comprehensive test suites covering all screens and user flows:

1. **Login Suite** - Authentication flow
2. **Form Suite** - Form interactions and validation
3. **List Suite** - List filtering and item interactions
4. **Profile Suite** - Profile display and settings
5. **Navigation Suite** - Complete app navigation flows

All tests use the Page Object Model pattern and include:
- Automatic screenshots on failure
- Automatic video recording on failure
- Allure report integration
- Cross-platform support (Android & iOS)

## Test Suites

### 1. Login Suite (`tests/specs/login.spec.js`)

**Purpose:** Verify user authentication flow

**Test Cases:**
- Wait for login page to load
- Enter username and password
- Click login button
- Verify navigation to home page
- Verify home page header

**Usage:**
```bash
npm run test:login:pom

# On specific device
npm run test:login:pom "iPhone 16 Pro Simulator"
```

**Expected Results:**
- Login successful with valid credentials
- Home page displays correctly

---

### 2. Form Suite (`tests/specs/form.spec.js`)

**Purpose:** Comprehensive form interaction testing

**Test Cases:**
1. Navigate to Form screen
2. Fill form with valid data (name, email, age, bio)
3. Test switch toggles (notifications, newsletter)
4. Submit form
5. Clear form
6. Fill with minimal data
7. Fill with long text data
8. Test special characters in form fields
9. Navigate back to home

**Page Object:** `FormPage.js`

**Test Data:** `testData.forms`
- `valid` - Standard valid data
- `minimal` - Minimum required fields
- `long` - Long text strings
- `special` - Special characters
- `empty` - Empty form state

**Usage:**
```bash
npm run test:form

# On specific device
node tests/specs/form.spec.js "android-emulator-1"
```

**Expected Results:**
- Form accepts all valid input types
- Switches toggle correctly
- Form submission works
- Clear button resets form
- Back navigation successful

---

### 3. List Suite (`tests/specs/list.spec.js`)

**Purpose:** Test list rendering, filtering, and interactions

**Test Cases:**
1. Navigate to List screen
2. Verify total item count (10 items)
3. Test "All" filter
4. Test "Pending" filter (5 items)
5. Test "In Progress" filter (2 items)
6. Test "Completed" filter (3 items)
7. Test item click interactions
8. Test rapid filter switching
9. Navigate back to home

**Page Object:** `ListPage.js`

**Test Data:** `testData.tasks`
- 10 total items with different statuses
- Expected counts per filter

**Usage:**
```bash
npm run test:list

# On specific device
node tests/specs/list.spec.js "Lenovo 11-inch Tablet"
```

**Expected Results:**
- All 10 items display correctly
- Filters work accurately
- Item counts match expected values
- Item interactions trigger alerts
- Back navigation successful

---

### 4. Profile Suite (`tests/specs/profile.spec.js`)

**Purpose:** Verify profile information and settings

**Test Cases:**
1. Navigate to Profile screen
2. Verify profile data (phone, location, member since)
3. Test "Edit Profile" setting
4. Test "Notifications" setting
5. Test "Privacy" setting
6. Test "Help & Support" setting
7. Test "About" setting
8. Test all settings sequentially
9. Test "Delete Account" confirmation (cancel)
10. Navigate back to home

**Page Object:** `ProfilePage.js`

**Test Data:** `testData.profile`
- Expected profile information

**Usage:**
```bash
npm run test:profile

# On specific device
node tests/specs/profile.spec.js "iphone-16-pro-simulator"
```

**Expected Results:**
- Profile data displays correctly
- All settings are clickable
- Settings trigger appropriate alerts
- Delete account shows confirmation
- Back navigation successful

---

### 5. Navigation Suite (`tests/specs/navigation.spec.js`)

**Purpose:** Test complete app navigation flows

**Test Cases:**
1. Login flow
2. Home → Form → Home
3. Home → List → Home
4. Home → Profile → Home
5. Complete app tour (all screens)
6. Rapid navigation (3 cycles through all screens)
7. Logout flow
8. Re-login after logout

**Page Objects Used:**
- `LoginPage.js`
- `HomePage.js`
- `FormPage.js`
- `ListPage.js`
- `ProfilePage.js`

**Usage:**
```bash
npm run test:navigation

# On specific device
node tests/specs/navigation.spec.js "android-emulator-1"
```

**Expected Results:**
- All navigation paths work correctly
- Back button returns to home
- Rapid navigation doesn't cause errors
- Logout returns to login screen
- Re-login works after logout

---

## Running All Suites

### Sequential Execution (Single Device)

Run all test suites one after another on the default device:

```bash
npm run test:suite:all
```

This runs:
1. Login suite
2. Form suite
3. List suite
4. Profile suite
5. Navigation suite

**Time:** ~5-10 minutes total

### Parallel Execution (Multiple Devices)

Run test suites across multiple devices simultaneously:

```bash
# Run on all registered devices
npm run test:parallel:all tests/specs/login.spec.js

# Run on all iOS devices
npm run test:parallel:ios tests/specs/form.spec.js

# Run on all Android devices
npm run test:parallel:android tests/specs/list.spec.js

# Run on specific devices
node bin/parallel-test.js tests/specs/navigation.spec.js "iPhone 16 Pro" "Pixel 64"
```

---

## Page Objects

All test suites use Page Object Model for maintainability.

### Available Page Objects

**BasePage** (`tests/pages/BasePage.js`)
- Base class with common methods
- Cross-platform element location
- Waiting utilities
- Pause/delay helpers

**LoginPage** (`tests/pages/LoginPage.js`)
- Username/password input
- Login button
- Page verification
- Default credentials helper

**HomePage** (`tests/pages/HomePage.js`)
- Menu item navigation
- Logout button
- Header verification
- Stats display

**FormPage** (`tests/pages/FormPage.js`)
- Text input fields (name, email, age, bio)
- Switch toggles (notifications, newsletter)
- Submit/clear buttons
- Form data getters/setters
- Form verification

**ListPage** (`tests/pages/ListPage.js`)
- Filter buttons (all, pending, in-progress, completed)
- List item getters
- Item count verification
- Filter testing helper

**ProfilePage** (`tests/pages/ProfilePage.js`)
- Profile data getters
- Settings menu items
- Delete account button
- Alert handling
- Settings testing helper

---

## Test Data Management

All test data is centralized in `tests/data/testData.js`.

### Data Categories

**Users:**
```javascript
testData.users.default  // { username: 'demo', password: 'password' }
testData.users.invalid  // Invalid credentials for negative tests
```

**Forms:**
```javascript
testData.forms.valid      // Standard valid form data
testData.forms.minimal    // Minimum required fields
testData.forms.long       // Long text strings
testData.forms.special    // Special characters
testData.forms.empty      // Empty form state
```

**Tasks/Lists:**
```javascript
testData.tasks.all         // All 10 tasks
testData.tasks.pending     // IDs of pending tasks
testData.tasks.inProgress  // IDs of in-progress tasks
testData.tasks.completed   // IDs of completed tasks
```

**Profile:**
```javascript
testData.profile  // Expected profile data
```

**Timeouts:**
```javascript
testData.timeouts.short      // 1s
testData.timeouts.medium     // 3s
testData.timeouts.long       // 5s
testData.timeouts.pageLoad   // 10s
```

---

## Best Practices

### 1. Writing New Tests

```javascript
const TestBase = require('../helpers/TestBase');
const MyPage = require('../pages/MyPage');
const AllureReporter = require('../helpers/AllureReporter');
const testData = require('../data/testData');
const config = require('../../config/test.config');

async function testMyFeature() {
  const testBase = new TestBase();

  try {
    // Add Allure metadata
    AllureReporter.addEpic('My Epic');
    AllureReporter.addFeature('My Feature');
    AllureReporter.addStory('My Story');
    AllureReporter.addSeverity('critical');

    // Run test
    await testBase.runTest(deviceId, appConfig, async () => {
      // Initialize page objects
      const myPage = new MyPage(testBase.driver, testBase.getPlatform());

      // Add device info
      AllureReporter.addDeviceInfo(testBase.device);

      // Test steps with Allure
      await AllureReporter.step('Step description', async () => {
        // Test actions
      });

    }, 'my-test');

    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error.message);
    AllureReporter.attachLog('Error Details', error.stack);
    process.exit(1);
  }
}

testMyFeature();
```

### 2. Adding New Page Objects

```javascript
const BasePage = require('./BasePage');

class MyPage extends BasePage {
  constructor(driver, platform) {
    super(driver, platform);
  }

  // Locators (getters)
  get myElement() {
    return this.findElement('my-element-testID');
  }

  // Actions (async methods)
  async clickMyElement() {
    const element = await this.myElement;
    await element.click();
    console.log('   Clicked my element');
  }

  async waitForPageLoad() {
    await this.waitForElement('my-element-testID', 10000);
    console.log('✅ My page loaded');
  }
}

module.exports = MyPage;
```

### 3. Adding Test Data

```javascript
// In tests/data/testData.js
module.exports = {
  // Add new data category
  myData: {
    valid: {
      field1: 'value1',
      field2: 'value2',
    },
    invalid: {
      field1: '',
      field2: 'bad_value',
    },
  },
};
```

### 4. Error Handling

All tests include:
- Try/catch blocks
- Proper exit codes (0 = success, 1 = failure)
- Error logging to Allure
- Automatic screenshots on failure
- Automatic video recording on failure

---

## CI/CD Integration

### GitHub Actions

Test suites are automatically run on push and PR:

```yaml
- name: Run comprehensive test suite
  run: npm run test:suite:all

- name: Run parallel tests
  run: npm run test:parallel:all tests/specs/login.spec.js
```

### Artifacts

After tests run, the following artifacts are uploaded:
- Screenshots (`screenshots/`)
- Videos (`videos/`)
- Allure report (`allure-report/`)
- Allure results (`allure-results/`)
- Test logs

---

## Troubleshooting

### Test Fails to Find Element

**Problem:** Element not found error

**Solutions:**
1. Check testID in app code matches Page Object
2. Increase wait timeout: `await this.waitForElement('id', 15000)`
3. Add pause before action: `await this.pause(1000)`
4. Verify element is visible: `await element.isDisplayed()`

### Alert Not Dismissing

**Problem:** Alert handling fails

**Solutions:**
```javascript
// Use platform-specific alert handling
if (platform === 'android') {
  await driver.acceptAlert();
} else {
  const okButton = await driver.$('~OK');
  await okButton.click();
}
```

### Test Passes Locally, Fails in CI

**Problem:** Environment differences

**Solutions:**
1. Check app build paths in `.env`
2. Verify devices are registered
3. Increase timeouts for CI: `config.timeouts.pageLoad`
4. Check CI logs for specific errors

### Video/Screenshot Not Captured

**Problem:** No artifacts generated

**Solutions:**
1. Verify config: `VIDEOS_ON_FAILURE=true`
2. Ensure directories exist: `mkdir -p videos screenshots`
3. Check permissions: `chmod 755 videos screenshots`
4. Test failed (not passed) - videos only on failure

---

## Performance Tips

### 1. Optimize Waits

```javascript
// Good - explicit wait with timeout
await this.waitForElement('id', 5000);

// Bad - arbitrary pause
await this.pause(10000);
```

### 2. Reuse Sessions

```javascript
// Use noReset for faster tests
'appium:noReset': true
```

### 3. Parallel Execution

```bash
# Run tests in parallel for 2x+ speed improvement
npm run test:parallel:all tests/specs/login.spec.js
```

### 4. Selective Testing

```bash
# Run only failed tests
npm run test:form  # Just form tests

# Skip slow navigation tests in development
# npm run test:navigation
```

---

## Next Steps

### Expand Test Coverage

1. **Add negative test cases**
   - Invalid form inputs
   - Network errors
   - Permission denials

2. **Add boundary tests**
   - Maximum length inputs
   - Minimum values
   - Edge cases

3. **Add accessibility tests**
   - Screen reader compatibility
   - Color contrast
   - Touch target sizes

4. **Add performance tests**
   - App launch time
   - Screen transition time
   - Memory usage

### Integrate with More Tools

1. **Visual regression testing**
   - Percy or Applitools
   - Screenshot comparison

2. **Performance monitoring**
   - App launch metrics
   - FPS tracking

3. **Cloud device farms**
   - BrowserStack
   - Sauce Labs
   - AWS Device Farm

---

## Resources

- [Appium Documentation](https://appium.io/docs/en/latest/)
- [WebDriverIO Docs](https://webdriver.io/)
- [Page Object Model Pattern](https://martinfowler.com/bliki/PageObject.html)
- [Allure Reports](https://docs.qameta.io/allure/)

---

**Last Updated:** December 2024
**Version:** 2.0.0
