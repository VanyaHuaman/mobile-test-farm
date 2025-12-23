# HTML Test Reporting with Allure

Generate beautiful, comprehensive HTML reports from your mobile test runs.

## Overview

The Mobile Test Farm includes Allure Report integration for professional test reporting with:
- Rich HTML reports with interactive charts
- Screenshot attachments for failed tests
- Test history and trend analysis
- Execution timeline visualization
- Device and environment metadata
- Shareable reports for stakeholders

## Quick Start

### 1. Install Dependencies

Already installed with the project:
```bash
npm install
```

### 2. Run Tests

Tests will automatically generate Allure result files:
```bash
npm run test:parallel:all tests/specs/login.spec.js
```

### 3. Generate HTML Report

```bash
npm run report:generate
```

### 4. View Report

```bash
npm run report:open
```

The report will open in your default browser.

## Available Commands

### Report Generation
```bash
npm run report:generate      # Generate HTML report from results
npm run report:open          # Open generated report in browser
npm run report:serve         # Generate and serve report (live reload)
npm run report:clean         # Clean report directories
```

## Report Structure

### Main Dashboard

The Allure report includes several sections:

**Overview**
- Total tests run
- Pass/fail statistics
- Success rate percentage
- Execution time
- Environment information

**Suites**
- Tests organized by test suite
- Hierarchical test structure
- Execution status per suite

**Graphs**
- Status trend over time
- Duration trend
- Test categories breakdown
- Severity distribution

**Timeline**
- Visual timeline of test execution
- Parallel execution visualization
- Test duration comparison

**Categories**
- Test failures by category
- Known issues
- Flaky tests

**Behaviors**
- Tests organized by feature/story
- Epic → Feature → Story hierarchy

## Adding Metadata to Tests

Use the AllureReporter helper to add rich metadata:

```javascript
const AllureReporter = require('./tests/helpers/AllureReporter');

// In your test
AllureReporter.addFeature('Login');
AllureReporter.addStory('User Authentication');
AllureReporter.addSeverity('critical');
AllureReporter.addDescription('Verify login with valid credentials');

// Add device info
AllureReporter.addDeviceInfo(device);

// Add steps
await AllureReporter.step('Enter username', async () => {
  await loginPage.enterUsername('demo');
});

await AllureReporter.step('Enter password', async () => {
  await loginPage.enterPassword('password');
});

// Attach screenshots
AllureReporter.attachScreenshot('Login Screen', screenshotPath);

// Attach logs
AllureReporter.attachLog('Test Data', JSON.stringify(testData));
```

## Example: Enhanced Test with Allure

```javascript
const TestBase = require('../helpers/TestBase');
const LoginPage = require('../pages/LoginPage');
const HomePage = require('../pages/HomePage');
const AllureReporter = require('../helpers/AllureReporter');
const config = require('../../config/test.config');

async function testLoginWithAllure() {
  const testBase = new TestBase();
  const deviceId = 'iphone-16-pro-simulator';

  // Add test metadata
  AllureReporter.addEpic('Mobile App');
  AllureReporter.addFeature('Authentication');
  AllureReporter.addStory('User Login');
  AllureReporter.addSeverity('critical');
  AllureReporter.addDescription('Verify that a user can log in with valid credentials');
  AllureReporter.addTestId('TC-001');

  try {
    await testBase.runTest(deviceId, {
      'appium:app': config.apps.ios.simulator,
      'appium:bundleId': config.appInfo.ios.bundleId,
    }, async () => {
      const { driver } = testBase;
      const platform = testBase.getPlatform();

      // Add device info to report
      AllureReporter.addDeviceInfo(testBase.device);

      const loginPage = new LoginPage(driver, platform);
      const homePage = new HomePage(driver, platform);

      // Test steps with Allure
      await AllureReporter.step('Wait for login page to load', async () => {
        await loginPage.waitForPageLoad();
      });

      await AllureReporter.step('Enter username', async () => {
        await loginPage.enterUsername('demo');
      });

      await AllureReporter.step('Enter password', async () => {
        await loginPage.enterPassword('password');
      });

      await AllureReporter.step('Click login button', async () => {
        await loginPage.clickLogin();
      });

      await AllureReporter.step('Verify home page displayed', async () => {
        await homePage.waitForPageLoad();
        await homePage.verifyOnHomePage();
      });

      await AllureReporter.step('Verify header title', async () => {
        const title = await homePage.getHeaderTitle();
        if (!title.includes('Home Dashboard')) {
          throw new Error(`Unexpected title: ${title}`);
        }
      });

      console.log('✅ Test passed with Allure reporting');
    }, 'login-allure');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    AllureReporter.attachLog('Error Details', error.stack);
    process.exit(1);
  }
}

testLoginWithAllure();
```

## Report Features

### 1. Screenshots

Screenshots are automatically attached to the report when tests fail:

```javascript
// Automatic on failure (TestBase handles this)
await testBase.takeScreenshot('failure');

// Manual attachment
const screenshotPath = await testBase.takeScreenshot('custom');
AllureReporter.attachScreenshot('Custom Screenshot', screenshotPath);
```

### 2. Test Steps

Organize tests into logical steps:

```javascript
await AllureReporter.step('Step name', async () => {
  // Step implementation
  await page.doSomething();
});
```

### 3. Attachments

Attach various file types to reports:

```javascript
// Text logs
AllureReporter.attachLog('Debug Info', 'Detailed debug information...');

// JSON data
AllureReporter.attachJSON('Test Data', { user: 'demo', result: 'pass' });

// Screenshots
AllureReporter.attachScreenshot('Screenshot Name', buffer or path);
```

