# Video Recording

Automatically record test execution videos for enhanced debugging and documentation.

## Overview

The Mobile Test Farm includes built-in video recording capabilities using Appium's screen recording API. Videos are automatically recorded during test execution and saved for failed tests by default.

**Features:**
- Automatic video recording on test failure
- Optional recording for all tests
- MP4 video format
- Platform-specific optimizations (Android/iOS)
- Allure report integration
- Automatic cleanup of old videos
- CI/CD artifact support

## Quick Start

### Enable Video Recording

Video recording can be enabled in two modes:

**Mode 1: Record only on failure (default)**
```bash
# Set in .env or environment
VIDEOS_ON_FAILURE=true

# Or via config (already set by default)
```

**Mode 2: Record all tests**
```bash
# Set in .env
VIDEOS_ENABLED=true
```

### Run Tests with Video Recording

```bash
# Enable video on failure (default behavior)
npm run test:login:pom

# Enable video for all tests
VIDEOS_ENABLED=true npm run test:login:pom

# Videos will be saved to ./videos/ directory
```

### View Recorded Videos

```bash
# List recorded videos
ls -lh videos/

# Open latest video (macOS)
open videos/*.mp4 | tail -1

# Videos are named with pattern:
# {testName}-{SUCCESS|FAILURE}-{platform}-{timestamp}.mp4
```

## Configuration

Video recording is configured in `config/test.config.js`:

```javascript
videos: {
  enabled: process.env.VIDEOS_ENABLED === 'true',        // Record all tests
  onFailure: process.env.VIDEOS_ON_FAILURE !== 'false',  // Record only failures (default: true)
  quality: process.env.VIDEO_QUALITY || 'medium',        // low, medium, high
  path: process.env.VIDEOS_PATH || './videos',           // Video output directory
  maxVideos: parseInt(process.env.MAX_VIDEOS || '10', 10), // Keep last N videos
}
```

### Environment Variables

Create a `.env` file to customize video settings:

```bash
# Video Recording
VIDEOS_ENABLED=true              # Record all tests (default: false)
VIDEOS_ON_FAILURE=true           # Record on failure (default: true)
VIDEO_QUALITY=medium             # low, medium, high
VIDEOS_PATH=./videos             # Output directory
MAX_VIDEOS=10                    # Keep last N videos
```

## Video Quality Settings

### Android Options

```javascript
{
  videoQuality: 'medium',    // low, medium, high
  videoSize: '720x1280',     // Resolution
  bitRate: '4000000',        // 4 Mbps
  timeLimit: '600',          // 10 minutes max
}
```

**Quality Presets:**
- **low**: 480x854, 2 Mbps - Smaller files, lower quality
- **medium**: 720x1280, 4 Mbps - Balanced (default)
- **high**: 1080x1920, 8 Mbps - Best quality, larger files

### iOS Options

```javascript
{
  videoQuality: 'medium',    // low, medium, high
  videoScale: '75:100',      // 75% scale
  videoFps: '10',            // 10 FPS
  timeLimit: '600',          // 10 minutes max
}
```

**Quality Presets:**
- **low**: 50% scale, 5 FPS - Smaller files
- **medium**: 75% scale, 10 FPS - Balanced (default)
- **high**: 100% scale, 30 FPS - Best quality

## Usage in Tests

### Using TestBase (Recommended)

The TestBase class handles video recording automatically:

```javascript
const TestBase = require('../helpers/TestBase');
const config = require('../../config/test.config');

async function testLogin() {
  const testBase = new TestBase();

  await testBase.runTest('android-emulator-1', {
    'appium:app': config.apps.android.debug,
  }, async () => {
    // Your test code here
    // Video recording happens automatically:
    // - Starts when test begins
    // - Stops when test ends
    // - Saves only if test fails (or if VIDEOS_ENABLED=true)
    // - Attaches to Allure report on failure

    const loginPage = new LoginPage(testBase.driver, testBase.getPlatform());
    await loginPage.enterUsername('demo');
    await loginPage.clickLogin();
    // ... rest of test
  }, 'login-test');
}
```

