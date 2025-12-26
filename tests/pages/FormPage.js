const BasePage = require('./BasePage');

/**
 * FormPage - Page Object for Form screen
 *
 * Handles form interactions including:
 * - Text inputs (name, email, age, bio)
 * - Switch toggles (notifications, newsletter)
 * - Form submission and clearing
 */
class FormPage extends BasePage {
  constructor(driver, platform) {
    super(driver, platform);
  }

  // Locators
  get backButton() {
    return this.findElement('back-button');
  }

  get nameInput() {
    return this.findElement('name-input');
  }

  get emailInput() {
    return this.findElement('email-input');
  }

  get ageInput() {
    return this.findElement('age-input');
  }

  get bioInput() {
    return this.findElement('bio-input');
  }

  get notificationsSwitch() {
    return this.findElement('notifications-switch');
  }

  get newsletterSwitch() {
    return this.findElement('newsletter-switch');
  }

  get submitButton() {
    return this.findElement('submit-button');
  }

  get clearButton() {
    return this.findElement('clear-button');
  }

  // Actions
  async waitForPageLoad() {
    await this.waitForElement('name-input', 10000);
    console.log('✅ Form page loaded');
  }

  async verifyOnFormPage() {
    const nameInput = await this.nameInput;
    const isDisplayed = await nameInput.isDisplayed();
    if (!isDisplayed) {
      throw new Error('Not on Form page');
    }
  }

  async enterName(name) {
    const input = await this.nameInput;
    await input.clearValue();
    await input.setValue(name);
    console.log(`   Entered name: ${name}`);
  }

  async enterEmail(email) {
    const input = await this.emailInput;
    await input.clearValue();
    await input.setValue(email);
    console.log(`   Entered email: ${email}`);
  }

  async enterAge(age) {
    const input = await this.ageInput;
    await input.clearValue();
    await input.setValue(age.toString());
    console.log(`   Entered age: ${age}`);
  }

  async enterBio(bio) {
    const input = await this.bioInput;
    await input.clearValue();
    await input.setValue(bio);
    console.log(`   Entered bio: ${bio.substring(0, 30)}...`);
  }

  async toggleNotifications() {
    const toggle = await this.notificationsSwitch;
    await toggle.click();
    console.log('   Toggled notifications');
  }

  async toggleNewsletter() {
    const toggle = await this.newsletterSwitch;
    await toggle.click();
    console.log('   Toggled newsletter');
  }

  async setNotifications(enabled) {
    const toggle = await this.notificationsSwitch;
    // Use 'checked' attribute which works on both platforms
    const checked = await toggle.getAttribute('checked');
    const isEnabled = checked === 'true';

    if (isEnabled !== enabled) {
      await toggle.click();
    }
    console.log(`   Set notifications to: ${enabled}`);
  }

  async setNewsletter(enabled) {
    const toggle = await this.newsletterSwitch;
    // Use 'checked' attribute which works on both platforms
    const checked = await toggle.getAttribute('checked');
    const isEnabled = checked === 'true';

    if (isEnabled !== enabled) {
      await toggle.click();
    }
    console.log(`   Set newsletter to: ${enabled}`);
  }

  async clickSubmit() {
    const button = await this.submitButton;
    // Scroll to the button to ensure it's visible
    await button.scrollIntoView();
    await this.pause(300);
    await button.click();
    console.log('   Clicked submit button');
    // Wait for alert to appear
    await this.pause(1000);
  }

  async clickClear() {
    console.log('   Attempting to find clear button...');
    const button = await this.clearButton;
    console.log('   Clear button found, scrolling into view...');
    // Scroll to the button to ensure it's visible
    await button.scrollIntoView();
    await this.pause(300);
    console.log('   Clicking clear button...');
    await button.click();
    console.log('   Clicked clear button');
    await this.pause(1000);
  }

  async clickBack() {
    const button = await this.backButton;
    await button.click();
    console.log('   Clicked back button');
    await this.pause(500);
  }

  async getName() {
    const input = await this.nameInput;
    // Android TextInput uses 'text' attribute, iOS uses getValue()
    if (this.platform === 'android') {
      return await input.getAttribute('text');
    }
    return await input.getValue();
  }

  async getEmail() {
    const input = await this.emailInput;
    // Android TextInput uses 'text' attribute, iOS uses getValue()
    if (this.platform === 'android') {
      return await input.getAttribute('text');
    }
    return await input.getValue();
  }

