"""
Example Android test using mocked APIs

This demonstrates different approaches to testing with mocks:
1. Direct Mockoon access (no proxy)
2. Via mitmproxy with routing
3. Conditional mocking with headers
"""

import pytest
from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import requests


@pytest.fixture
def mockoon_url():
    """Direct Mockoon URL"""
    return "http://mockoon:3000"


@pytest.fixture
def proxy_config():
    """mitmproxy configuration"""
    return {
        "proxyType": "manual",
        "httpProxy": "mitmproxy:8080",
        "sslProxy": "mitmproxy:8080"
    }


@pytest.fixture
def driver_direct_mock():
    """
    Driver configured to use Mockoon directly (no proxy)
    Fastest option, full control
    """
    options = UiAutomator2Options()
    options.platform_name = "Android"
    options.automation_name = "UiAutomator2"
    options.device_name = "Android Device"

    # Configure app to use Mockoon URL
    # This assumes your app supports API URL configuration
    options.set_capability("appActivity", ".MainActivity")
    options.set_capability("optionalIntentArguments",
                          "--es api_url http://mockoon:3000")

    options.no_reset = True
    options.new_command_timeout = 300

    driver = webdriver.Remote(
        "http://appium-android:4723",
        options=options
    )

    yield driver
    driver.quit()


@pytest.fixture
def driver_with_proxy(proxy_config):
    """
    Driver configured to use mitmproxy
    Allows selective mocking and recording
    """
    options = UiAutomator2Options()
    options.platform_name = "Android"
    options.automation_name = "UiAutomator2"
    options.device_name = "Android Device"

    # Set proxy
    options.set_capability("proxy", proxy_config)

    options.no_reset = True
    options.new_command_timeout = 300

    driver = webdriver.Remote(
        "http://appium-android:4723",
        options=options
    )

    yield driver
    driver.quit()


class TestDirectMock:
    """Tests using direct Mockoon access"""

    def test_verify_mock_endpoint(self, mockoon_url):
        """Verify Mockoon is responding correctly"""
        response = requests.get(f"{mockoon_url}/api/v1/products")

        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        assert len(data["products"]) == 10  # As configured in mock

    def test_login_with_mock(self, driver_direct_mock):
        """
        Test login flow using mocked API

        This assumes:
        - App is configured to use Mockoon URL
        - Mockoon has /api/v1/auth/login endpoint
        - App UI elements are accessible
        """
        wait = WebDriverWait(driver_direct_mock, 10)

        # Navigate to login (adjust selectors for your app)
        # This is a placeholder - replace with your app's actual UI
        email_field = wait.until(
            EC.presence_of_element_located(
                (AppiumBy.ACCESSIBILITY_ID, "email_input")
            )
        )
        email_field.send_keys("test@example.com")

        password_field = driver_direct_mock.find_element(
            AppiumBy.ACCESSIBILITY_ID, "password_input"
        )
        password_field.send_keys("any_password")  # Mock accepts anything

        login_button = driver_direct_mock.find_element(
            AppiumBy.ACCESSIBILITY_ID, "login_button"
        )
        login_button.click()

        # Verify successful login
        # Mock returns success with fake user data
        success_indicator = wait.until(
            EC.presence_of_element_located(
                (AppiumBy.ACCESSIBILITY_ID, "home_screen")
            )
        )
        assert success_indicator.is_displayed()


class TestProxyMock:
    """Tests using mitmproxy for selective mocking"""

    def test_mixed_real_and_mock(self, driver_with_proxy):
        """
        Test using both real and mock APIs

        Based on route_to_mockoon.py:
        - /api/v1/auth/* → mocked
        - /api/v1/products → mocked
        - Other endpoints → real API
        """
        wait = WebDriverWait(driver_with_proxy, 10)

        # Login uses mock (fast, reliable)
        # Implementation depends on your app

        # Then check products (also mocked)
        # Returns fake products from Mockoon

        # Other features use real API
        pass

    def test_with_conditional_header(self, driver_with_proxy):
        """
        Test using conditional mocking via headers

        Requires conditional_mock.py script in mitmproxy
        """
        # This is conceptual - actual implementation depends on
        # whether your app can set custom headers

        # In a web view or API client that supports it:
        # headers = {"X-Mock-Mode": "mock"}

        # All requests will be routed to Mockoon
        pass


