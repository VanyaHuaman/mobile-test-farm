const BasePage = require('./BasePage');
const config = require('../../config/test.config');

/**
 * Home Page Object
 *
 * Represents the home screen after successful login.
 */
class HomePage extends BasePage {
  constructor(driver, platform) {
    super(driver, platform);
  }

  /**
   * Selectors for home page elements
   */
  get selectors() {
    return {
      headerTitle: {
        ios: '-ios predicate string:label == "Home Dashboard"',
        android: 'android=new UiSelector().textContains("Home Dashboard")',
      },
      headerSubtitle: {
        ios: '-ios predicate string:label == "Welcome to the test app!"',
        android: 'android=new UiSelector().text("Welcome to the test app!")',
      },
      formMenuItem: {
        ios: '~menu-item-form',
        android: '~menu-item-form',
      },
      listMenuItem: {
        ios: '~menu-item-list',
        android: '~menu-item-list',
      },
      profileMenuItem: {
        ios: '~menu-item-profile',
        android: '~menu-item-profile',
      },
      logoutButton: {
        ios: '~logout-button',
        android: '~logout-button',
      },
    };
  }

  /**
   * Wait for home page to load
   * @param {number} timeout - Optional timeout
   */
  async waitForPageLoad(timeout = config.timeouts.explicit) {
    console.log('⏳ Waiting for home screen...');
    await this.waitForElement(this.selectors.headerTitle, timeout);
    console.log('✅ Home screen loaded');
  }

  /**
   * Check if home page is displayed
   * @returns {Promise<boolean>}
   */
  async isHomePageDisplayed() {
    return await this.isDisplayed(this.selectors.headerTitle);
  }

  /**
   * Get header title text
   * @returns {Promise<string>}
   */
  async getHeaderTitle() {
    return await this.getText(this.selectors.headerTitle);
  }

  /**
   * Navigate to Form screen
   */
  async navigateToForm() {
    console.log('📝 Navigating to Form screen');
    await this.click(this.selectors.formMenuItem);
  }

  /**
   * Navigate to List screen
   */
  async navigateToList() {
    console.log('📋 Navigating to List screen');
    await this.click(this.selectors.listMenuItem);
  }

  /**
   * Navigate to Profile screen
   */
  async navigateToProfile() {
    console.log('👤 Navigating to Profile screen');
    await this.click(this.selectors.profileMenuItem);
  }

  /**
   * Click logout button
   */
  async logout() {
    console.log('🚪 Logging out');
    await this.click(this.selectors.logoutButton);
  }

  /**
   * Verify user is on home page
   * @throws {Error} If not on home page
   */
  async verifyOnHomePage() {
    const isDisplayed = await this.isHomePageDisplayed();
    if (!isDisplayed) {
      throw new Error('Not on home page');
    }
    console.log('✅ Verified on home page');
  }
}

module.exports = HomePage;
