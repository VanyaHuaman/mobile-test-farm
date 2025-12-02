"""
Pytest configuration and shared fixtures for mobile tests

This file provides common fixtures and configuration used across
all test files.
"""

import pytest
import requests
from pathlib import Path


# API Configuration
MOCKOON_URL = "http://mockoon:3000"
MITMPROXY_URL = "http://mitmproxy:8080"
APPIUM_ANDROID_URL = "http://appium-android:4723"
APPIUM_IOS_URL = "http://localhost:4724"


def pytest_addoption(parser):
    """Add custom command line options"""
    parser.addoption(
        "--api-mode",
        action="store",
        default="mock",
        help="API mode: mock, proxy, or real"
    )
    parser.addoption(
        "--mock-scenario",
        action="store",
        default="default",
        help="Mock scenario to use (for conditional mocking)"
    )
    parser.addoption(
        "--device-udid",
        action="store",
        default=None,
        help="Specific device UDID to use"
    )


@pytest.fixture(scope="session")
def api_mode(request):
    """Get the API mode from command line"""
    return request.config.getoption("--api-mode")


@pytest.fixture(scope="session")
def mock_scenario(request):
    """Get the mock scenario from command line"""
    return request.config.getoption("--mock-scenario")


@pytest.fixture(scope="session")
def mockoon_url():
    """Mockoon base URL"""
    return MOCKOON_URL


@pytest.fixture(scope="session")
def verify_mockoon():
    """Verify Mockoon is accessible"""
    try:
        response = requests.get(f"{MOCKOON_URL}/api/v1/products", timeout=5)
        return response.status_code == 200
    except:
        return False


@pytest.fixture(scope="session")
def verify_mitmproxy():
    """Verify mitmproxy is accessible"""
    try:
        response = requests.get("http://mitmproxy:8081", timeout=5)
        return response.ok
    except:
        return False


@pytest.fixture
def proxy_config(api_mode, mock_scenario):
    """
    Proxy configuration based on API mode

    Returns None if not using proxy, otherwise returns proxy dict
    """
    if api_mode == "proxy":
        config = {
            "proxyType": "manual",
            "httpProxy": "mitmproxy:8080",
            "sslProxy": "mitmproxy:8080"
        }

        # Add scenario header if specified
        if mock_scenario != "default":
            config["headers"] = {
                "X-Test-Scenario": mock_scenario
            }

        return config

    return None


@pytest.fixture
def api_base_url(api_mode, mockoon_url):
    """
    Get base URL for API based on mode

    - mock: Direct to Mockoon
    - proxy: Through mitmproxy (routes to mock or real)
    - real: Direct to real API
    """
    if api_mode == "mock":
        return mockoon_url
    elif api_mode == "proxy":
        # When using proxy, app should use real API URL
        # mitmproxy will route appropriately
        return "https://api.example.com"  # Replace with your real API
    elif api_mode == "real":
        return "https://api.example.com"  # Replace with your real API
    else:
        raise ValueError(f"Unknown api_mode: {api_mode}")


@pytest.fixture(autouse=True)
def screenshot_on_failure(request):
    """
    Automatically take screenshot on test failure

    This fixture runs for every test and captures a screenshot
    if the test fails.
    """
    yield

    # Check if test failed
    if hasattr(request.node, 'rep_call') and request.node.rep_call.failed:
        # Get driver from test if it exists
        if 'driver' in request.fixturenames:
            driver = request.getfixturevalue('driver')

            # Generate screenshot filename
            test_name = request.node.name
            screenshot_path = Path("/app/results/screenshots") / f"{test_name}_failure.png"
            screenshot_path.parent.mkdir(parents=True, exist_ok=True)

            try:
                driver.save_screenshot(str(screenshot_path))
                print(f"\nScreenshot saved: {screenshot_path}")
            except Exception as e:
                print(f"\nFailed to capture screenshot: {e}")


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """
    Hook to capture test results for screenshot_on_failure

    This makes the test result available to fixtures
    """
    outcome = yield
    rep = outcome.get_result()

    # Store result in the item for use by fixtures
    setattr(item, f"rep_{rep.when}", rep)


@pytest.fixture
def mock_api_client(mockoon_url):
    """
    Simple client for interacting with mock API

    Useful for verifying mock responses before running UI tests
    """
    class MockAPIClient:
        def __init__(self, base_url):
            self.base_url = base_url

        def get(self, endpoint):
            response = requests.get(f"{self.base_url}{endpoint}")
            response.raise_for_status()
            return response.json()

        def post(self, endpoint, data):
            response = requests.post(
                f"{self.base_url}{endpoint}",
                json=data
            )
            response.raise_for_status()
            return response.json()

        def verify_endpoint(self, endpoint, expected_status=200):
            response = requests.get(f"{self.base_url}{endpoint}")
            return response.status_code == expected_status

    return MockAPIClient(mockoon_url)


# Example usage in tests:
#
# def test_example(mock_api_client):
#     # Verify mock is working
#     data = mock_api_client.get("/api/v1/products")
#     assert len(data["products"]) > 0
#
#     # Now run UI test knowing the mock works
