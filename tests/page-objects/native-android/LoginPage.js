const BasePage = require('../BasePage');

/**
 * Login Page Object for Native Android Compose App
 */
class NativeLoginPage extends BasePage {
  get selectors() {
    return {
      screen: {
        android: '~login-screen',
      },
      welcomeTitle: {
        android: '~welcome-title',
      },
      usernameInput: {
        android: '~username-input',
      },
      passwordInput: {
        android: '~password-input',
      },
      loginButton: {
        android: '~login-button',
      },
      errorMessage: {
        android: '~error-message',
      },
      demoHint: {
        android: '~demo-hint',
      },
    };
  }

  async waitForLoginScreen() {
    await this.waitForElement(this.selectors.screen);
    console.log('✅ Login screen displayed');
  }

  async enterUsername(username) {
    const element = await this.getElement(this.selectors.usernameInput);
    await element.setValue(username);
    console.log(`✓ Entered username: ${username}`);
  }

  async enterPassword(password) {
    const element = await this.getElement(this.selectors.passwordInput);
    await element.setValue(password);
    console.log(`✓ Entered password`);
  }

  async clickLoginButton() {
    await this.click(this.selectors.loginButton);
    console.log('✓ Clicked login button');
  }

  async login(username, password) {
    await this.waitForLoginScreen();
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
  }

  async loginWithDefaultCredentials() {
    await this.login('demo', 'password123');
  }

  async getErrorMessage() {
    try {
      return await this.getText(this.selectors.errorMessage);
    } catch (error) {
      return null;
    }
  }

  async verifyErrorMessage(expectedMessage) {
    const errorMessage = await this.getErrorMessage();
    if (!errorMessage || !errorMessage.includes(expectedMessage)) {
      throw new Error(`Expected error message to contain "${expectedMessage}", but got: ${errorMessage}`);
    }
    console.log(`✅ Error message verified: ${errorMessage}`);
  }
}

module.exports = NativeLoginPage;
