# Writing Tests Guide

This guide will help you write automated tests for your mobile applications.

## Test Structure

Tests are organized by platform in the `tests/` directory:

```
tests/
├── android/          # Android-specific tests
├── ios/              # iOS-specific tests
└── common/           # Shared code
    ├── page_objects/ # Page Object Models
    └── utilities/    # Helper functions
```

## Example Test: Login Flow

### Android Test (tests/android/test_login.py)

```python
import pytest
from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TestLogin:
    """Test login functionality on Android"""

    @pytest.fixture
    def driver(self):
        """Setup Appium driver"""
        options = UiAutomator2Options()
        options.platform_name = "Android"
        options.automation_name = "UiAutomator2"
        options.device_name = "Android Device"
        options.app_package = "com.example.app"
        options.app_activity = ".MainActivity"
        options.no_reset = True

        driver = webdriver.Remote(
            "http://appium-android:4723",
            options=options
        )

        yield driver
        driver.quit()

    def test_successful_login(self, driver):
        """Test login with valid credentials"""
        wait = WebDriverWait(driver, 10)

        # Find and fill username
        username = wait.until(
            EC.presence_of_element_located(
                (AppiumBy.ID, "com.example.app:id/username")
            )
        )
        username.send_keys("testuser@example.com")

        # Find and fill password
        password = driver.find_element(
            AppiumBy.ID, "com.example.app:id/password"
        )
        password.send_keys("password123")

        # Click login button
        login_btn = driver.find_element(
            AppiumBy.ID, "com.example.app:id/login_button"
        )
        login_btn.click()

        # Verify successful login
        success_element = wait.until(
            EC.presence_of_element_located(
                (AppiumBy.ID, "com.example.app:id/home_screen")
            )
        )
        assert success_element.is_displayed()

    def test_invalid_login(self, driver):
        """Test login with invalid credentials"""
        wait = WebDriverWait(driver, 10)

        username = wait.until(
            EC.presence_of_element_located(
                (AppiumBy.ID, "com.example.app:id/username")
            )
        )
        username.send_keys("invalid@example.com")

        password = driver.find_element(
            AppiumBy.ID, "com.example.app:id/password"
        )
        password.send_keys("wrongpassword")

        login_btn = driver.find_element(
            AppiumBy.ID, "com.example.app:id/login_button"
        )
        login_btn.click()

        # Verify error message
        error = wait.until(
            EC.presence_of_element_located(
                (AppiumBy.ID, "com.example.app:id/error_message")
            )
        )
        assert "Invalid credentials" in error.text
```

### iOS Test (tests/ios/test_login.py)

```python
import pytest
from appium import webdriver
from appium.options.ios import XCUITestOptions
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TestLogin:
    """Test login functionality on iOS"""

    @pytest.fixture
    def driver(self):
        """Setup Appium driver"""
        options = XCUITestOptions()
        options.platform_name = "iOS"
        options.automation_name = "XCUITest"
        options.device_name = "iPhone SE"
        options.bundle_id = "com.example.app"
        options.no_reset = True

        driver = webdriver.Remote(
            "http://localhost:4724",
            options=options
        )

        yield driver
        driver.quit()

    def test_successful_login(self, driver):
        """Test login with valid credentials"""
        wait = WebDriverWait(driver, 10)

        # Find and fill username
        username = wait.until(
            EC.presence_of_element_located(
                (AppiumBy.ACCESSIBILITY_ID, "username_field")
            )
        )
        username.send_keys("testuser@example.com")

        # Find and fill password
        password = driver.find_element(
            AppiumBy.ACCESSIBILITY_ID, "password_field"
        )
        password.send_keys("password123")

        # Click login button
        login_btn = driver.find_element(
            AppiumBy.ACCESSIBILITY_ID, "login_button"
        )
        login_btn.click()

        # Verify successful login
        success_element = wait.until(
            EC.presence_of_element_located(
                (AppiumBy.ACCESSIBILITY_ID, "home_screen")
            )
        )
        assert success_element.is_displayed()
```

