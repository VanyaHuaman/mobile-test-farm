const allure = require('@wdio/allure-reporter').default;
const fs = require('fs');
const path = require('path');

/**
 * AllureReporter - Helper class for Allure test reporting
 *
 * Provides methods to add rich metadata and attachments to Allure reports
 */
class AllureReporter {
  /**
   * Add a step to the current test
   * @param {string} stepName - Name of the step
   * @param {Function} stepFunction - Function to execute
   */
  static async step(stepName, stepFunction) {
    allure.startStep(stepName);
    try {
      const result = await stepFunction();
      allure.endStep('passed');
      return result;
    } catch (error) {
      allure.endStep('failed');
      throw error;
    }
  }

  /**
   * Attach a screenshot to the report
   * @param {string} name - Screenshot name
   * @param {string|Buffer} screenshot - Screenshot path or buffer
   */
  static attachScreenshot(name, screenshot) {
    if (typeof screenshot === 'string' && fs.existsSync(screenshot)) {
      const buffer = fs.readFileSync(screenshot);
      allure.addAttachment(name, buffer, 'image/png');
    } else if (Buffer.isBuffer(screenshot)) {
      allure.addAttachment(name, screenshot, 'image/png');
    }
  }

  /**
   * Attach text log to the report
   * @param {string} name - Log name
   * @param {string} content - Log content
   */
  static attachLog(name, content) {
    allure.addAttachment(name, content, 'text/plain');
  }

  /**
   * Attach JSON data to the report
   * @param {string} name - Data name
   * @param {Object} data - Data object
   */
  static attachJSON(name, data) {
    const json = JSON.stringify(data, null, 2);
    allure.addAttachment(name, json, 'application/json');
  }

  /**
   * Add test description
   * @param {string} description - Test description
   */
  static addDescription(description) {
    allure.addDescription(description, 'text');
  }

  /**
   * Add test severity
   * @param {string} severity - Severity level (blocker, critical, normal, minor, trivial)
   */
  static addSeverity(severity) {
    allure.addSeverity(severity);
  }

  /**
   * Add test tags/labels
   * @param {string} name - Label name
   * @param {string} value - Label value
   */
  static addLabel(name, value) {
    allure.addLabel(name, value);
  }

  /**
   * Add feature label
   * @param {string} feature - Feature name
   */
  static addFeature(feature) {
    allure.addFeature(feature);
  }

  /**
   * Add story label
   * @param {string} story - Story name
   */
  static addStory(story) {
    allure.addStory(story);
  }

  /**
   * Add epic label
   * @param {string} epic - Epic name
   */
  static addEpic(epic) {
    allure.addEpic(epic);
  }

  /**
   * Add test case ID
   * @param {string} id - Test case ID
   */
  static addTestId(id) {
    allure.addLabel('testId', id);
  }

  /**
   * Add issue link
   * @param {string} issueId - Issue ID
   */
  static addIssue(issueId) {
    allure.addIssue(issueId);
  }

  /**
   * Add TMS link (Test Management System)
   * @param {string} tmsId - TMS ID
   */
  static addTms(tmsId) {
    allure.addTestId(tmsId);
  }

  /**
   * Add environment information
   * @param {string} name - Environment variable name
   * @param {string} value - Environment variable value
   */
  static addEnvironment(name, value) {
    allure.addEnvironment(name, value);
  }

  /**
   * Add device information to the report
   * @param {Object} device - Device object
   */
  static addDeviceInfo(device) {
    this.addLabel('device', device.friendlyName || device.deviceId);
    this.addLabel('platform', device.platform);
    this.addLabel('deviceType', device.type);
    this.addLabel('deviceModel', device.model);

    const deviceInfo = {
      friendlyName: device.friendlyName,
      deviceId: device.deviceId,
      platform: device.platform,
      type: device.type,
      model: device.model,
      osVersion: device.osVersion,
    };

    this.attachJSON('Device Information', deviceInfo);
  }

  /**
   * Add test environment metadata
   * @param {Object} metadata - Environment metadata
   */
  static addTestEnvironment(metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      this.addEnvironment(key, String(value));
    });
  }

  /**
   * Mark test as broken
   * @param {string} message - Failure message
   */
  static broken(message) {
    allure.addLabel('resultStatus', 'broken');
    this.attachLog('Broken Reason', message);
  }

  /**
   * Mark test as known issue
   * @param {string} issueId - Issue ID
   * @param {string} message - Issue description
   */
  static knownIssue(issueId, message) {
    this.addIssue(issueId);
    this.attachLog('Known Issue', message);
  }
}

module.exports = AllureReporter;