  async getAge() {
    const input = await this.ageInput;
    // Android TextInput uses 'text' attribute, iOS uses getValue()
    if (this.platform === 'android') {
      return await input.getAttribute('text');
    }
    return await input.getValue();
  }

  async getBio() {
    const input = await this.bioInput;
    // Android TextInput uses 'text' attribute, iOS uses getValue()
    if (this.platform === 'android') {
      return await input.getAttribute('text');
    }
    return await input.getValue();
  }

  async isNotificationsEnabled() {
    const toggle = await this.notificationsSwitch;
    // Use 'checked' attribute which works on both platforms
    const checked = await toggle.getAttribute('checked');
    return checked === 'true';
  }

  async isNewsletterEnabled() {
    const toggle = await this.newsletterSwitch;
    // Use 'checked' attribute which works on both platforms
    const checked = await toggle.getAttribute('checked');
    return checked === 'true';
  }

  async fillForm(formData) {
    console.log('📝 Filling form...');

    if (formData.name !== undefined) {
      await this.enterName(formData.name);
    }

    if (formData.email !== undefined) {
      await this.enterEmail(formData.email);
    }

    if (formData.age !== undefined) {
      await this.enterAge(formData.age);
    }

    if (formData.bio !== undefined) {
      await this.enterBio(formData.bio);
    }

    if (formData.notifications !== undefined) {
      await this.setNotifications(formData.notifications);
    }

    if (formData.newsletter !== undefined) {
      await this.setNewsletter(formData.newsletter);
    }

    console.log('✅ Form filled');
  }

  async getFormData() {
    return {
      name: await this.getName(),
      email: await this.getEmail(),
      age: await this.getAge(),
      bio: await this.getBio(),
      notifications: await this.isNotificationsEnabled(),
      newsletter: await this.isNewsletterEnabled(),
    };
  }

  async verifyFormData(expectedData) {
    const actualData = await this.getFormData();

    const errors = [];

    if (expectedData.name !== undefined && actualData.name !== expectedData.name) {
      errors.push(`Name mismatch: expected "${expectedData.name}", got "${actualData.name}"`);
    }

    if (expectedData.email !== undefined && actualData.email !== expectedData.email) {
      errors.push(`Email mismatch: expected "${expectedData.email}", got "${actualData.email}"`);
    }

    if (expectedData.age !== undefined && actualData.age !== expectedData.age.toString()) {
      errors.push(`Age mismatch: expected "${expectedData.age}", got "${actualData.age}"`);
    }

    if (expectedData.bio !== undefined && actualData.bio !== expectedData.bio) {
      errors.push(`Bio mismatch: expected "${expectedData.bio}", got "${actualData.bio}"`);
    }

    if (expectedData.notifications !== undefined && actualData.notifications !== expectedData.notifications) {
      errors.push(`Notifications mismatch: expected ${expectedData.notifications}, got ${actualData.notifications}`);
    }

    if (expectedData.newsletter !== undefined && actualData.newsletter !== expectedData.newsletter) {
      errors.push(`Newsletter mismatch: expected ${expectedData.newsletter}, got ${actualData.newsletter}`);
    }

    if (errors.length > 0) {
      throw new Error(`Form data verification failed:\n${errors.join('\n')}`);
    }

    console.log('✅ Form data verified');
  }

  async dismissAlert() {
    // Handle platform-specific alert dismissal
    if (this.platform === 'android') {
      try {
        // On Android, React Native Alert creates a dialog with buttons that can be found by text
        const okButton = await this.driver.$('android=new UiSelector().text("OK").className("android.widget.Button")');
        if (await okButton.isExisting()) {
          await okButton.click();
          console.log('   Dismissed alert (Android)');
        }
      } catch (e) {
        console.log('   No alert found (Android)');
      }
    } else if (this.platform === 'ios') {
      try {
        const okButton = await this.driver.$('~OK');
        if (await okButton.isExisting()) {
          await okButton.click();
          console.log('   Dismissed alert (iOS)');
        }
      } catch (e) {
        console.log('   No alert found (iOS)');
      }
    }
    // Wait longer for UI to settle after dismissing alert
    await this.pause(1000);
  }
}

module.exports = FormPage;