## Page Object Model Pattern

For better test organization, use Page Object Model:

### tests/common/page_objects/login_page.py

```python
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class LoginPage:
    """Page object for login screen"""

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    def enter_username(self, username):
        """Enter username"""
        # Try Android locator first
        try:
            element = self.wait.until(
                EC.presence_of_element_located(
                    (AppiumBy.ID, "com.example.app:id/username")
                )
            )
        except:
            # Fall back to iOS locator
            element = self.wait.until(
                EC.presence_of_element_located(
                    (AppiumBy.ACCESSIBILITY_ID, "username_field")
                )
            )
        element.clear()
        element.send_keys(username)
        return self

    def enter_password(self, password):
        """Enter password"""
        try:
            element = self.driver.find_element(
                AppiumBy.ID, "com.example.app:id/password"
            )
        except:
            element = self.driver.find_element(
                AppiumBy.ACCESSIBILITY_ID, "password_field"
            )
        element.clear()
        element.send_keys(password)
        return self

    def tap_login(self):
        """Tap login button"""
        try:
            button = self.driver.find_element(
                AppiumBy.ID, "com.example.app:id/login_button"
            )
        except:
            button = self.driver.find_element(
                AppiumBy.ACCESSIBILITY_ID, "login_button"
            )
        button.click()
        return self

    def is_error_displayed(self):
        """Check if error message is displayed"""
        try:
            error = self.driver.find_element(
                AppiumBy.ID, "com.example.app:id/error_message"
            )
            return error.is_displayed()
        except:
            return False

    def login(self, username, password):
        """Complete login flow"""
        self.enter_username(username)
        self.enter_password(password)
        self.tap_login()
        return self
```

### Using Page Objects in Tests

```python
from tests.common.page_objects.login_page import LoginPage


def test_login_with_page_object(driver):
    """Test using Page Object Model"""
    login_page = LoginPage(driver)
    login_page.login("user@example.com", "password123")

    # Verify success
    # ... assertions here
```

## Common Utilities

### tests/common/utilities/helpers.py

```python
import time
from pathlib import Path


def take_screenshot(driver, name):
    """Take screenshot and save to results"""
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    filename = f"{name}_{timestamp}.png"
    filepath = Path("/app/results/screenshots") / filename

    driver.save_screenshot(str(filepath))
    print(f"Screenshot saved: {filepath}")
    return filepath


def wait_for_element(driver, locator, timeout=10):
    """Wait for element to be present"""
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC

    return WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located(locator)
    )


def scroll_to_element(driver, element):
    """Scroll element into view"""
    driver.execute_script(
        "mobile: scroll",
        {"element": element, "toVisible": True}
    )


def hide_keyboard(driver):
    """Hide keyboard if visible"""
    try:
        driver.hide_keyboard()
    except:
        pass  # Keyboard not visible
```

## Running Tests

### Run specific test file:

```bash
pytest tests/android/test_login.py -v
```

### Run all Android tests:

```bash
pytest tests/android/ -v
```

### Run all tests:

```bash
pytest tests/ -v
```

### Run with HTML report:

```bash
pytest tests/ --html=results/reports/report.html --self-contained-html
```

### Run specific test:

```bash
pytest tests/android/test_login.py::TestLogin::test_successful_login -v
```

## Element Locator Strategies

### Android

1. **Resource ID** (preferred):
   ```python
   AppiumBy.ID, "com.example.app:id/element_id"
   ```

2. **XPath**:
   ```python
   AppiumBy.XPATH, "//android.widget.Button[@text='Login']"
   ```

3. **Accessibility ID**:
   ```python
   AppiumBy.ACCESSIBILITY_ID, "login_button"
   ```

4. **Class Name**:
   ```python
   AppiumBy.CLASS_NAME, "android.widget.Button"
   ```

