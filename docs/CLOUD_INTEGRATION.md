# Cloud Device Farm Integration

The Mobile Test Farm now supports **hybrid testing** across local devices and cloud device farms from multiple providers!

## Supported Providers

| Provider | Type | Pricing | Status |
|----------|------|---------|--------|
| **BrowserStack** | Subscription | ~$200-500/month | ✅ Fully Supported |
| **Sauce Labs** | Subscription | ~$200-500/month | ✅ Fully Supported |
| **AWS Device Farm** | Pay-per-use | $0.17/min (1000 free min/month) | ✅ Fully Supported |
| **Firebase Test Lab** | Freemium | Free: 10 physical/day, 5 virtual/day | ✅ Fully Supported |

## Quick Start

### 1. Configure Provider Credentials

Add credentials to your `.env` file:

```bash
# BrowserStack
BROWSERSTACK_USERNAME=your-username
BROWSERSTACK_ACCESS_KEY=your-access-key

# Sauce Labs
SAUCELABS_USERNAME=your-username
SAUCELABS_ACCESS_KEY=your-access-key
SAUCELABS_DATA_CENTER=us-west-1  # or us-east-4, eu-central-1, apac-southeast-1

# AWS Device Farm
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-west-2
AWS_DEVICE_FARM_PROJECT_ARN=arn:aws:devicefarm:...

# Firebase Test Lab
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
FIREBASE_PROJECT_ID=your-project-id
```

### 2. Run Tests on Cloud Devices

**Via Command Line:**
```bash
# BrowserStack iPhone
npm run test:form browserstack-iPhone-15-Pro

# Sauce Labs Android
npm run test:login saucelabs-Google-Pixel-8

# AWS Device Farm
npm run test:form aws-Galaxy-S23

# Firebase Test Lab
npm run test:login firebase-Pixel-7
```

**Via Dashboard:**
1. Start dashboard: `npm run dashboard`
2. Go to **Devices** tab - you'll see cloud devices listed
3. Go to **Tests** tab
4. Select cloud device from the dropdown
5. Click **Run Test**

### 3. View Available Cloud Devices

**Programmatically:**
```javascript
const DeviceManager = require('./lib/device-manager');
const deviceManager = new DeviceManager();

// Discover cloud devices
const cloudDevices = await deviceManager.discoverCloudDevices();
console.log(`Found ${cloudDevices.length} cloud devices`);

// List all devices (local + cloud)
const allDevices = await deviceManager.listAllDevices({ includeCloud: true });
```

**Via CLI:**
```bash
# TODO: Add CLI command to list cloud devices
```

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Test Scripts                         │
│              (No changes needed!)                       │
└────────────────────┬───────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────┐
│                  TestBase                               │
│  - Detects local vs cloud by device ID prefix          │
│  - Routes to correct Appium hub automatically           │
└────────────────────┬───────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────┐
│               DeviceManager                             │
│  - Unified API for local and cloud devices             │
│  - getCapabilitiesUnified()                            │
│  - getHubUrl()                                          │
└───────┬──────────────────────┬─────────────────────────┘
        │                      │
┌───────▼────────┐   ┌────────▼───────────────┐
│ Local Devices  │   │  CloudDeviceManager    │
│ - Emulators    │   │  - BrowserStack        │
│ - Simulators   │   │  - Sauce Labs          │
│ - Real Devices │   │  - AWS Device Farm     │
└────────────────┘   │  - Firebase Test Lab   │
                     └────────────────────────┘
```

### Device ID Convention

Cloud devices are identified by a provider prefix:

- `browserstack-*` → BrowserStack devices
- `saucelabs-*` → Sauce Labs devices
- `aws-*` → AWS Device Farm devices
- `firebase-*` → Firebase Test Lab devices

**Examples:**
- `browserstack-iPhone-15-Pro`
- `saucelabs-Google-Pixel-8`
- `aws-Galaxy-S23-Ultra`
- `firebase-Pixel-7-Pro`

### Seamless Switching

The same test code works for **both local and cloud devices**:

```javascript
// This exact code works for BOTH local and cloud!
const deviceManager = new DeviceManager();
const testBase = new TestBase();

// Local device
await testBase.initializeDriver('android-emulator-1', appConfig);

// Cloud device - NO CODE CHANGES!
await testBase.initializeDriver('browserstack-iPhone-15', appConfig);
```

## Use Cases

### 1. Overflow Testing
Run tests on cloud devices when all local devices are busy:

```javascript
const localDevices = deviceManager.getActiveDeviceIds();
const deviceToUse = localDevices.length > 0
  ? localDevices[0]
  : 'browserstack-Pixel-8';  // Fallback to cloud

