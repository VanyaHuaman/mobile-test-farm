const BasePage = require('./BasePage');

/**
 * ProfilePage - Page Object for Profile screen
 *
 * Handles profile interactions including:
 * - Profile data verification
 * - Settings navigation
 * - Delete account action
 */
class ProfilePage extends BasePage {
  constructor(driver, platform) {
    super(driver, platform);
  }

  // Locators
  get backButton() {
    return this.findElement('back-button');
  }

  get profilePhone() {
    return this.findElement('profile-phone');
  }

  get profileLocation() {
    return this.findElement('profile-location');
  }

  get profileMemberSince() {
    return this.findElement('profile-member-since');
  }

  get settingEditProfile() {
    return this.findElement('setting-edit-profile');
  }

  get settingNotifications() {
    return this.findElement('setting-notifications');
  }

  get settingPrivacy() {
    return this.findElement('setting-privacy');
  }

  get settingHelpSupport() {
    return this.findElement('setting-help-&-support');
  }

  get settingAbout() {
    return this.findElement('setting-about');
  }

  get deleteAccountButton() {
    return this.findElement('delete-account-button');
  }

  // Actions
  async waitForPageLoad() {
    await this.waitForElement('profile-phone', 10000);
    console.log('✅ Profile page loaded');
  }

  async verifyOnProfilePage() {
    const phoneElement = await this.profilePhone;
    const isDisplayed = await phoneElement.isDisplayed();
    if (!isDisplayed) {
      throw new Error('Not on Profile page');
    }
  }

  async clickBack() {
    const button = await this.backButton;
    await button.click();
    console.log('   Clicked back button');
    await this.pause(500);
  }

  async getPhone() {
    const element = await this.profilePhone;
    return await element.getText();
  }

  async getLocation() {
    const element = await this.profileLocation;
    return await element.getText();
  }

  async getMemberSince() {
    const element = await this.profileMemberSince;
    return await element.getText();
  }

  async getProfileData() {
    return {
      phone: await this.getPhone(),
      location: await this.getLocation(),
      memberSince: await this.getMemberSince(),
    };
  }

  async verifyProfileData(expectedData) {
    const actualData = await this.getProfileData();

    const errors = [];

    if (expectedData.phone && actualData.phone !== expectedData.phone) {
      errors.push(`Phone mismatch: expected "${expectedData.phone}", got "${actualData.phone}"`);
    }

    if (expectedData.location && actualData.location !== expectedData.location) {
      errors.push(`Location mismatch: expected "${expectedData.location}", got "${actualData.location}"`);
    }

    if (expectedData.memberSince && actualData.memberSince !== expectedData.memberSince) {
      errors.push(`Member since mismatch: expected "${expectedData.memberSince}", got "${actualData.memberSince}"`);
    }

    if (errors.length > 0) {
      throw new Error(`Profile data verification failed:\n${errors.join('\n')}`);
    }

    console.log('✅ Profile data verified');
  }

  async clickEditProfile() {
    const setting = await this.settingEditProfile;
    await setting.click();
    console.log('   Clicked Edit Profile');
    await this.pause(1000);
  }

  async clickNotifications() {
    const setting = await this.settingNotifications;
    await setting.click();
    console.log('   Clicked Notifications');
    await this.pause(1000);
  }

  async clickPrivacy() {
    const setting = await this.settingPrivacy;
    await setting.click();
    console.log('   Clicked Privacy');
    await this.pause(1000);
  }

  async clickHelpSupport() {
    const setting = await this.settingHelpSupport;
    await setting.click();
    console.log('   Clicked Help & Support');
    await this.pause(1000);
  }

  async clickAbout() {
    const setting = await this.settingAbout;
    await setting.click();
    console.log('   Clicked About');
    await this.pause(1000);
  }

  async clickDeleteAccount() {
    const button = await this.deleteAccountButton;
    await button.click();
    console.log('   Clicked Delete Account');
    await this.pause(1000);
  }

  async dismissAlert() {
    // Handle platform-specific alert dismissal
    if (this.platform === 'android') {
      try {
        await this.driver.acceptAlert();
      } catch (e) {
        // Alert might not be present
      }
    } else if (this.platform === 'ios') {
      try {
        const okButton = await this.driver.$('~OK');
        if (await okButton.isExisting()) {
          await okButton.click();
        }
      } catch (e) {
        // Alert might not be present
      }
    }
    await this.pause(500);
  }

  async cancelAlert() {
    // Handle platform-specific alert cancellation
    if (this.platform === 'android') {
      try {
        await this.driver.dismissAlert();
      } catch (e) {
        // Alert might not be present
      }
    } else if (this.platform === 'ios') {
      try {
        const cancelButton = await this.driver.$('~Cancel');
        if (await cancelButton.isExisting()) {
          await cancelButton.click();
        }
      } catch (e) {
        // Alert might not be present
      }
    }
    await this.pause(500);
  }

  async testAllSettings() {
    console.log('🧪 Testing all settings...');

    const settings = [
      { name: 'Edit Profile', method: () => this.clickEditProfile() },
      { name: 'Notifications', method: () => this.clickNotifications() },
      { name: 'Privacy', method: () => this.clickPrivacy() },
      { name: 'Help & Support', method: () => this.clickHelpSupport() },
      { name: 'About', method: () => this.clickAbout() },
    ];

    for (const setting of settings) {
      console.log(`   Testing: ${setting.name}`);
      await setting.method();
      await this.dismissAlert();
    }

    console.log('✅ All settings tested');
  }
}

module.exports = ProfilePage;
