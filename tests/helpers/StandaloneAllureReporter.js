const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * StandaloneAllureReporter - Allure reporter for standalone Node.js test scripts
 *
 * This reporter writes Allure-compatible result files directly,
 * without requiring the wdio testrunner.
 */
class StandaloneAllureReporter {
  constructor(options = {}) {
    this.resultsDir = options.resultsDir || path.join(process.cwd(), 'allure-results');
    this.currentTest = null;
    this.currentStep = null;
    this.steps = [];
    this.attachments = [];
    this.labels = [];
    this.links = [];

    // Ensure results directory exists
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }
  }

  /**
   * Generate UUID
   */
  uuid() {
    return crypto.randomUUID();
  }

  /**
   * Start a new test case
   */
  startTest(name, fullName = null) {
    this.currentTest = {
      uuid: this.uuid(),
      historyId: this.uuid(),
      name: name,
      fullName: fullName || name,
      start: Date.now(),
      labels: [...this.labels],
      links: [...this.links],
      steps: [],
      attachments: [],
      parameters: [],
      status: 'passed',
      stage: 'running',
    };
    this.steps = [];
    this.attachments = [];
    console.log(`📊 Allure: Started test "${name}"`);
  }

  /**
   * End current test
   */
  endTest(status = 'passed', errorMessage = null, errorTrace = null) {
    if (!this.currentTest) return;

    this.currentTest.stop = Date.now();
    this.currentTest.status = status;
    this.currentTest.stage = 'finished';
    this.currentTest.steps = this.steps;
    this.currentTest.attachments = this.attachments;

    if (errorMessage) {
      this.currentTest.statusDetails = {
        message: errorMessage,
        trace: errorTrace || '',
      };
    }

    // Write result file
    const filename = `${this.currentTest.uuid}-result.json`;
    const filepath = path.join(this.resultsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(this.currentTest, null, 2));

    console.log(`📊 Allure: Test "${this.currentTest.name}" finished with status: ${status}`);
    console.log(`📊 Allure: Result saved to ${filepath}`);

    this.currentTest = null;
  }

  /**
   * Start a step
   */
  startStep(name) {
    const step = {
      name: name,
      start: Date.now(),
      status: 'passed',
      stage: 'running',
      steps: [],
      attachments: [],
    };
    this.steps.push(step);
    this.currentStep = step;
    return step;
  }

  /**
   * End current step
   */
  endStep(status = 'passed') {
    if (this.currentStep) {
      this.currentStep.stop = Date.now();
      this.currentStep.status = status;
      this.currentStep.stage = 'finished';
      this.currentStep = null;
    }
  }

  /**
   * Execute a step with automatic start/end
   */
  async step(name, fn) {
    this.startStep(name);
    try {
      const result = await fn();
      this.endStep('passed');
      return result;
    } catch (error) {
      this.endStep('failed');
      throw error;
    }
  }

  /**
   * Add attachment
   */
  addAttachment(name, content, type) {
    const ext = this.getExtension(type);
    const filename = `${this.uuid()}-attachment.${ext}`;
    const filepath = path.join(this.resultsDir, filename);

    // Write attachment file
    if (Buffer.isBuffer(content)) {
      fs.writeFileSync(filepath, content);
    } else if (typeof content === 'string') {
      fs.writeFileSync(filepath, content);
    }

    const attachment = {
      name: name,
      source: filename,
      type: type,
    };

    if (this.currentStep) {
      this.currentStep.attachments.push(attachment);
    } else {
      this.attachments.push(attachment);
    }

    console.log(`📎 Allure: Attached "${name}" (${type})`);
    return attachment;
  }

  /**
   * Attach screenshot from file path
   */
  attachScreenshot(name, screenshotPath) {
    if (typeof screenshotPath === 'string' && fs.existsSync(screenshotPath)) {
      const buffer = fs.readFileSync(screenshotPath);
      return this.addAttachment(name, buffer, 'image/png');
    }
    return null;
  }

  /**
   * Attach video from file path
   */
  attachVideo(name, videoPath) {
    if (typeof videoPath === 'string' && fs.existsSync(videoPath)) {
      const buffer = fs.readFileSync(videoPath);
      return this.addAttachment(name, buffer, 'video/mp4');
    }
    return null;
  }

  /**
   * Attach log text
   */
  attachLog(name, content) {
    return this.addAttachment(name, content, 'text/plain');
  }

  /**
   * Attach JSON data
   */
  attachJSON(name, data) {
    const json = JSON.stringify(data, null, 2);
    return this.addAttachment(name, json, 'application/json');
  }

  /**
   * Add label
   */
  addLabel(name, value) {
    const label = { name, value: String(value) };
    if (this.currentTest) {
      this.currentTest.labels.push(label);
    } else {
      this.labels.push(label);
    }
  }

  /**
   * Add severity label
   */
  addSeverity(severity) {
    this.addLabel('severity', severity);
  }

  /**
   * Add feature label
   */
  addFeature(feature) {
    this.addLabel('feature', feature);
  }

  /**
   * Add story label
   */
  addStory(story) {
    this.addLabel('story', story);
  }

  /**
   * Add epic label
   */
  addEpic(epic) {
    this.addLabel('epic', epic);
  }

  /**
   * Add suite label
   */
  addSuite(suite) {
    this.addLabel('suite', suite);
  }

  /**
   * Add description
   */
  addDescription(description) {
    if (this.currentTest) {
      this.currentTest.description = description;
    }
  }

  /**
   * Add device info labels
   */
  addDeviceInfo(device) {
    this.addLabel('device', device.friendlyName || device.deviceId);
    this.addLabel('platform', device.platform);
    this.addLabel('deviceType', device.type);
    if (device.model) this.addLabel('deviceModel', device.model);
    if (device.osVersion) this.addLabel('os', device.osVersion);

    this.attachJSON('Device Information', {
      friendlyName: device.friendlyName,
      deviceId: device.deviceId,
      platform: device.platform,
      type: device.type,
      model: device.model,
      osVersion: device.osVersion,
    });
  }

  /**
   * Write environment properties file
   */
  writeEnvironment(properties) {
    const envPath = path.join(this.resultsDir, 'environment.properties');
    const content = Object.entries(properties)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    fs.writeFileSync(envPath, content);
  }

  /**
   * Get file extension for content type
   */
  getExtension(type) {
    const extensions = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'video/mp4': 'mp4',
      'text/plain': 'txt',
      'application/json': 'json',
      'text/html': 'html',
    };
    return extensions[type] || 'bin';
  }
}

// Export singleton instance for easy use
const reporter = new StandaloneAllureReporter();

module.exports = reporter;
module.exports.StandaloneAllureReporter = StandaloneAllureReporter;