5. **Text**:
   ```python
   AppiumBy.ANDROID_UIAUTOMATOR, 'new UiSelector().text("Login")'
   ```

### iOS

1. **Accessibility ID** (preferred):
   ```python
   AppiumBy.ACCESSIBILITY_ID, "login_button"
   ```

2. **XPath**:
   ```python
   AppiumBy.XPATH, "//XCUIElementTypeButton[@name='Login']"
   ```

3. **Predicate String**:
   ```python
   AppiumBy.IOS_PREDICATE, "name == 'Login'"
   ```

4. **Class Chain**:
   ```python
   AppiumBy.IOS_CLASS_CHAIN, "**/XCUIElementTypeButton[`name == 'Login'`]"
   ```

## Best Practices

### 1. Use Explicit Waits

```python
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

wait = WebDriverWait(driver, 10)
element = wait.until(
    EC.presence_of_element_located((AppiumBy.ID, "element_id"))
)
```

### 2. Handle Dynamic Elements

```python
# Wait for element to be clickable
element = wait.until(
    EC.element_to_be_clickable((AppiumBy.ID, "button_id"))
)
```

### 3. Use Fixtures for Setup/Teardown

```python
@pytest.fixture(scope="function")
def driver():
    # Setup
    driver = create_driver()
    yield driver
    # Teardown
    driver.quit()
```

### 4. Take Screenshots on Failure

```python
@pytest.fixture(autouse=True)
def screenshot_on_failure(request, driver):
    yield
    if request.node.rep_call.failed:
        take_screenshot(driver, request.node.name)
```

### 5. Organize Tests by Feature

```
tests/android/
├── test_login.py
├── test_registration.py
├── test_checkout.py
└── test_profile.py
```

### 6. Use Descriptive Test Names

```python
def test_user_can_login_with_valid_credentials():
    # Good: descriptive name

def test_login():
    # Bad: too vague
```

### 7. Keep Tests Independent

Each test should be able to run independently and in any order.

### 8. Use Parameterized Tests

```python
@pytest.mark.parametrize("username,password,expected", [
    ("valid@email.com", "valid123", "success"),
    ("invalid@email.com", "wrong", "error"),
    ("", "password", "error"),
])
def test_login_scenarios(driver, username, password, expected):
    # Test different scenarios
    pass
```

## Finding Element Locators

### Appium Inspector

1. Start Appium Desktop or Appium Inspector
2. Connect to your Appium server
3. Set desired capabilities
4. Start session
5. Inspect elements to find locators

### Android: UI Automator Viewer

```bash
# On device, enable "Show taps" and "Pointer location" in Developer Options
# Capture UI hierarchy
adb shell uiautomator dump
adb pull /sdcard/window_dump.xml
# Open with UI Automator Viewer (part of Android SDK)
```

### iOS: Accessibility Inspector

Part of Xcode tools, helps identify accessibility IDs.

## Troubleshooting

### Element not found

1. Add explicit wait
2. Check if element is in a different context (WebView vs Native)
3. Verify correct locator strategy
4. Check if element is visible on screen

### Stale element reference

Element reference is lost. Re-find the element:

```python
element = driver.find_element(AppiumBy.ID, "element_id")
element.click()
# If you need to interact again, re-find:
element = driver.find_element(AppiumBy.ID, "element_id")
element.send_keys("text")
```

### Tests are slow

1. Disable animations in device settings
2. Use more specific locators
3. Reduce wait times where safe
4. Run tests in parallel

## Next Steps

1. Write your first test based on the examples
2. Create page objects for your app screens
3. Set up pytest configuration
4. Integrate with CI/CD pipeline
5. Add reporting and notifications

## Resources

- [Appium Documentation](http://appium.io/docs/en/latest/)
- [Selenium Python Bindings](https://selenium-python.readthedocs.io/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Page Object Model](https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/)