await testBase.runTest(deviceToUse, appConfig, testFunction);
```

### 2. Broader Device Coverage
Test on devices you don't own:

```bash
# Test on latest iPhone (don't need to buy one!)
npm run test:form browserstack-iPhone-16-Pro-Max

# Test on specific Android version
npm run test:login saucelabs-Samsung-Galaxy-S24
```

### 3. Parallel Testing
Run tests across local AND cloud simultaneously:

```bash
# Local
npm run test:form android-emulator-1 &
npm run test:form iphone-16-pro-simulator &

# Cloud
npm run test:form browserstack-Pixel-8 &
npm run test:form saucelabs-iPhone-15 &

wait  # Wait for all to complete
```

### 4. CI/CD Integration
Use cloud devices in CI where local devices aren't available:

```yaml
# .github/workflows/test.yml
jobs:
  test:
    steps:
      - name: Test on Cloud Devices
        env:
          BROWSERSTACK_USERNAME: ${{ secrets.BROWSERSTACK_USERNAME }}
          BROWSERSTACK_ACCESS_KEY: ${{ secrets.BROWSERSTACK_ACCESS_KEY }}
        run: |
          npm run test:all browserstack-iPhone-15
```

## Provider-Specific Features

### BrowserStack
- **Best For:** Enterprise teams, comprehensive device coverage
- **Devices:** 3000+ real devices
- **Features:** Video recording, network throttling, geolocation
- **Hub URL:** `https://hub-cloud.browserstack.com/wd/hub`

### Sauce Labs
- **Best For:** Enterprise teams, multi-region testing
- **Devices:** 2000+ real devices
- **Features:** Multi-region (US, EU, APAC), detailed analytics
- **Regions:** us-west-1, us-east-4, eu-central-1, apac-southeast-1

### AWS Device Farm
- **Best For:** Pay-as-you-go, AWS ecosystem integration
- **Devices:** 300+ real devices
- **Features:** 1000 free device-minutes/month
- **Cost:** $0.17/minute after free tier

### Firebase Test Lab
- **Best For:** Cost-effective testing, Android focus
- **Devices:** 50+ devices (mostly Android)
- **Features:** Best free tier (10 physical/day, 5 virtual/day)
- **Best For:** Android apps

## Dashboard Features

The web dashboard shows:

✅ **Local Devices Section**
- Your registered emulators/simulators/physical devices
- Full device details
- Remove button

✅ **Cloud Devices Section**
- Available cloud devices from all enabled providers
- Provider badges (BrowserStack, Sauce Labs, AWS, Firebase)
- Platform icons
- Availability status
- Distinct visual styling

✅ **Device Selection**
- All devices (local + cloud) available in test execution
- Visual indicators for device type
- Easy switching between local and cloud

## Cost Optimization

### Free Tier Strategy
1. **Start with Firebase Test Lab** (10 physical devices/day free)
2. **Use AWS Device Farm** (1000 minutes/month free)
3. **Upgrade to BrowserStack/Sauce Labs** for broader coverage

### Cost-Effective Testing
```javascript
// Use cloud only for devices you don't have locally
const preferredDevice = localDevices.includes('Pixel-8')
  ? 'android-emulator-1'  // Free local device
  : 'firebase-Pixel-8';    // Free cloud device (if under daily limit)
```

## Troubleshooting

### No Cloud Devices Showing
1. Check credentials in `.env`
2. Restart dashboard to reload configuration
3. Check provider status: `GET /api/cloud/providers`

### Connection Failed
- **BrowserStack/Sauce Labs:** Verify username and access key
- **AWS:** Check IAM permissions and project ARN
- **Firebase:** Verify service account and gcloud CLI installed

### Slow Device Discovery
- Cloud device discovery is cached
- Limit shown to 20 devices in dashboard (performance)
- Full list available via API

## Best Practices

1. **Use Local Devices First** - Faster and free
2. **Cloud for Coverage** - Devices you don't own
3. **Parallel Execution** - Mix local + cloud for speed
4. **Cost Monitoring** - Track cloud device usage
5. **Provider Selection** - Match provider to your needs

## Next Steps

- [X] Cloud provider integration
- [X] Hybrid local + cloud testing
- [X] Dashboard visualization
- [ ] Parallel execution framework
- [ ] Cost tracking dashboard
- [ ] Automatic device selection (smart routing)
- [ ] Cloud device filtering/search

## API Reference

See [API.md](./API.md) for full API documentation.

---

**Built with ❤️ by Mobile Test Farm**