class TestErrorScenarios:
    """Test error handling with mocked error responses"""

    def test_unauthorized_error(self, driver_direct_mock, mockoon_url):
        """Test handling of 401 Unauthorized"""

        # Mockoon has a test endpoint that returns 401
        response = requests.get(f"{mockoon_url}/api/v1/test/unauthorized")
        assert response.status_code == 401

        # Now test app handles it correctly
        # (implementation depends on your app)

    def test_server_error(self, driver_direct_mock, mockoon_url):
        """Test handling of 500 Server Error"""

        # Mockoon has test endpoint for 500
        response = requests.get(f"{mockoon_url}/api/v1/test/servererror")
        assert response.status_code == 500

        # Verify app shows appropriate error message
        # (implementation depends on your app)

    def test_slow_network(self, driver_direct_mock):
        """Test app behavior with slow responses"""

        # Mockoon can be configured with latency
        # Mock should have endpoint with 5000ms latency

        # Test app shows loading indicator
        # Test app doesn't crash on timeout
        pass


class TestDataVariety:
    """Test with varied mock data"""

    def test_product_list_rendering(self, driver_direct_mock, mockoon_url):
        """
        Test product list with Faker.js generated data

        Each test run gets different fake data
        """
        # Get mock data
        response = requests.get(f"{mockoon_url}/api/v1/products")
        products = response.json()["products"]

        # Verify structure
        assert len(products) > 0

        first_product = products[0]
        assert "id" in first_product
        assert "name" in first_product
        assert "price" in first_product

        # Each run will have different values thanks to Faker.js
        print(f"Testing with product: {first_product['name']}")

    def test_user_profile(self, driver_direct_mock, mockoon_url):
        """Test profile screen with fake user data"""

        response = requests.get(f"{mockoon_url}/api/v1/user/profile")
        user = response.json()

        # Verify structure
        assert "firstName" in user
        assert "email" in user
        assert "address" in user

        # Test app can display various data formats
        print(f"Testing with user: {user['firstName']} {user['email']}")


@pytest.mark.parametrize("scenario", [
    "success",
    "invalid_credentials",
    "server_error"
])
def test_login_scenarios(scenario, mockoon_url):
    """
    Test different login scenarios

    This demonstrates how to test multiple scenarios
    by calling different mock endpoints or using response rules
    """

    if scenario == "success":
        # Call normal login endpoint
        response = requests.post(
            f"{mockoon_url}/api/v1/auth/login",
            json={"email": "test@test.com", "password": "correct"}
        )
        assert response.status_code == 200
        assert "token" in response.json()

    elif scenario == "invalid_credentials":
        # Mockoon response rules can return different responses
        response = requests.post(
            f"{mockoon_url}/api/v1/auth/login",
            json={"email": "test@test.com", "password": "wrong"}
        )
        assert response.status_code == 401

    elif scenario == "server_error":
        # Use test endpoint
        response = requests.get(f"{mockoon_url}/api/v1/test/servererror")
        assert response.status_code == 500


# Utility functions

def verify_mock_data_structure(data, expected_fields):
    """Helper to verify mock data has expected structure"""
    for field in expected_fields:
        assert field in data, f"Missing field: {field}"


def get_mock_response(endpoint, mockoon_url="http://mockoon:3000"):
    """Helper to get data from mock API"""
    response = requests.get(f"{mockoon_url}{endpoint}")
    response.raise_for_status()
    return response.json()
