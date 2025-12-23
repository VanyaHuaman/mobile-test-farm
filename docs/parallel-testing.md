# Parallel Test Execution

Run tests across multiple devices simultaneously for faster test execution and better device coverage.

## Overview

The Parallel Test Runner allows you to execute the same test across multiple devices at the same time, dramatically reducing total test execution time and enabling efficient cross-platform testing.

### Key Benefits

- **Faster Execution** - Run tests on iOS and Android simultaneously instead of sequentially
- **Better Coverage** - Test across multiple device types, OS versions, and screen sizes at once
- **Scalable** - Easily add more devices to your test matrix
- **Efficient** - Maximize resource utilization during test runs
- **CI/CD Ready** - Perfect for automated testing pipelines

## Quick Start

### Basic Usage

```bash
# Run on all registered devices
npm run test:parallel:all tests/specs/login.spec.js

# Run on iOS devices only
npm run test:parallel:ios tests/specs/login.spec.js

# Run on Android devices only
npm run test:parallel:android tests/specs/login.spec.js

# Run on specific devices
npm run test:parallel tests/specs/login.spec.js "iPhone 16 Pro Simulator" "Android Emulator (Pixel 64)"
```

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│           ParallelTestRunner (Main Process)             │
│  - Device allocation                                    │
│  - Process orchestration                                │
│  - Result aggregation                                   │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Child      │ │  Child      │ │  Child      │
│  Process 1  │ │  Process 2  │ │  Process 3  │
│             │ │             │ │             │
│  Device 1   │ │  Device 2   │ │  Device 3   │
│  (iOS)      │ │  (Android)  │ │  (iOS)      │
└─────────────┘ └─────────────┘ └─────────────┘
        │               │               │
        ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Appium     │ │  Appium     │ │  Appium     │
│  Session 1  │ │  Session 2  │ │  Session 3  │
└─────────────┘ └─────────────┘ └─────────────┘
```

### Execution Flow

1. **Device Allocation** - Validates and allocates devices for testing
2. **Parallel Spawn** - Spawns child processes for each device
3. **Independent Execution** - Each test runs independently on its device
4. **Result Collection** - Results are collected as tests complete
5. **Summary Report** - Aggregated results are displayed

## Command Reference

### npm Scripts

| Command | Description |
|---------|-------------|
| `npm run test:parallel:all <test-file>` | Run on all registered devices |
| `npm run test:parallel:ios <test-file>` | Run on all iOS devices |
| `npm run test:parallel:android <test-file>` | Run on all Android devices |
| `npm run test:parallel <test-file> <device1> <device2>` | Run on specific devices |
| `npm run test:parallel:help` | Show help information |

### Arguments

- `<test-file>` - Path to the test file to execute (e.g., `tests/specs/login.spec.js`)
- `<device1> <device2>` - Device IDs or friendly names (e.g., `"iPhone 16 Pro Simulator"`)

## Examples

### Example 1: Cross-Platform Testing

Run login test on both iOS and Android:

```bash
npm run test:parallel:all tests/specs/login.spec.js
```

**Output:**
```
🚀 Starting Parallel Test Execution
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 Test File: login.spec.js
📱 Devices: 2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 Device Allocation:
   • Android Emulator (Pixel 64) (android)
   • iPhone 16 Pro Simulator (ios)

🏁 [Android Emulator (Pixel 64)] Starting test...
🏁 [iPhone 16 Pro Simulator] Starting test...
✅ [Android Emulator (Pixel 64)] Test passed (11.85s)
✅ [iPhone 16 Pro Simulator] Test passed (12.36s)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Test Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Android Emulator (Pixel 64) (android): PASSED (11.85s)
✅ iPhone 16 Pro Simulator (ios): PASSED (12.36s)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 2 | Passed: 2 | Failed: 0 | Pass Rate: 100%
Total Duration: 12.36s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 All tests passed!
```

### Example 2: Platform-Specific Testing

Test only on iOS devices:

```bash
npm run test:parallel:ios tests/specs/login.spec.js
```

### Example 3: Specific Devices

Test on two specific devices:

```bash
npm run test:parallel tests/specs/login.spec.js \
  "iPhone 16 Pro Simulator" \
  "Android Emulator (Pixel 64)"