### Manual Video Recording

For advanced use cases, use VideoRecorder directly:

```javascript
const VideoRecorder = require('../helpers/VideoRecorder');

async function customTest() {
  const driver = await remote({ /* capabilities */ });
  const recorder = new VideoRecorder(driver, 'android', 'custom-test');

  // Start recording
  await recorder.startRecording();

  try {
    // Your test actions
    await performTestSteps();

    // Test passed - stop and discard video
    await recorder.stopRecording();
  } catch (error) {
    // Test failed - stop and save video
    const videoPath = await recorder.stopRecording('FAILURE');
    console.log(`Video saved: ${videoPath}`);
    throw error;
  }
}
```

### Custom Recording Options

```javascript
const recorder = new VideoRecorder(driver, platform, testName);

// Start with custom options
await recorder.startRecording({
  quality: 'high',
  timeLimit: '300',      // 5 minutes
  bitRate: '8000000',    // 8 Mbps (Android)
  videoFps: '30',        // 30 FPS (iOS)
});
```

## Video Management

### Automatic Cleanup

Videos are automatically cleaned up to prevent disk space issues:

```javascript
// Cleanup happens after each test in TestBase
// Keeps only the last N videos (default: 10)

VideoRecorder.cleanupOldVideos(10);  // Keep last 10 videos
```

### Manual Cleanup

```javascript
const VideoRecorder = require('./tests/helpers/VideoRecorder');

// Clean up old videos
VideoRecorder.cleanupOldVideos(5);   // Keep last 5 videos

// Get total video size
const totalSize = VideoRecorder.getTotalVideosSize();
console.log(`Total videos size: ${totalSize} MB`);

// Get individual video size
const size = VideoRecorder.getVideoSize('./videos/test.mp4');
console.log(`Video size: ${size} MB`);
```

### Delete All Videos

```bash
# Remove all videos
rm -rf videos/

# Or use npm script
npm run clean:videos  # If added to package.json
```

## Allure Report Integration

Videos are automatically attached to Allure reports when tests fail:

```javascript
// Automatic attachment in TestBase
if (!testPassed) {
  this.allure.attachVideo('Test Execution Video', videoPath);
}

// Manual attachment
const AllureReporter = require('../helpers/AllureReporter');
AllureReporter.attachVideo('Custom Video', videoPath);
```

View videos in Allure reports:
1. Run tests
2. Generate report: `npm run report:generate`
3. Open report: `npm run report:open`
4. Navigate to failed tests
5. Click on video attachment to play

## CI/CD Integration

### GitHub Actions

Videos are automatically uploaded as artifacts in CI/CD:

```yaml
- name: Run tests
  run: npm run test:parallel:all tests/specs/login.spec.js
  env:
    VIDEOS_ON_FAILURE: true

- name: Upload Videos
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: test-videos
    path: videos/
    retention-days: 14
```

**Access CI Videos:**
1. Go to GitHub Actions run
2. Scroll to "Artifacts" section
3. Download "test-videos" artifact
4. Extract and play MP4 files

### Environment-Specific Settings

```yaml
# Development - Record all tests
- name: Run tests (dev)
  env:
    VIDEOS_ENABLED: true
    VIDEO_QUALITY: high

# CI - Record only failures
- name: Run tests (CI)
  env:
    VIDEOS_ON_FAILURE: true
    VIDEO_QUALITY: medium
    MAX_VIDEOS: 5
```

## Troubleshooting

### Videos Not Recording

**Problem:** No videos generated after test

**Solutions:**

1. **Check if recording is enabled:**
   ```bash
   # In .env
   VIDEOS_ON_FAILURE=true
   # or
   VIDEOS_ENABLED=true
   ```

