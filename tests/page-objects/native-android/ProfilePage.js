const BasePage = require('../../pages/BasePage');

/**
 * Profile Page Object for Native Android Compose App
 */
class NativeProfilePage extends BasePage {
  get selectors() {
    return {
      screen: {
        android: '~profile-screen',
      },
      title: {
        android: '~profile-title',
      },
      profileCard: {
        android: '~profile-card',
      },
      profileName: {
        android: '~profile-name',
      },
      profileEmail: {
        android: '~profile-email',
      },
      profilePhone: {
        android: '~profile-phone',
      },
      editProfileButton: {
        android: '~edit-profile-button',
      },
      logoutButton: {
        android: '~logout-button',
      },
    };
  }

  async waitForProfileScreen() {
    await this.waitForElement(this.selectors.screen);
    console.log('✅ Profile screen displayed');
  }

  async verifyOnProfilePage() {
    await this.waitForProfileScreen();
    const isProfileCardDisplayed = await this.isDisplayed(this.selectors.profileCard);
    if (!isProfileCardDisplayed) {
      throw new Error('Profile card not displayed');
    }
    console.log('✅ Verified on profile page');
  }

  async getProfileName() {
    return await this.getText(this.selectors.profileName);
  }

  async getProfileEmail() {
    return await this.getText(this.selectors.profileEmail);
  }

  async getProfilePhone() {
    return await this.getText(this.selectors.profilePhone);
  }

  async clickEditProfile() {
    await this.click(this.selectors.editProfileButton);
    console.log('✓ Clicked edit profile button');
  }

  async clickLogout() {
    await this.click(this.selectors.logoutButton);
    console.log('✓ Clicked logout button');
  }

  async logout() {
    await this.waitForProfileScreen();
    await this.clickLogout();
    // Wait a moment for navigation
    await this.pause(1000);
  }
}

module.exports = NativeProfilePage;
