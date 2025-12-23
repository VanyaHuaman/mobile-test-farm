# CI/CD Integration Guide

Automate your mobile testing with GitHub Actions. Run tests automatically on every commit, pull request, and deploy.

## Overview

The Mobile Test Farm includes pre-configured GitHub Actions workflows that:
- Run tests automatically on push and PR
- Test on both Android and iOS platforms
- Provide parallel execution across devices
- Upload test artifacts (screenshots, logs)
- Display results in PR comments and GitHub UI
- Run on macOS runners with full mobile dev tooling

## Quick Start

### 1. Enable GitHub Actions

The workflows are already configured in `.github/workflows/`. Simply push your code to GitHub and they'll run automatically.

```bash
git push origin master
```

### 2. View Test Results

- Go to your repository on GitHub
- Click the "Actions" tab
- View running or completed workflows
- Check test results and download artifacts

### 3. Status Badges

Add status badges to your README to show test status:

```markdown
[![Mobile Test Farm CI](https://github.com/YOUR_USERNAME/mobile-test-farm/actions/workflows/mobile-tests.yml/badge.svg)](https://github.com/YOUR_USERNAME/mobile-test-farm/actions/workflows/mobile-tests.yml)
```

## Available Workflows

### 1. Full Mobile Test Suite (`mobile-tests.yml`)

Runs complete test suite on both Android and iOS platforms in parallel.

**Triggers:**
- Push to master, main, or develop branches
- Pull requests to master, main, or develop
- Manual workflow dispatch

**What it does:**
1. Sets up Node.js 22, Java 17, Android SDK
2. Creates and starts Android emulator (Pixel 6, API 34)
3. Boots iOS Simulator (iPhone 16 Pro)
4. Installs Appium 3.1.2 with UiAutomator2 and XCUITest drivers
5. Builds Android APK and iOS app (if app repo available)
6. Discovers and registers devices automatically
7. Runs tests in parallel across both platforms
8. Uploads test artifacts (screenshots, logs)

**Runtime:** ~30-45 minutes

**Cost:** Free on public repos, uses GitHub Actions minutes on private repos

---

### 2. Android Tests Only (`test-android.yml`)

Focused Android testing for faster feedback.

**Triggers:** Same as full suite

**What it does:**
- Sets up Android emulator only
- Runs Android-specific tests
- Faster execution (~15-20 minutes)

**Use when:**
- Android-specific changes
- Faster feedback needed
- iOS testing not required

---

### 3. iOS Tests Only (`test-ios.yml`)

Focused iOS testing for faster feedback.

**Triggers:** Same as full suite

**What it does:**
- Sets up iOS Simulator only
- Runs iOS-specific tests
- Faster execution (~15-20 minutes)

**Use when:**
- iOS-specific changes
- Faster feedback needed
- Android testing not required

## Workflow Configuration

### Environment Variables

Create `.env` file in CI (done automatically by workflows):

```bash
ANDROID_APP_DEBUG=./apps/android-debug.apk
IOS_APP_SIMULATOR=./apps/ios-debug.app
APPIUM_HOST=localhost
APPIUM_PORT=4723
```

### Secrets

No secrets required for basic setup. Add these if needed:

- `GITHUB_TOKEN` - Auto-provided by GitHub Actions
- `SLACK_WEBHOOK_URL` - For Slack notifications (optional)
- `FIREBASE_TOKEN` - For Firebase Test Lab integration (optional)

### Customization

Edit workflow files in `.github/workflows/`:

```yaml
# Change Android API level
- name: Install Android SDK components
  run: |
    sdkmanager "system-images;android-34;google_apis;x86_64"
    # Change to android-33, android-35, etc.

# Change iOS device
- name: Boot iOS Simulator
  run: |
    # Change "iPhone 16 Pro" to "iPhone 15", "iPad Pro", etc.
    SIMULATOR_UDID=$(xcrun simctl list devices available | grep "iPhone 16 Pro" ...)

# Change test timeouts
timeout-minutes: 45  # Increase for slower tests
```

