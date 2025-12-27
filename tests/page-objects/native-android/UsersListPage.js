const BasePage = require('../BasePage');

/**
 * Users List Page Object for Native Android Compose App
 */
class NativeUsersListPage extends BasePage {
  get selectors() {
    return {
      screen: {
        android: '~users-list-screen',
      },
      title: {
        android: '~users-title',
      },
      usersList: {
        android: '~users-list',
      },
      loadingIndicator: {
        android: '~loading-indicator',
      },
      errorMessage: {
        android: '~error-message',
      },
      retryButton: {
        android: '~retry-button',
      },
    };
  }

  /**
   * Get user item selector by ID
   * @param {number} userId
   */
  getUserItemSelector(userId) {
    return {
      android: `~user-item-${userId}`,
    };
  }

  /**
   * Get user name selector by ID
   * @param {number} userId
   */
  getUserNameSelector(userId) {
    return {
      android: `~user-name-${userId}`,
    };
  }

  /**
   * Get user email selector by ID
   * @param {number} userId
   */
  getUserEmailSelector(userId) {
    return {
      android: `~user-email-${userId}`,
    };
  }

  async waitForUsersListScreen() {
    await this.waitForElement(this.selectors.screen);
    console.log('✅ Users list screen displayed');
  }

  async waitForUsersToLoad(timeout = 10000) {
    // Wait for loading indicator to disappear
    try {
      const loadingIndicator = await this.getElement(this.selectors.loadingIndicator);
      await loadingIndicator.waitForDisplayed({ timeout: 5000 });
      await loadingIndicator.waitForDisplayed({ timeout, reverse: true });
      console.log('✓ Users loaded');
    } catch (error) {
      // Loading indicator might not appear if data loads quickly
      console.log('✓ Users loaded (no loading indicator)');
    }
  }

  async getUserCount() {
    // Count user items in the list
    const userItems = await this.driver.$$('android=new UiSelector().resourceIdMatches(".*user-item-.*")');
    const count = userItems.length;
    console.log(`✓ Found ${count} users in list`);
    return count;
  }

  async getUserName(userId) {
    const selector = this.getUserNameSelector(userId);
    return await this.getText(selector);
  }

  async getUserEmail(userId) {
    const selector = this.getUserEmailSelector(userId);
    return await this.getText(selector);
  }

  async clickUserItem(userId) {
    const selector = this.getUserItemSelector(userId);
    await this.click(selector);
    console.log(`✓ Clicked user item ${userId}`);
  }

  async verifyUserExists(userId) {
    const selector = this.getUserItemSelector(userId);
    const isDisplayed = await this.isDisplayed(selector);
    if (!isDisplayed) {
      throw new Error(`User ${userId} not found in list`);
    }
    console.log(`✅ User ${userId} exists in list`);
  }

  async getErrorMessage() {
    try {
      return await this.getText(this.selectors.errorMessage);
    } catch (error) {
      return null;
    }
  }

  async clickRetry() {
    await this.click(this.selectors.retryButton);
    console.log('✓ Clicked retry button');
  }

  async verifyErrorState(expectedMessage) {
    const errorMessage = await this.getErrorMessage();
    if (!errorMessage || !errorMessage.includes(expectedMessage)) {
      throw new Error(`Expected error message to contain "${expectedMessage}", but got: ${errorMessage}`);
    }
    console.log(`✅ Error state verified: ${errorMessage}`);
  }
}

module.exports = NativeUsersListPage;
