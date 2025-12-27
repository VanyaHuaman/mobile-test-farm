# Quick Wins - Mobile Test Farm Improvements

This document covers the quick-win improvements added to the Mobile Test Farm infrastructure for immediate productivity and reliability gains.

## Table of Contents

- [Multi-Platform Notifications](#multi-platform-notifications)
- [Test Retry Logic](#test-retry-logic)
- [Nightly Test Runs](#nightly-test-runs)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)

---

## Multi-Platform Notifications

Get instant feedback on test results through your preferred communication platform.

### Supported Platforms

1. **Slack** - Team channels and direct messages
2. **Microsoft Teams** - Team channels
3. **Discord** - Server channels
4. **Email** - Via webhook services (SendGrid, Mailgun, etc.)
5. **Custom Webhook** - Any REST API endpoint

### Features

- ✅ **Flexible Configuration** - Enable any combination of platforms
- ✅ **Rich Notifications** - Test status, duration, device info, error details
- ✅ **Automatic Formatting** - Platform-specific payload optimization
- ✅ **Summary Reports** - Aggregated test results across devices
- ✅ **Failure Alerts** - Immediate notification on test failures
- ✅ **Success Reports** - Confirmation when tests pass

### Notification Types

#### 1. Success Notifications
Sent when tests pass successfully.

**Contains:**
- ✅ Test suite name
- ⏱️ Execution duration
- 📱 Device information
- 🎯 Platform (Android/iOS)

#### 2. Failure Notifications
Sent when tests fail.

**Contains:**
- ❌ Test suite name
- 🐛 Error message
- 📸 Screenshot links (if available)
- 🎥 Video recording links (if available)
- 📱 Device information

#### 3. Summary Notifications
Sent after test suite completion.

**Contains:**
- 📊 Total tests run
- ✅ Tests passed
- ❌ Tests failed
- ⏱️ Total duration
- 📱 Devices tested

### Setup

#### Slack

1. Create an Incoming Webhook:
   - Go to https://api.slack.com/messaging/webhooks
   - Click "Create your Slack app"
   - Enable Incoming Webhooks
   - Add webhook to your workspace
   - Copy the webhook URL

2. Configure in `.env`:
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_CHANNEL=#test-results
SLACK_USERNAME=Mobile Test Farm
SLACK_ICON_EMOJI=:robot_face:
```

#### Microsoft Teams

1. Create an Incoming Webhook:
   - Open Teams channel
   - Click ••• (More options)
   - Select "Connectors"
   - Find "Incoming Webhook"
   - Configure and copy the URL

2. Configure in `.env`:
```bash
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/YOUR/WEBHOOK/URL
```

#### Discord

1. Create a Webhook:
   - Server Settings → Integrations → Webhooks
   - Click "New Webhook"
   - Choose channel and copy URL

2. Configure in `.env`:
```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK/URL
DISCORD_USERNAME=Mobile Test Farm
DISCORD_AVATAR_URL=https://your-avatar-url.com/image.png
```

#### Email (via SendGrid)

1. Get SendGrid API key:
   - Sign up at https://sendgrid.com
   - Create API key with Mail Send permissions

2. Configure in `.env`:
```bash
EMAIL_WEBHOOK_URL=https://api.sendgrid.com/v3/mail/send
EMAIL_TO=team@example.com
EMAIL_FROM=noreply@mobile-test-farm.com
```

#### Custom Webhook

Send notifications to any REST API endpoint.

```bash
CUSTOM_WEBHOOK_URL=https://your-api.com/webhook
CUSTOM_WEBHOOK_METHOD=POST
CUSTOM_WEBHOOK_HEADERS={"Authorization":"Bearer YOUR_TOKEN","Content-Type":"application/json"}
```

### Testing Notifications

Test your notification configuration:

```bash
npm run notify:test
```

**Output:**
```
🔔 Testing Notification Configuration
======================================================================

📡 Enabled Platforms:
   ✅ slack      (configured)
   ✅ teams      (configured)
   ❌ discord    (not configured)
   ❌ email      (not configured)
   ❌ webhook    (not configured)

✅ Found 2 configured platform(s)

📤 Sending test notification...

✅ Notification sent successfully!

Results:
   ✅ slack      sent
   ✅ teams      sent

✨ Check your notification channels for the test message!
```

---

## Test Retry Logic

Automatically retry failed tests to handle flaky tests and transient issues.

### Features

- 🔄 **Automatic Retries** - Configurable retry attempts
- ⏱️ **Smart Delays** - Configurable delay between retries
- 📊 **Detailed Logging** - Track retry attempts and outcomes
- 🎯 **Flexible Configuration** - Per-test or global settings
- ✅ **Success Tracking** - Know which attempt succeeded

### Configuration

Configure in `.env`:

```bash
# Enable/disable retry logic
TEST_RETRY_ENABLED=true

# Maximum number of retries (default: 2)
# Total attempts = max_retries + 1
TEST_MAX_RETRIES=2

# Delay between retries in milliseconds (default: 3000)
TEST_RETRY_DELAY=3000
```

**Example Scenarios:**

| Config | First Run | Retries | Total Attempts |
|--------|-----------|---------|----------------|
| `TEST_MAX_RETRIES=2` | ✅ Pass | 0 | 1 |
| `TEST_MAX_RETRIES=2` | ❌ Fail | ✅ Pass on retry 1 | 2 |
| `TEST_MAX_RETRIES=2` | ❌ Fail | ❌ Fail, ✅ Pass on retry 2 | 3 |
| `TEST_MAX_RETRIES=2` | ❌ Fail | ❌ Fail, ❌ Fail | 3 (all failed) |

### Usage

#### Basic Usage (Programmatic)

```javascript
const { TestRetry } = require('./lib/test-retry');

const retry = new TestRetry({
  maxRetries: 2,
  retryDelay: 3000,
  enabled: true,
});

// Wrap your test function
const result = await retry.executeWithRetry(async () => {
  // Your test code here
  await runMyTest();
}, {
  testName: 'Login Test',
});

console.log(`Test completed in ${result.attempts} attempt(s)`);
console.log(`Was retried: ${result.retried}`);
```

#### Custom Retry Configuration

Override defaults for specific tests:

```javascript
// Retry up to 5 times with 5-second delays
const result = await retry.executeWithRetry(async () => {
  await runFlakyTest();
}, {
  testName: 'Flaky Network Test',
  maxRetries: 5,
  retryDelay: 5000,
});
```

#### Disable Retries for Specific Test

```javascript
// Force single attempt
const result = await retry.executeWithRetry(async () => {
  await runCriticalTest();
}, {
  testName: 'Critical Test',
  maxRetries: 0,
});
```

### Console Output

**Successful Test (No Retry):**
```
======================================================================
🧪 Attempt 1: Login Test
======================================================================
✅ Login successful
```

**Test Passes on Retry:**
```
======================================================================
🧪 Attempt 1: Login Test
======================================================================
❌ Attempt 1 failed: Element not found
   Will retry (2 attempts remaining)

🔄 Retry attempt 1/2 for: Login Test
   Waiting 3000ms before retry...

======================================================================
🧪 Attempt 2 (Retry 1): Login Test
======================================================================
✅ Login successful

✅ Test passed on retry attempt 1
```

**Test Fails All Attempts:**
```
======================================================================
🧪 Attempt 1: Login Test
======================================================================
❌ Attempt 1 failed: Element not found
   Will retry (2 attempts remaining)

🔄 Retry attempt 1/2 for: Login Test
   Waiting 3000ms before retry...

======================================================================
🧪 Attempt 2 (Retry 1): Login Test
======================================================================
❌ Attempt 2 failed: Element not found
   Will retry (1 attempt remaining)

🔄 Retry attempt 2/2 for: Login Test
   Waiting 3000ms before retry...

======================================================================
🧪 Attempt 3 (Retry 2): Login Test
======================================================================
❌ Attempt 3 failed: Element not found

❌ All 3 attempts failed
```

### Error Handling

When all retries are exhausted, a `RetryExhaustedError` is thrown:

```javascript
const { RetryExhaustedError } = require('./lib/test-retry');

try {
  await retry.executeWithRetry(async () => {
    await runTest();
  });
} catch (error) {
  if (error instanceof RetryExhaustedError) {
    console.error(`Test failed after ${error.attempts} attempts`);
    console.error(`Original error: ${error.originalError.message}`);
  }
}
```

---

## Nightly Test Runs

Automated daily test execution via GitHub Actions.

### Features

- 🕐 **Scheduled Execution** - Runs at 2 AM UTC daily
- 🎯 **Manual Trigger** - Run on-demand with suite selection
- 📱 **Full Device Support** - Android emulator + iOS simulator
- 📊 **Artifact Upload** - Reports, screenshots, videos
- 📝 **Test Summaries** - GitHub Actions summary reports
- 🔔 **Notifications** - Slack/Teams alerts on failure

### Schedule

**Automatic:** Every day at 2 AM UTC (cron: `0 2 * * *`)

**Manual:** Via GitHub Actions UI

### Workflow Configuration

Located at: `.github/workflows/nightly-tests.yml`

#### Job Steps

1. **Setup Environment**
   - Checkout repository
   - Install Node.js 22.x
   - Install npm dependencies

2. **Setup Android**
   - Install Java 17
   - Setup Android SDK
   - Install platform tools, emulator
   - Create Android AVD (Pixel 6, Android 14)
   - Start emulator

3. **Setup iOS**
   - Boot iOS Simulator (iPhone 16 Pro preferred)
   - Wait for boot completion

4. **Setup Appium**
   - Install Appium 3.1.2
   - Install UiAutomator2 6.7.5 (Android)
   - Install XCUITest 10.12.2 (iOS)
   - Start Appium server

5. **Build Your Mobile App**
   - Checkout your mobile app repository
   - Install dependencies
   - Build Android APK
   - Build iOS app

6. **Configure Tests**
   - Create `.env` file with app paths
   - Enable notifications
   - Configure test retry

7. **Discover Devices**
   - Run device sync
   - Register CI devices

8. **Run Tests**
   - Execute selected test suite
   - Generate Allure report
   - Upload artifacts

### Manual Trigger

Trigger manually from GitHub Actions UI:

**Options:**
- `all` - Run all test suites (default)
- `login` - Login tests only
- `form` - Form tests only
- `list` - List tests only
- `profile` - Profile tests only
- `navigation` - Navigation tests only

### Test Suite Execution

**All Suites:**
```bash
npm run test:suite:all
```

Runs in sequence:
1. Login tests (`npm run test:login:pom`)
2. Form tests (`npm run test:form`)
3. List tests (`npm run test:list`)
4. Profile tests (`npm run test:profile`)
5. Navigation tests (`npm run test:navigation`)

**Individual Suite:**
```bash
npm run test:login
npm run test:form
npm run test:list
npm run test:profile
npm run test:navigation
```

### Artifacts

Uploaded after every run (success or failure):

#### 1. Allure Report
- **Name:** `nightly-allure-report`
- **Path:** `allure-report/`
- **Retention:** 30 days
- **Contains:** HTML test report with results, history, trends

#### 2. Test Artifacts
- **Name:** `nightly-test-artifacts`
- **Path:** `screenshots/`, `videos/`, `*.log`
- **Retention:** 14 days
- **Contains:**
  - Screenshots from test execution
  - Video recordings of failures
  - Appium server logs
  - Emulator logs

### Viewing Results

1. **GitHub Actions Summary:**
   - Go to Actions tab
   - Click on workflow run
   - View "Test Summary" section

2. **Download Allure Report:**
   - Click on workflow run
   - Scroll to "Artifacts"
   - Download `nightly-allure-report`
   - Unzip and open `index.html`

3. **Download Test Artifacts:**
   - Download `nightly-test-artifacts`
   - View screenshots and videos

### Notifications

Configure in workflow secrets:

```bash
# GitHub Repository Settings → Secrets → Actions
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

Notifications sent on:
- ❌ Test failures
- ✅ Test success (configurable)
- 📊 Test suite completion

---

## Configuration

### Environment Variables

Full configuration in `.env` file (copy from `.env.example`):

```bash
# =============================================================================
# NOTIFICATIONS - Multi-Platform Support
# =============================================================================
NOTIFICATIONS_ENABLED=true

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_CHANNEL=#test-results
SLACK_USERNAME=Mobile Test Farm
SLACK_ICON_EMOJI=:robot_face:

# Microsoft Teams
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/YOUR/WEBHOOK/URL

# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK/URL
DISCORD_USERNAME=Mobile Test Farm
DISCORD_AVATAR_URL=

# Email (via SendGrid/Mailgun/etc)
EMAIL_WEBHOOK_URL=https://api.sendgrid.com/v3/mail/send
EMAIL_TO=team@example.com
EMAIL_FROM=noreply@mobile-test-farm.com

# Custom Webhook
CUSTOM_WEBHOOK_URL=https://your-api.com/webhook
CUSTOM_WEBHOOK_METHOD=POST
CUSTOM_WEBHOOK_HEADERS={"Authorization":"Bearer YOUR_TOKEN","Content-Type":"application/json"}

# =============================================================================
# TEST RETRY CONFIGURATION
# =============================================================================
TEST_RETRY_ENABLED=true
TEST_MAX_RETRIES=2          # Number of retries for failed tests
TEST_RETRY_DELAY=3000       # Delay between retries (milliseconds)
```

---

## Usage Examples

### Example 1: Notification-Enabled Test Suite

```javascript
const NotificationManager = require('./lib/notification-manager');
const { TestRetry } = require('./lib/test-retry');

async function runTestSuiteWithNotifications() {
  const notifier = new NotificationManager();
  const retry = new TestRetry();

  const startTime = Date.now();

  try {
    // Run test with retry
    const result = await retry.executeWithRetry(async () => {
      await runLoginTests();
    }, {
      testName: 'Login Test Suite',
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2) + 's';

    // Notify success
    await notifier.notifySuccess('Login Test Suite', {
      message: 'All login tests passed!',
      device: 'Pixel 64 Emulator',
      platform: 'Android',
      duration,
      attempts: result.attempts,
    });

  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2) + 's';

    // Notify failure
    await notifier.notifyFailure('Login Test Suite', {
      error: error.message,
      device: 'Pixel 64 Emulator',
      platform: 'Android',
      duration,
      screenshot: './screenshots/failure.png',
    });

    throw error;
  }
}
```

### Example 2: Multi-Device Test Summary

```javascript
async function runMultiDeviceTests() {
  const notifier = new NotificationManager();
  const retry = new TestRetry();

  const devices = [
    { name: 'Android Emulator', platform: 'android' },
    { name: 'iPhone 16 Pro', platform: 'ios' },
  ];

  const results = [];
  const startTime = Date.now();

  for (const device of devices) {
    try {
      const result = await retry.executeWithRetry(async () => {
        await runTestsOnDevice(device);
      }, {
        testName: `Tests on ${device.name}`,
      });

      results.push({ device: device.name, status: 'passed', ...result });
    } catch (error) {
      results.push({ device: device.name, status: 'failed', error: error.message });
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2) + 's';
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;

  // Send summary
  await notifier.notifySummary({
    total: devices.length,
    passed,
    failed,
    duration,
    results,
  });
}
```

### Example 3: Custom Retry Strategy

```javascript
// Aggressive retry for flaky network tests
const networkRetry = new TestRetry({
  maxRetries: 5,
  retryDelay: 5000,
  enabled: true,
});

await networkRetry.executeWithRetry(async () => {
  await testApiIntegration();
}, {
  testName: 'API Integration Test',
});

// No retry for snapshot tests
const snapshotRetry = new TestRetry({
  maxRetries: 0,
  enabled: true,
});

await snapshotRetry.executeWithRetry(async () => {
  await testVisualRegression();
}, {
  testName: 'Visual Regression Test',
});
```

---

## Benefits

### Multi-Platform Notifications
- ✅ **Immediate Feedback** - Know test results instantly
- ✅ **Team Awareness** - Share results with entire team
- ✅ **Platform Flexibility** - Use your preferred communication tool
- ✅ **Rich Context** - See device, platform, error details at a glance
- ✅ **Failure Alerts** - Get notified immediately when tests break

### Test Retry Logic
- ✅ **Reduced Flakiness** - Handle transient issues automatically
- ✅ **Better Reliability** - Distinguish real failures from flaky tests
- ✅ **Time Savings** - No manual re-runs needed
- ✅ **Detailed Logging** - Understand which attempt succeeded
- ✅ **Configurable** - Adjust retry strategy per test

### Nightly Test Runs
- ✅ **Continuous Validation** - Catch regressions early
- ✅ **No Manual Work** - Fully automated
- ✅ **Full Coverage** - Test all platforms and devices
- ✅ **Historical Data** - Track test trends over time
- ✅ **Artifact Preservation** - Screenshots and videos for debugging

---

## Troubleshooting

### Notifications Not Sending

**Check 1: Verify Configuration**
```bash
npm run notify:test
```

**Check 2: Verify Webhook URLs**
```bash
# Test Slack webhook directly
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test from curl"}' \
  YOUR_SLACK_WEBHOOK_URL
```

**Check 3: Check Environment Variables**
```bash
node -e "console.log('Slack URL:', process.env.SLACK_WEBHOOK_URL)"
```

### Retry Not Working

**Check 1: Verify Retry Enabled**
```bash
node -e "console.log('Retry enabled:', process.env.TEST_RETRY_ENABLED)"
```

**Check 2: Check Max Retries**
```bash
node -e "console.log('Max retries:', process.env.TEST_MAX_RETRIES)"
```

**Check 3: Verify Test Throws Errors**
- Retry only works if test function throws an error
- Assertions must throw on failure

### Nightly Tests Not Running

**Check 1: Verify Workflow File**
```bash
cat .github/workflows/nightly-tests.yml
```

**Check 2: Check GitHub Actions**
- Go to repository → Actions tab
- Look for "Nightly Test Suite"
- Check for error messages

**Check 3: Verify Cron Schedule**
- Cron: `0 2 * * *` = 2 AM UTC daily
- Convert to your timezone

**Check 4: Manual Trigger**
- Actions → Nightly Test Suite → Run workflow
- Select test suite and run

---

## Next Steps

1. **Configure Notifications**
   - Copy `.env.example` to `.env`
   - Add your webhook URLs
   - Run `npm run notify:test`

2. **Enable Test Retry**
   - Set `TEST_RETRY_ENABLED=true` in `.env`
   - Configure `TEST_MAX_RETRIES` and `TEST_RETRY_DELAY`
   - Run tests and observe retry behavior

3. **Setup Nightly Tests**
   - Push workflow file to repository
   - Add `SLACK_WEBHOOK_URL` to GitHub secrets
   - Wait for scheduled run or trigger manually

4. **Monitor Results**
   - Check notification channels
   - Review Allure reports
   - Download artifacts for failed tests

---

## Related Documentation

- [Test Suites](./test-suites.md) - Comprehensive test suite documentation
- [Device Management](./device-management.md) - Device registry and management
- [Parallel Testing](./parallel-testing.md) - Parallel test execution guide
- [Video Recording](./video-recording.md) - Video capture configuration

---

**Mobile Test Farm** - Quick Wins Documentation
Version 1.0 - December 2025