```

### Example 4: Multiple Test Files

Run multiple tests in parallel (using shell loop):

```bash
for test in tests/specs/*.spec.js; do
  npm run test:parallel:all "$test"
done
```

## Performance Comparison

### Sequential vs Parallel Execution

**Sequential Execution:**
```bash
npm run test:login:pom "iPhone 16 Pro Simulator"  # 12s
npm run test:login:pom "Android Emulator"          # 12s
# Total: ~24 seconds
```

**Parallel Execution:**
```bash
npm run test:parallel:all tests/specs/login.spec.js
# Total: ~12 seconds (2x faster!)
```

### Scaling Benefits

| Devices | Sequential Time | Parallel Time | Speedup |
|---------|----------------|---------------|---------|
| 1       | 12s           | 12s           | 1x      |
| 2       | 24s           | 12s           | 2x      |
| 4       | 48s           | 12s           | 4x      |
| 8       | 96s           | 12s           | 8x      |

*Note: Assumes sufficient system resources (CPU, memory) and Appium server capacity*

## Best Practices

### 1. Device Selection

- Use `test:parallel:all` for comprehensive testing
- Use `test:parallel:ios` or `test:parallel:android` for platform-specific tests
- Specify devices explicitly when testing specific configurations

### 2. Resource Management

**System Resources:**
- Each parallel test consumes CPU and memory
- Recommended: Max 4-6 parallel tests on typical developer machines
- Monitor system resources during execution

**Appium Server:**
- Ensure Appium can handle multiple simultaneous sessions
- Default configuration supports multiple sessions
- Consider separate Appium instances for high concurrency

### 3. Test Independence

**Critical: Tests must be independent!**

✅ **Good:**
- Each test uses its own test data
- Tests don't share state
- Tests can run in any order

❌ **Bad:**
- Tests depend on previous test results
- Tests modify shared resources
- Tests assume specific execution order

### 4. Debugging

When tests fail in parallel mode:

1. **Review Summary** - Check which device(s) failed
2. **Run Individually** - Test the failing device alone:
   ```bash
   npm run test:login:pom "failing-device-name"
   ```
3. **Check Screenshots** - Failure screenshots are saved per device
4. **Check Logs** - Review Appium logs for specific sessions

## Programmatic Usage

You can also use the ParallelTestRunner class directly in your code:

```javascript
const ParallelTestRunner = require('./lib/parallel-runner');
const path = require('path');

async function runTests() {
  const runner = new ParallelTestRunner();

  const testFile = path.join(__dirname, 'tests/specs/login.spec.js');
  const devices = [
    'iphone-16-pro-simulator',
    'android-emulator-1'
  ];

  const summary = await runner.runTestsInParallel(testFile, devices, {
    showOutput: false
  });

  console.log(`Pass Rate: ${summary.passed}/${summary.totalTests}`);
  process.exit(summary.failed > 0 ? 1 : 0);
}

runTests();
```

## Troubleshooting

### Problem: "Device not found"

**Solution:** Ensure devices are registered
```bash
npm run devices:list
npm run devices:sync  # Discover and sync devices
```

### Problem: "Connection refused" or "Session creation failed"

**Causes:**
- Appium server not running
- Device not available
- Network/firewall issues

**Solutions:**
```bash
# 1. Ensure Appium is running
npm run appium

# 2. Verify devices are online
adb devices                    # For Android
xcrun simctl list | grep Booted  # For iOS

# 3. Check Appium logs for details
```

### Problem: Tests timeout or hang

**Causes:**
- Device is busy or frozen
- App installation failed
- Network issues

**Solutions:**
```bash
# 1. Restart devices
adb reboot                     # Android
xcrun simctl shutdown all && xcrun simctl boot <UDID>  # iOS

# 2. Clean install the app
# 3. Increase timeout in config/test.config.js
```

### Problem: Inconsistent results

**Causes:**
- Tests are not independent
- Race conditions
- Shared resources

**Solution:** Review test design for independence

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Parallel Mobile Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: macos-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'

      - name: Install dependencies
        run: npm install

      - name: Start Appium
        run: npm run appium &

      - name: Set up Android Emulator
        # ... Android emulator setup

      - name: Set up iOS Simulator
        run: xcrun simctl boot "iPhone 16 Pro"

      - name: Sync devices
        run: npm run devices:sync

      - name: Run parallel tests
        run: npm run test:parallel:all tests/specs/login.spec.js

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: screenshots/
```

## API Reference

### ParallelTestRunner Class

#### Methods

**`runTestsInParallel(testFile, deviceIds, options)`**
- **Parameters:**
  - `testFile` (string) - Path to test file
  - `deviceIds` (Array<string>) - Device IDs or names
  - `options` (Object) - Optional configuration
    - `showOutput` (boolean) - Show live test output (default: false)
- **Returns:** Promise<Object> - Test summary
- **Throws:** Error if test file not found or devices invalid

**`getAllDevices()`**
- **Returns:** Array<string> - All registered device IDs

**`getDevicesByPlatform(platform)`**
- **Parameters:** `platform` (string) - 'ios' or 'android'
- **Returns:** Array<string> - Device IDs for platform

### Summary Object

```typescript
{
  totalTests: number,
  passed: number,
  failed: number,
  duration: string,
  results: Array<{
    device: string,
    platform: string,
    status: 'passed' | 'failed',
    duration: string,
    error?: string
  }>
}
```

## Advanced Usage

### Custom Device Pool

Create a custom device pool for specific test scenarios:

```javascript
const runner = new ParallelTestRunner();
const deviceManager = runner.deviceManager;

// Get only tablets
const tablets = deviceManager.getAllDeviceIds()
  .map(id => deviceManager.getDevice(id))
  .filter(device => device.model.includes('Tablet') || device.model.includes('iPad'));

const tabletIds = tablets.map(t => t.id);
await runner.runTestsInParallel('tests/tablet-test.js', tabletIds);
```

### Conditional Platform Testing

```javascript
const platform = process.env.TEST_PLATFORM || 'all';
const devices = platform === 'all'
  ? runner.getAllDevices()
  : runner.getDevicesByPlatform(platform);

await runner.runTestsInParallel(testFile, devices);
```

## Next Steps

- [Device Management Guide](device-management.md)
- [Page Object Model Guide](page-object-model.md)
- [CI/CD Setup](ci-cd-integration.md)
- [Test Reporting](test-reporting.md)
