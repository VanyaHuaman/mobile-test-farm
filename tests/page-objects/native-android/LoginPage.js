const BasePage = require('../../pages/BasePage');

/**
 * Login Page Object for Native Android Compose App
 */
class NativeLoginPage extends BasePage {
  get selectors() {
    return {
      screen: {
        android: '~login-screen',  // Accessibility ID (testTag with testTagsAsResourceId might improve behavior)
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
    // Click to focus the Compose TextField
    await element.click();
    await this.pause(300);
    // Compose TextFields require character-by-character input
    // Standard setValue() doesn't work with Jetpack Compose
    for (const char of username) {
      await this.driver.keys([char]);
      await this.pause(50);
    }
    await this.pause(300);
    console.log(`✓ Entered username: ${username}`);
  }

  async enterPassword(password) {
    const element = await this.getElement(this.selectors.passwordInput);
    // Click to focus the Compose TextField
    await element.click();
    await this.pause(300);
    // Compose TextFields require character-by-character input
    // Standard setValue() doesn't work with Jetpack Compose
    for (const char of password) {
      await this.driver.keys([char]);
      await this.pause(50);
    }
    await this.pause(300);
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
    // Dismiss keyboard using Android back button (more reliable than hideKeyboard)
    try {
      await this.driver.back();
      await this.pause(500);
      console.log('✓ Keyboard dismissed using back button');
    } catch (e) {
      console.log('✓ Could not dismiss keyboard:', e.message);
    }
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