### 4. Categorization

Organize tests by epic, feature, and story:

```javascript
AllureReporter.addEpic('Mobile Testing');
AllureReporter.addFeature('Login Flow');
AllureReporter.addStory('Valid Credentials');
```

### 5. Severity Levels

Mark test importance:

```javascript
AllureReporter.addSeverity('blocker');    // Critical path
AllureReporter.addSeverity('critical');   // Important features
AllureReporter.addSeverity('normal');     // Standard features
AllureReporter.addSeverity('minor');      // Nice to have
AllureReporter.addSeverity('trivial');    // UI polish
```

### 6. Links

Add issue and test management links:

```javascript
AllureReporter.addIssue('JIRA-123');
AllureReporter.addTms('TMS-456');
```

## CI/CD Integration

### GitHub Actions

The reporting is integrated into CI/CD workflows:

```yaml
- name: Run tests
  run: npm run test:parallel:all tests/specs/login.spec.js

- name: Generate Allure Report
  if: always()
  run: npm run report:generate

- name: Upload Allure Report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: allure-report
    path: allure-report/
    retention-days: 30

- name: Upload Allure Results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: allure-results
    path: allure-results/
    retention-days: 7
```

### GitHub Pages Deployment

Deploy reports to GitHub Pages:

```yaml
- name: Deploy to GitHub Pages
  if: github.ref == 'refs/heads/master'
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./allure-report
    destination_dir: reports/${{ github.run_number }}
```

Access reports at: `https://username.github.io/mobile-test-farm/reports/123/`

## Historical Trends

Allure tracks test history across runs:

1. **Keep history directory:**
   ```bash
   # Copy history before generating new report
   cp -r allure-report/history allure-results/history
   npm run report:generate
   ```

2. **In CI/CD:**
   ```yaml
   - name: Download previous report
     uses: actions/download-artifact@v4
     with:
       name: allure-report
       path: allure-report-previous

   - name: Copy history
     run: |
       if [ -d "allure-report-previous/history" ]; then
         cp -r allure-report-previous/history allure-results/
       fi

   - name: Generate report with history
     run: npm run report:generate
   ```

## Best Practices

### 1. Meaningful Test Names

```javascript
// Good
AllureReporter.addDescription('Verify login succeeds with valid email and password');

// Bad
AllureReporter.addDescription('Test 1');
```

### 2. Granular Steps

```javascript
// Good - Clear steps
await AllureReporter.step('Navigate to login page', ...);
await AllureReporter.step('Enter credentials', ...);
await AllureReporter.step('Submit form', ...);

// Bad - Single step
await AllureReporter.step('Do login', ...);
```

### 3. Rich Metadata

```javascript
// Add context
AllureReporter.addLabel('platform', device.platform);
AllureReporter.addLabel('deviceType', device.type);
AllureReporter.addEnvironment('App Version', '1.0.0');
AllureReporter.addEnvironment('OS Version', device.osVersion);
```

### 4. Screenshot Strategy

```javascript
// Take screenshots at key points
await AllureReporter.step('Verify login screen', async () => {
  const screenshot = await driver.takeScreenshot();
  AllureReporter.attachScreenshot('Login Screen', Buffer.from(screenshot, 'base64'));
  await loginPage.verifyOnLoginPage();
});
```

## Troubleshooting

### No Results Generated

**Problem:** `allure-results` directory is empty

**Solutions:**
```bash
# Check if tests ran
ls -la allure-results/

# Ensure Allure reporter is configured
# Tests must use AllureReporter helper

# Check test output for errors
npm run test:parallel:all tests/specs/login.spec.js 2>&1 | tee test.log
```

### Report Generation Fails

**Problem:** `npm run report:generate` fails

**Solutions:**
```bash
# Clean and regenerate
npm run report:clean
npm run test:parallel:all tests/specs/login.spec.js
npm run report:generate

# Check Allure installation
npx allure --version

# Reinstall if needed
npm install --save-dev allure-commandline
```

### Screenshots Not Appearing

**Problem:** Screenshots missing from report

**Solutions:**
```javascript
// Ensure screenshots are attached properly
const screenshot = await testBase.takeScreenshot('test');
if (screenshot && fs.existsSync(screenshot)) {
  AllureReporter.attachScreenshot('Test Screenshot', screenshot);
}

// Or use buffer
const buffer = Buffer.from(await driver.takeScreenshot(), 'base64');
AllureReporter.attachScreenshot('Screenshot', buffer);
```

## Alternative: Simple HTML Reports

If Allure is too complex, use a simpler approach:

```javascript
// Generate simple HTML from test results
const results = {
  passed: 10,
  failed: 2,
  duration: '45s',
  tests: [...]
};

const html = `
<!DOCTYPE html>
<html>
<head><title>Test Report</title></head>
<body>
  <h1>Test Results</h1>
  <p>Passed: ${results.passed}</p>
  <p>Failed: ${results.failed}</p>
  <p>Duration: ${results.duration}</p>
</body>
</html>
`;

fs.writeFileSync('report.html', html);
```

## Resources

- [Allure Documentation](https://docs.qameta.io/allure/)
- [Allure WebDriverIO Integration](https://webdriver.io/docs/allure-reporter/)
- [Example Reports](https://demo.qameta.io/allure/)
- [Customization Guide](https://docs.qameta.io/allure/#_customization)

## Next Steps

- Add more tests with Allure metadata
- Configure GitHub Pages deployment
- Set up historical trend tracking
- Create custom categories for failures
- Add performance metrics to reports
