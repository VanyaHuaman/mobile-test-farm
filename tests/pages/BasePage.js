const config = require('../../config/test.config');

/**
 * Base Page Object
 *
 * All page objects should extend this class.
 * Provides common functionality for all pages.
 */
class BasePage {
  constructor(driver, platform) {
    this.driver = driver;
    this.platform = platform;
  }

  /**
   * Get element with platform-specific selector
   * @param {Object} selectors - { ios: 'selector', android: 'selector' }
   * @returns {Promise<WebdriverIO.Element>}
   */
  async getElement(selectors) {
    const selector = this.platform === 'ios' ? selectors.ios : selectors.android;
    return await this.driver.$(selector);
  }

  /**
   * Helper method to find element by testID (works with both platforms)
   * Converts a simple string ID to platform-specific accessibility ID selector
   * @param {string} testId - Test ID string
   * @returns {Promise<WebdriverIO.Element>}
   */
  async findElement(testId) {
    const selectors = {
      ios: `~${testId}`,
      android: `~${testId}`,
    };
    return await this.getElement(selectors);
  }

  /**
   * Get multiple elements with platform-specific selector
   * @param {Object} selectors - { ios: 'selector', android: 'selector' }
   * @returns {Promise<WebdriverIO.ElementArray>}
   */
  async getElements(selectors) {
    const selector = this.platform === 'ios' ? selectors.ios : selectors.android;
    return await this.driver.$$(selector);
  }

  /**
   * Wait for element to be displayed
   * @param {Object|string} selectors - Platform-specific selectors object OR simple test ID string
   * @param {number} timeout - Optional timeout (uses config default)
   */
  async waitForElement(selectors, timeout = config.timeouts.explicit) {
    // If selectors is a string, convert it to object format
    if (typeof selectors === 'string') {
      selectors = {
        ios: `~${selectors}`,
        android: `~${selectors}`,
      };
    }
    const element = await this.getElement(selectors);
    await element.waitForDisplayed({ timeout });
    return element;
  }

  /**
   * Click an element
   * @param {Object} selectors - Platform-specific selectors
   */
  async click(selectors) {
    const element = await this.getElement(selectors);
    await element.click();
  }

  /**
   * Enter text into an element
   * @param {Object} selectors - Platform-specific selectors
   * @param {string} text - Text to enter
   */
  async setText(selectors, text) {
    const element = await this.getElement(selectors);
    await element.setValue(text);
  }

  /**
   * Get text from an element
   * @param {Object} selectors - Platform-specific selectors
   * @returns {Promise<string>}
   */
  async getText(selectors) {
    const element = await this.getElement(selectors);
    return await element.getText();
  }

  /**
   * Check if element is displayed
   * @param {Object} selectors - Platform-specific selectors
   * @returns {Promise<boolean>}
   */
  async isDisplayed(selectors) {
    try {
      const element = await this.getElement(selectors);
      return await element.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for a specific amount of time
   * @param {number} ms - Milliseconds to wait
   */
  async pause(ms) {
    await this.driver.pause(ms);
  }

  /**
   * Scroll to element (if needed)
   * @param {Object} selectors - Platform-specific selectors
   */
  async scrollToElement(selectors) {
    const element = await this.getElement(selectors);
    await element.scrollIntoView();
  }

  /**
   * Take a screenshot
   * @param {string} filename - Screenshot filename
   * @returns {Promise<string>} - Path to screenshot
   */
  async takeScreenshot(filename) {
    const fs = require('fs');
    const path = require('path');

    // Ensure screenshots directory exists
    const screenshotDir = config.screenshots.path;
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(screenshotDir, `${filename}-${timestamp}.png`);

    await this.driver.saveScreenshot(screenshotPath);
    return screenshotPath;
  }

  /**
   * Get current page source (useful for debugging)
   * @returns {Promise<string>}
   */
  async getPageSource() {
    return await this.driver.getPageSource();
  }
}

module.exports = BasePage;