2. **Verify platform support:**
   ```javascript
   // Video recording requires:
   // - Android: UiAutomator2 driver 4.0+
   // - iOS: XCUITest driver 3.0+

   // Check driver versions
   appium driver list
   ```

3. **Check video directory permissions:**
   ```bash
   ls -ld videos/
   chmod 755 videos/
   ```

### Recording Fails to Start

**Problem:** Error when starting recording

**Solutions:**

```javascript
// Check if driver is ready
if (!driver) {
  console.error('Driver not initialized');
}

// Check platform
if (platform !== 'android' && platform !== 'ios') {
  console.error('Unsupported platform');
}

// Try lower quality settings
await recorder.startRecording({
  quality: 'low',
  timeLimit: '300',
});
```

### Large Video Files

**Problem:** Videos consuming too much disk space

**Solutions:**

1. **Use lower quality:**
   ```bash
   VIDEO_QUALITY=low npm run test
   ```

2. **Reduce retention:**
   ```bash
   MAX_VIDEOS=3 npm run test
   ```

3. **Record only failures:**
   ```bash
   # Disable VIDEOS_ENABLED
   # Keep VIDEOS_ON_FAILURE=true (default)
   ```

4. **Manual cleanup:**
   ```bash
   # Delete videos older than 7 days
   find videos/ -name "*.mp4" -mtime +7 -delete
   ```

### Video Not Attached to Allure

**Problem:** Video not appearing in Allure report

**Solutions:**

```javascript
// Ensure video file exists before attaching
if (fs.existsSync(videoPath)) {
  AllureReporter.attachVideo('Test Video', videoPath);
} else {
  console.error('Video file not found:', videoPath);
}

// Check Allure reporter is initialized
if (!AllureReporter) {
  console.error('AllureReporter not available');
}
```

### Recording Stops Prematurely

**Problem:** Video stops before test completes

**Solutions:**

1. **Increase time limit:**
   ```bash
   # Default is 600 seconds (10 minutes)
   # Increase for longer tests
   ```

   ```javascript
   await recorder.startRecording({
     timeLimit: '1800',  // 30 minutes
   });
   ```

2. **Check test duration:**
   ```javascript
   const startTime = Date.now();
   await runTest();
   const duration = (Date.now() - startTime) / 1000;
   console.log(`Test took ${duration}s`);
   ```

## Performance Considerations

### Impact on Test Execution

- **Android:** Minimal overhead (~2-5% slower)
- **iOS:** Slight overhead (~5-10% slower)
- **File Size:** 1-5 MB per minute (medium quality)

### Optimization Tips

1. **Use lower quality for CI:**
   ```yaml
   env:
     VIDEO_QUALITY: low  # Faster encoding
   ```

2. **Record only failures:**
   ```bash
   # Default behavior - most efficient
   VIDEOS_ON_FAILURE=true
   ```

3. **Limit retention:**
   ```bash
   MAX_VIDEOS=5  # Keep fewer videos
   ```

4. **Parallel execution:**
   ```bash
   # Videos recorded independently per device
   npm run test:parallel:all
   ```

## Best Practices

### 1. Production Use

```bash
# .env.production
VIDEOS_ENABLED=false         # Don't record all tests
VIDEOS_ON_FAILURE=true       # Only record failures
VIDEO_QUALITY=medium         # Balanced quality
MAX_VIDEOS=10                # Reasonable retention
```

### 2. Development Use

```bash
# .env.development
VIDEOS_ENABLED=true          # Record everything for debugging
VIDEO_QUALITY=high           # Best quality
MAX_VIDEOS=3                 # Quick cleanup
```

### 3. CI/CD Use

```bash
# .env.ci
VIDEOS_ON_FAILURE=true       # Failures only
VIDEO_QUALITY=low            # Faster, smaller
MAX_VIDEOS=5                 # Save space
```

### 4. Video Organization

