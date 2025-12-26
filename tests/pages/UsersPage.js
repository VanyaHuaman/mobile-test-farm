const BasePage = require('./BasePage');

/**
 * UsersPage - Page Object for Users screen (API integration)
 *
 * Represents the Users screen that fetches data from API
 */
class UsersPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.screenTestId = 'users-screen';
  }

  // Selectors
  get screenSelector() {
    return `~${this.screenTestId}`;
  }

  get backButton() {
    return '~back-button';
  }

  get refreshButton() {
    return '~refresh-button';
  }

  get loadingIndicator() {
    return '~loading-indicator';
  }

  get errorContainer() {
    return '~error-container';
  }

  get retryButton() {
    return '~retry-button';
  }

  get usersList() {
    return '~users-list';
  }

  get usersCount() {
    return '~users-count';
  }

  /**
   * Wait for Users screen to be displayed
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForScreen(timeout = 10000) {
    const screen = await this.driver.$(this.screenSelector);
    await screen.waitForDisplayed({ timeout });
  }

  /**
   * Verify header is displayed
   * @returns {Promise<boolean>}
   */
  async verifyHeader() {
    const screen = await this.driver.$(this.screenSelector);
    return await screen.isDisplayed();
  }

  /**
   * Check if loading indicator is visible
   * @returns {Promise<boolean>}
   */
  async isLoading() {
    try {
      const loading = await this.driver.$(this.loadingIndicator);
      return await loading.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if error container is visible
   * @returns {Promise<boolean>}
   */
  async hasError() {
    try {
      const error = await this.driver.$(this.errorContainer);
      return await error.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get error message text
   * @returns {Promise<string>}
   */
  async getErrorMessage() {
    const error = await this.driver.$(this.errorContainer);
    return await error.getText();
  }

  /**
   * Get users count from header
   * @returns {Promise<number>}
   */
  async getUsersCount() {
    try {
      const countElement = await this.driver.$(this.usersCount);
      const text = await countElement.getText();
      // Extract number from "10 users found"
      const match = text.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    } catch (error) {
      console.error('Error getting users count:', error.message);
      return 0;
    }
  }

  /**
   * Verify user card exists
   * @param {number} userId - User ID
   * @returns {Promise<boolean>}
   */
  async verifyUserCard(userId) {
    try {
      const card = await this.driver.$(`~user-card-${userId}`);
      return await card.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user name by ID
   * @param {number} userId - User ID
   * @returns {Promise<string>}
   */
  async getUserName(userId) {
    const nameElement = await this.driver.$(`~user-name-${userId}`);
    return await nameElement.getText();
  }

  /**
   * Get user email by ID
   * @param {number} userId - User ID
   * @returns {Promise<string>}
   */
  async getUserEmail(userId) {
    const emailElement = await this.driver.$(`~user-email-${userId}`);
    return await emailElement.getText();
  }

  /**
   * Click back button
   */
  async clickBack() {
    await this.clickElement(this.backButton);
  }

  /**
   * Click refresh button
   */
  async clickRefresh() {
    await this.clickElement(this.refreshButton);
  }

  /**
   * Click retry button (shown on error)
   */
  async clickRetry() {
    await this.clickElement(this.retryButton);
  }

  /**
   * Scroll users list
   * @param {string} direction - 'up' or 'down'
   */
  async scrollList(direction = 'down') {
    const list = await this.driver.$(this.usersList);
    await this.scrollElement(list, direction);
  }
}

module.exports = UsersPage;
