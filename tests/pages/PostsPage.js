const BasePage = require('./BasePage');

/**
 * PostsPage - Page Object for Posts screen (API integration)
 *
 * Represents the Posts screen that fetches data from API
 */
class PostsPage extends BasePage {
  constructor(driver, platform) {
    super(driver, platform);
    this.screenTestId = 'posts-screen';
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

  get postsList() {
    return { ios: '~posts-list', android: '~posts-list' };
  }

  get postsCount() {
    return { ios: '~posts-count', android: 'id=posts-count' };
  }

  /**
   * Wait for Posts screen to be displayed
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForScreen(timeout = 10000) {
    // Use accessibilityLabel for cross-platform consistency
    const screen = await this.getElement(this.screenSelector);
    await screen.waitForDisplayed({ timeout });
  }

  /**
   * Verify header is displayed
   * @returns {Promise<boolean>}
   */
  async verifyHeader() {
    try {
      const screen = await this.getElement(this.screenSelector);
      return await screen.isDisplayed();
    } catch (error) {
      return false;
    }
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
   * Get posts count from header
   * @returns {Promise<number>}
   */
  async getPostsCount() {
    try {
      let text;
      if (this.platform === 'android') {
        // On Android, use text matching since Text elements don't create resource-ids
        const countElement = await this.driver.$('android=new UiSelector().textContains(" posts found")');
        text = await countElement.getText();
      } else {
        // On iOS, use accessibilityLabel
        const countElement = await this.getElement(this.postsCount);
        text = await countElement.getText();
      }
      // Extract number from "100 posts found"
      const match = text.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    } catch (error) {
      console.error('Error getting posts count:', error.message);
      return 0;
    }
  }

  /**
   * Verify post card exists
   * @param {number} postId - Post ID
   * @returns {Promise<boolean>}
   */
  async verifyPostCard(postId) {
    try {
      const selector = { ios: `~post-card-${postId}`, android: `~post-card-${postId}` };
      const card = await this.getElement(selector);
      return await card.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get post title by ID
   * @param {number} postId - Post ID
   * @returns {Promise<string>}
   */
  async getPostTitle(postId) {
    const selector = { ios: `~post-title-${postId}`, android: `~post-title-${postId}` };
    const titleElement = await this.getElement(selector);
    return await titleElement.getText();
  }

  /**
   * Get post body by ID
   * @param {number} postId - Post ID
   * @returns {Promise<string>}
   */
  async getPostBody(postId) {
    const selector = { ios: `~post-body-${postId}`, android: `~post-body-${postId}` };
    const bodyElement = await this.getElement(selector);
    return await bodyElement.getText();
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
   * Scroll posts list
   * @param {string} direction - 'up' or 'down'
   */
  async scrollList(direction = 'down') {
    const list = await this.getElement(this.postsList);
    await list.scrollIntoView();
  }
}

module.exports = PostsPage;
