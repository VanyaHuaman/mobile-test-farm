const BasePage = require('../../pages/BasePage');

/**
 * Home Page Object for Native Android Compose App
 */
class NativeHomePage extends BasePage {
  get selectors() {
    return {
      screen: {
        android: '~home-screen',  // Accessibility ID
      },
      appTitle: {
        android: '~app-title',
      },
      bottomNavigation: {
        android: '~bottom-navigation',
      },
      usersTab: {
        android: '~users-tab',
      },
      profileTab: {
        android: '~profile-tab',
      },
      settingsTab: {
        android: '~settings-tab',
      },
    };
  }

  async waitForHomeScreen() {
    await this.waitForElement(this.selectors.screen, 10000);
    console.log('✅ Home screen displayed');
  }

  async verifyOnHomePage() {
    await this.waitForHomeScreen();
    const isBottomNavDisplayed = await this.isDisplayed(this.selectors.bottomNavigation);
    if (!isBottomNavDisplayed) {
      throw new Error('Bottom navigation not displayed on home page');
    }
    console.log('✅ Verified on home page');
  }

  async navigateToUsers() {
    await this.click(this.selectors.usersTab);
    console.log('✓ Navigated to Users tab');
  }

  async navigateToProfile() {
    await this.click(this.selectors.profileTab);
    console.log('✓ Navigated to Profile tab');
  }

  async navigateToSettings() {
    await this.click(this.selectors.settingsTab);
    console.log('✓ Navigated to Settings tab');
  }

  async getAppTitle() {
    return await this.getText(this.selectors.appTitle);
  }
}

module.exports = NativeHomePage;