## Viewing Test Results

### 1. Workflow Summary

In GitHub Actions UI:
- ✅ Green checkmark = Tests passed
- ❌ Red X = Tests failed
- 🟡 Yellow dot = Tests running

Click on a workflow run to see:
- Job execution logs
- Test output
- Device information
- Timing breakdown

### 2. Test Artifacts

Each workflow run uploads artifacts:

**Available artifacts:**
- `test-results` - Screenshots from failed tests
- `appium-logs` - Appium server logs
- `emulator-logs` - Android emulator logs

**Download artifacts:**
1. Click on completed workflow run
2. Scroll to "Artifacts" section
3. Click artifact name to download

**Retention:** 14-30 days (configurable)

### 3. Test Summary

Workflows generate a summary visible in the Actions tab:

```
## Test Execution Summary

- Status: Success
- Runner: macOS 14
- Node.js: 22.x
- Appium: 3.1.2

### Devices Tested
- Android Emulator (Pixel 6, API 34)
- iOS Simulator (iPhone 16 Pro)

### Screenshots
Screenshots available in artifacts
```

## CI Best Practices

### 1. Test Speed Optimization

**Use platform-specific workflows:**
```bash
# For Android changes only
git push --tags android-*

# For iOS changes only
git push --tags ios-*
```

**Cache dependencies:**
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'  # Caches node_modules
```

**Parallel execution:**
- Already enabled in workflows
- Tests run simultaneously on both platforms

### 2. Handling Flaky Tests

**Retry failed tests:**
```yaml
- name: Run tests with retry
  uses: nick-invision/retry@v2
  with:
    timeout_minutes: 10
    max_attempts: 3
    command: npm run test:parallel:all tests/specs/login.spec.js
```

**Take screenshots on failure:**
- Already configured in test framework
- Automatically uploaded as artifacts

### 3. Branch Protection

Configure branch protection rules:

1. Go to Settings → Branches
2. Add rule for `master` or `main`
3. Enable "Require status checks to pass"
4. Select workflows to require:
   - Mobile Test Farm CI
   - Android Tests
   - iOS Tests

Now PRs must pass tests before merging.

### 4. PR Comments

Add test results to PR comments:

```yaml
- name: Comment PR
  uses: actions/github-script@v7
  if: github.event_name == 'pull_request'
  with:
    github-token: ${{secrets.GITHUB_TOKEN}}
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.name,
        body: '## ✅ Tests Passed!\n\nAll mobile tests completed successfully.'
      })
```

## Troubleshooting

### Emulator Not Starting

**Symptom:** Timeout waiting for emulator

**Solutions:**
```yaml
# Increase emulator boot timeout
- name: Wait for emulator
  run: |
    adb wait-for-device shell 'while [[ -z $(getprop sys.boot_completed) ]]; do sleep 1; done'
    sleep 30  # Additional wait time

# Use different emulator image
sdkmanager "system-images;android-33;google_apis;x86_64"  # Try API 33
```

### iOS Simulator Issues

**Symptom:** Simulator boot fails

**Solutions:**
```bash
# Reset simulator
xcrun simctl erase all

# Use specific simulator
SIMULATOR_UDID="EXACT-UDID-HERE"
xcrun simctl boot "$SIMULATOR_UDID"
```

### Appium Connection Errors

**Symptom:** Tests can't connect to Appium

**Solutions:**
```yaml
# Increase Appium startup wait time
- name: Start Appium server
  run: |
    nohup appium > appium.log 2>&1 &
    sleep 10  # Wait longer

    # Verify Appium is ready
    for i in {1..60}; do
      if curl -s http://localhost:4723/status; then
        break
      fi
      sleep 1
    done
```

### Out of Disk Space

**Symptom:** Build fails due to disk space

**Solutions:**
```yaml
# Clean up before build
- name: Free disk space
  run: |
    rm -rf ~/Library/Developer/Xcode/DerivedData
    rm -rf ~/.gradle/caches
    df -h  # Check available space