```javascript
// Use descriptive test names
await testBase.runTest(device, appConfig, testFunction, 'user-login-flow');

// Videos named: user-login-flow-FAILURE-android-2024-12-23.mp4
```

### 5. Security Considerations

```javascript
// Don't record sensitive data
if (testContainsSensitiveData) {
  // Disable video for this test
  config.videos.enabled = false;
}

// Clean up videos after sensitive tests
await runSensitiveTest();
VideoRecorder.cleanupOldVideos(0);  // Delete all
```

## Examples

### Example 1: Basic Test with Video

```javascript
const TestBase = require('../helpers/TestBase');

async function testLoginWithVideo() {
  const testBase = new TestBase();

  await testBase.runTest('android-emulator-1', {
    'appium:app': './apps/android-debug.apk',
  }, async () => {
    // Test will be recorded automatically
    await performLogin();
    await verifyHomePage();
    // Video saved only if test fails
  }, 'login-test');
}
```

### Example 2: High-Quality Recording

```javascript
const VideoRecorder = require('../helpers/VideoRecorder');

async function recordHighQualityTest() {
  const recorder = new VideoRecorder(driver, 'ios', 'demo');

  await recorder.startRecording({
    quality: 'high',
    videoFps: '30',
    timeLimit: '1800',
  });

  await performComplexTest();

  const videoPath = await recorder.stopRecording('demo-recording');
  console.log(`HD video saved: ${videoPath}`);
}
```

### Example 3: Conditional Recording

```javascript
async function testWithConditionalVideo() {
  const testBase = new TestBase();
  const recordVideo = process.env.RECORD_THIS_TEST === 'true';

  if (recordVideo) {
    config.videos.enabled = true;
  }

  await testBase.runTest(/* ... */);
}
```

## API Reference

### VideoRecorder Class

```javascript
const VideoRecorder = require('./tests/helpers/VideoRecorder');
```

#### Constructor

```javascript
new VideoRecorder(driver, platform, testName)
```

- `driver` (Object): WebDriverIO driver instance
- `platform` (String): 'android' or 'ios'
- `testName` (String): Name for video file

#### Instance Methods

**startRecording(options)**
- Starts screen recording
- Returns: `Promise<boolean>`
- Options: `{ quality, timeLimit, bitRate, videoFps, ... }`

**stopRecording(filename)**
- Stops recording and saves video
- Returns: `Promise<string|null>` - Path to saved video
- `filename` (String): Optional custom filename

**isCurrentlyRecording()**
- Check if recording in progress
- Returns: `boolean`

**getLastVideoPath()**
- Get path of last recorded video
- Returns: `string|null`

#### Static Methods

**cleanupOldVideos(keepCount)**
- Delete old videos
- `keepCount` (Number): Number of videos to keep

**getVideoSize(videoPath)**
- Get video file size in MB
- Returns: `number`

**getTotalVideosSize()**
- Get total size of all videos
- Returns: `number` (MB)

### AllureReporter.attachVideo()

```javascript
AllureReporter.attachVideo(name, video)
```

- `name` (String): Display name in report
- `video` (String|Buffer): Video path or buffer

## Resources

- [Appium Screen Recording Docs](https://appium.io/docs/en/commands/device/recording-screen/start-recording-screen/)
- [Android Recording API](https://developer.android.com/reference/android/media/MediaRecorder)
- [iOS Recording Guide](https://developer.apple.com/documentation/replaykit)
- [Video Optimization Guide](https://trac.ffmpeg.org/wiki/Encode/H.264)

## Next Steps

- Enable video recording in your tests
- Configure quality settings for your needs
- Set up CI/CD video artifact collection
- Integrate videos with Allure reports
- Implement cleanup policies

---

**Note:** Video recording requires:
- Appium 2.0+ (we use 3.1.2)
- UiAutomator2 4.0+ for Android (we use 6.7.5)
- XCUITest 3.0+ for iOS (we use 10.12.2)
