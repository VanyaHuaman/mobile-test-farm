const BasePage = require('./BasePage');

/**
 * UsersPage - Page Object for Users screen (API integration)
 *
 * Represents the Users screen that fetches data from API
 */
class UsersPage extends BasePage {
  constructor(driver, platform) {
    super(driver, platform);
    this.screenTestId = 'users-screen';
  }

  // Selectors - Using accessibilityLabel for cross-platform consistency
  get screenSelector() {
    return { ios: `~${this.screenTestId}`, android: `~${this.screenTestId}` };
  }

  get backButton() {
    return { ios: '~back-button', android: '~back-button' };
  }

  get refreshButton() {
    return { ios: '~refresh-button', android: '~refresh-button' };
  }

  get loadingIndicator() {
    return { ios: '~loading-indicator', android: '~loading-indicator' };
  }

  get errorContainer() {
    return { ios: '~error-container', android: '~error-container' };
  }

  get retryButton() {
    return { ios: '~retry-button', android: '~retry-button' };
  }

  get usersList() {
    return { ios: '~users-list', android: '~users-list' };
  }

  get usersCount() {
    return { ios: '~users-count', android: 'id=users-count' };
  }

  /**
   * Wait for Users screen to be displayed
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForScreen(timeout = 10000) {
    // Try primary screen selector (users-screen for Expo)
    try {
      const screen = await this.getElement(this.screenSelector);
      await screen.waitForDisplayed({ timeout });
    } catch (error) {
      // Fallback: try native Android app selector (users-list-screen)
      const nativeScreen = await this.getElement({
        ios: '~users-list-screen',
        android: '~users-list-screen'
      });
      await nativeScreen.waitForDisplayed({ timeout });
    }
  }

  /**
   * Verify header is displayed
   * @returns {Promise<boolean>}
   */
  async verifyHeader() {
    // Try primary screen selector (users-screen for Expo)
    const isExpoScreen = await this.isDisplayed(this.screenSelector);
    if (isExpoScreen) {
      return true;
    }

    // Fallback: try native Android app selector (users-list-screen)
    const isNativeScreen = await this.isDisplayed({
      ios: '~users-list-screen',
      android: '~users-list-screen'
    });
    return isNativeScreen;
  }

  /**
   * Check if loading indicator is visible
   * @returns {Promise<boolean>}
   */
  async isLoading() {
    try {
      const loading = await this.getElement(this.loadingIndicator);
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
      const error = await this.getElement(this.errorContainer);
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
    const error = await this.getElement(this.errorContainer);
    return await error.getText();
  }

  /**
   * Get users count from header or by counting user items
   * @returns {Promise<number>}
   */
  async getUsersCount() {
    try {
      let text;
      if (this.platform === 'android') {
        // Try to find count text (Expo app)
        try {
          const countElement = await this.driver.$('android=new UiSelector().textContains(" users found")');
          text = await countElement.getText();
          // Extract number from "10 users found"
          const match = text.match(/(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        } catch (error) {
          // Fallback: count user-item elements by checking IDs 1-10 (native Android app)
          let count = 0;
          for (let i = 1; i <= 10; i++) {
            try {
              const userItem = await this.driver.$(`~user-item-${i}`);
              if (await userItem.isDisplayed()) {
                count++;
              }
            } catch (e) {
              // Element doesn't exist, stop counting
              break;
            }
          }
          return count;
        }
      } else {
        // On iOS, use accessibilityLabel
        const countElement = await this.getElement(this.usersCount);
        text = await countElement.getText();
        // Extract number from "10 users found"
        const match = text.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      }
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
    // Try Expo app format first (user-card-X)
    const expoFormat = await this.isDisplayed({
      ios: `~user-card-${userId}`,
      android: `~user-card-${userId}`
    });
    if (expoFormat) {
      return true;
    }

    // Fallback to native Android app format (user-item-X)
    const nativeFormat = await this.isDisplayed({
      ios: `~user-item-${userId}`,
      android: `~user-item-${userId}`
    });
    return nativeFormat;
  }

  /**
   * Get user name by ID
   * @param {number} userId - User ID
   * @returns {Promise<string>}
   */
  async getUserName(userId) {
    const selector = { ios: `~user-name-${userId}`, android: `~user-name-${userId}` };
    const nameElement = await this.getElement(selector);
    return await nameElement.getText();
  }

  /**
   * Get user email by ID
   * @param {number} userId - User ID
   * @returns {Promise<string>}
   */
  async getUserEmail(userId) {
    const selector = { ios: `~user-email-${userId}`, android: `~user-email-${userId}` };
    const emailElement = await this.getElement(selector);
    return await emailElement.getText();
  }

  /**
   * Click back button
   */
  async clickBack() {
    await this.click(this.backButton);
  }

  /**
   * Click refresh button
   */
  async clickRefresh() {
    await this.click(this.refreshButton);
  }

  /**
   * Click retry button (shown on error)
   */
  async clickRetry() {
    await this.click(this.retryButton);
  }

  /**
   * Scroll users list
   * @param {string} direction - 'up' or 'down'
   */
  async scrollList(direction = 'down') {
    const list = await this.getElement(this.usersList);
    await list.scrollIntoView();
  }
}

module.exports = UsersPage;