```

### Test Timeouts

**Symptom:** Tests exceed time limit

**Solutions:**
```yaml
# Increase job timeout
jobs:
  test:
    timeout-minutes: 60  # Increase from 45

# Increase test timeout in config
# config/test.config.js
timeouts: {
  implicit: 10000,  # Increase from 5000
  explicit: 30000,  # Increase from 10000
}
```

## Advanced Configurations

### 1. Matrix Testing

Test across multiple configurations:

```yaml
strategy:
  matrix:
    platform: [android, ios]
    api-level: [33, 34, 35]
    node-version: [20, 22]

steps:
  - name: Run tests
    run: npm run test:${{ matrix.platform }}
```

### 2. Scheduled Tests

Run tests on a schedule:

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
    - cron: '0 */6 * * *'  # Every 6 hours
```

### 3. Slack Notifications

Send notifications to Slack:

```yaml
- name: Slack Notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
    text: 'Mobile tests completed: ${{ job.status }}'
```

### 4. Firebase Test Lab Integration

Run tests on real devices via Firebase:

```yaml
- name: Run tests on Firebase Test Lab
  run: |
    gcloud firebase test android run \
      --type instrumentation \
      --app apps/android-debug.apk \
      --test apps/android-test.apk \
      --device model=Pixel6,version=34,locale=en,orientation=portrait
```

### 5. Performance Benchmarking

Track test performance over time:

```yaml
- name: Benchmark test performance
  run: |
    DURATION=$(npm run test:parallel:all | grep "Total Duration" | awk '{print $3}')
    echo "test_duration=$DURATION" >> performance.log

- name: Upload performance data
  uses: actions/upload-artifact@v4
  with:
    name: performance-data
    path: performance.log
```

## Cost Optimization

### GitHub Actions Minutes

**Free tier:**
- Public repos: Unlimited
- Private repos: 2,000 minutes/month

**macOS runners:**
- Cost: 10x Linux minutes
- 30-minute job = 300 minutes consumed

**Optimization strategies:**

1. **Use caching:**
   ```yaml
   - uses: actions/cache@v3
     with:
       path: node_modules
       key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
   ```

2. **Skip CI on docs:**
   ```yaml
   on:
     push:
       paths-ignore:
         - 'docs/**'
         - '**.md'
   ```

3. **Run platform-specific tests:**
   ```yaml
   # Only run Android tests on android/ changes
   on:
     push:
       paths:
         - 'android/**'
   ```

4. **Limit parallel jobs:**
   ```yaml
   strategy:
     max-parallel: 2  # Limit concurrent jobs
   ```

## Security Best Practices

### 1. Secrets Management

Never commit secrets:

```yaml
# Use GitHub Secrets
steps:
  - name: Deploy
    env:
      API_KEY: ${{ secrets.API_KEY }}
```

### 2. Dependency Scanning

```yaml
- name: Run security audit
  run: npm audit --production

- name: Check for vulnerabilities
  run: npx snyk test
```

### 3. Code Signing

For production builds:

```yaml
- name: Import certificates
  run: |
    echo "${{ secrets.CERT_BASE64 }}" | base64 --decode > certificate.p12
    security import certificate.p12 -P "${{ secrets.CERT_PASSWORD }}"
```

## Examples

### Complete PR Workflow

```yaml
name: PR Tests

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  test:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install dependencies
        run: npm ci

      - name: Run lint
        run: npm run lint

      - name: Run tests
        run: npm run test:parallel:all tests/specs/login.spec.js

      - name: Comment PR
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const status = '${{ job.status }}' === 'success' ? '✅ Passed' : '❌ Failed';
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.name,
              body: `## Test Results: ${status}`
            })
```

## Next Steps

- [Parallel Testing Guide](parallel-testing.md)
- [Writing Tests](writing-tests.md)
- [Device Management](device-management.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
