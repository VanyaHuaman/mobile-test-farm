const BasePage = require('./BasePage');

/**
 * PostsPage - Page Object for Posts screen (API integration)
 *
 * Represents the Posts screen that fetches data from API
 */
class PostsPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.screenTestId = 'posts-screen';
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

  get postsList() {
    return '~posts-list';
  }

  get postsCount() {
    return '~posts-count';
  }

  /**
   * Wait for Posts screen to be displayed
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
   * Get posts count from header
   * @returns {Promise<number>}
   */
  async getPostsCount() {
    try {
      const countElement = await this.driver.$(this.postsCount);
      const text = await countElement.getText();
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
      const card = await this.driver.$(`~post-card-${postId}`);
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
    const titleElement = await this.driver.$(`~post-title-${postId}`);
    return await titleElement.getText();
  }

  /**
   * Get post body by ID
   * @param {number} postId - Post ID
   * @returns {Promise<string>}
   */
  async getPostBody(postId) {
    const bodyElement = await this.driver.$(`~post-body-${postId}`);
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
    const list = await this.driver.$(this.postsList);
    await this.scrollElement(list, direction);
  }
}

module.exports = PostsPage;
