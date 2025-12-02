"""
Example iOS test

This is a template test file. Update with your actual app details.
"""

import pytest
from appium import webdriver
from appium.options.ios import XCUITestOptions
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


@pytest.fixture
def driver():
    """Setup Appium driver for iOS"""
    options = XCUITestOptions()
    options.platform_name = "iOS"
    options.automation_name = "XCUITest"
    options.device_name = "iPhone SE"

    # TODO: Update with your app details
    # options.bundle_id = "com.example.yourapp"

    # For testing Safari browser
    options.browser_name = "Safari"

    options.no_reset = True
    options.new_command_timeout = 300

    driver = webdriver.Remote(
        "http://localhost:4724",
        options=options
    )

    yield driver
    driver.quit()


def test_example(driver):
    """Example test - opens Apple website"""
    driver.get("https://www.apple.com")

    wait = WebDriverWait(driver, 10)

    # Wait for page to load
    wait.until(
        EC.presence_of_element_located(
            (AppiumBy.TAG_NAME, "body")
        )
    )

    assert "Apple" in driver.title
