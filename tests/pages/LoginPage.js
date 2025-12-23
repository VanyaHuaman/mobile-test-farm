const BasePage = require('./BasePage');
const config = require('../../config/test.config');

/**
 * Login Page Object
 *
 * Represents the login screen with username, password, and login button.
 */
class LoginPage extends BasePage {
  constructor(driver, platform) {
    super(driver, platform);
  }

  /**
   * Selectors for login page elements
   */
  get selectors() {
    return {
      usernameInput: {
        ios: '~username-input',
        android: '~Username input',
      },
      passwordInput: {
        ios: '~password-input',
        android: '~Password input',
      },
      loginButton: {
        ios: '~login-button',
        android: '~Login button',
      },
      forgotPasswordLink: {
        ios: '~forgot-password-link',
        android: '~forgot-password-link',
      },
      title: {
        ios: '-ios predicate string:label == "Welcome Back"',
        android: 'android=new UiSelector().text("Welcome Back")',
      },
    };
  }

  /**
   * Wait for login page to load
   * @param {number} timeout - Optional timeout
   */
  async waitForPageLoad(timeout = config.timeouts.explicit) {
    console.log('⏳ Waiting for login screen...');
    await this.waitForElement(this.selectors.usernameInput, timeout);
    console.log('✅ Login screen loaded');
  }

  /**
   * Enter username
   * @param {string} username - Username to enter
   */
  async enterUsername(username) {
    console.log(`📝 Entering username: ${username}`);
    await this.setText(this.selectors.usernameInput, username);
  }

  /**
   * Enter password
   * @param {string} password - Password to enter
   */
  async enterPassword(password) {
    console.log('📝 Entering password');
    await this.setText(this.selectors.passwordInput, password);
  }

  /**
   * Click login button
   */
  async clickLogin() {
    console.log('🔘 Clicking login button');
    await this.click(this.selectors.loginButton);
  }

  /**
   * Perform login with credentials
   * @param {string} username - Username
   * @param {string} password - Password
   */
  async login(username, password) {
    await this.waitForPageLoad();
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  /**
   * Perform login with default credentials from config
   */
  async loginWithDefaultCredentials() {
    const { username, password } = config.testUsers.default;
    await this.login(username, password);
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword() {
    await this.click(this.selectors.forgotPasswordLink);
  }

  /**
   * Check if login page is displayed
   * @returns {Promise<boolean>}
   */
  async isLoginPageDisplayed() {
    return await this.isDisplayed(this.selectors.usernameInput);
  }

  /**
   * Get page title text
   * @returns {Promise<string>}
   */
  async getTitle() {
    return await this.getText(this.selectors.title);
  }
}

module.exports = LoginPage;
