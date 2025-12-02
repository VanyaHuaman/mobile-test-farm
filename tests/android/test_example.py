"""
Example Android test

This is a template test file. Update with your actual app details.
"""

import pytest
from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


@pytest.fixture
def driver():
    """Setup Appium driver for Android"""
    options = UiAutomator2Options()
    options.platform_name = "Android"
    options.automation_name = "UiAutomator2"
    options.device_name = "Android Device"

    # TODO: Update with your app details
    # options.app_package = "com.example.yourapp"
    # options.app_activity = ".MainActivity"

    # For testing browser
    options.browser_name = "Chrome"

    options.no_reset = True
    options.new_command_timeout = 300

    driver = webdriver.Remote(
        "http://appium-android:4723",
        options=options
    )

    yield driver
    driver.quit()


def test_example(driver):
    """Example test - opens Google"""
    driver.get("https://www.google.com")

    wait = WebDriverWait(driver, 10)

    # Wait for search box
    search_box = wait.until(
        EC.presence_of_element_located(
            (AppiumBy.NAME, "q")
        )
    )

    # Type search query
    search_box.send_keys("Appium mobile testing")

    # Find and click search button
    search_box.submit()

    # Wait for results
    wait.until(
        EC.presence_of_element_located(
            (AppiumBy.ID, "search")
        )
    )

    assert "Appium" in driver.title
