# MITM Proxy Setup for Transparent API Mocking

This guide explains how to set up and use MITM proxy for transparent API mocking in your mobile tests.

## Architecture Overview

The MITM (Man-In-The-Middle) proxy approach provides **completely transparent** API mocking:

```
App (unchanged)
  ↓ Makes HTTPS request to jsonplaceholder.typicode.com
Device Proxy (configured via Appium)
  ↓ Sends to MITM Proxy
MITM Proxy (mitmproxy)
  ↓ Intercepts & redirects
Mockoon Server
  ↓ Returns mock response
```

### Key Benefits

✅ **App doesn't know about mocking** - No code changes, no rebuilds
✅ **Works with HTTPS** - Full SSL/TLS support
✅ **Test framework controls everything** - Easy to toggle on/off
✅ **Transparent to app** - App uses real URLs, proxy redirects

## Installation

### 1. Install mitmproxy

**macOS:**
```bash
brew install mitmproxy
```

**Linux/Windows:**
```bash
pip install mitmproxy
```

Verify installation:
```bash
mitmdump --version
```

### 2. Run Setup Script

This will generate certificates and install them on your devices:

```bash
# Setup both Android and iOS
npm run setup:mitm

# Android only
npm run setup:mitm:android

# iOS only
npm run setup:mitm:ios
```

### 3. Manual Certificate Trust (One-Time)

**Android Emulator:**
The setup script pushes the certificate to your emulator. You need to install it:

1. Open **Settings** on emulator
2. Go to **Security → Encryption & credentials → Install a certificate**
3. Select **CA certificate**
4. Tap **Install anyway**
5. Navigate to **SD card** or **Downloads**
6. Select `mitmproxy-ca-cert.cer`
7. Name it "mitmproxy" and tap OK

**iOS Simulator:**
The setup script automatically installs the certificate. You just need to trust it:

1. Open **Settings** app
2. Go to **General → About → Certificate Trust Settings**
3. Enable the toggle for "mitmproxy"

## How It Works

### Automatic Behavior

When you run a test with mocking enabled (e.g., `users-mock-simple`), the test framework automatically:

1. ✅ Starts Mockoon server on port 3001
2. ✅ Starts MITM proxy on port 8888
3. ✅ Configures device to use proxy
4. ✅ App traffic is transparently redirected
5. ✅ Cleans up everything after test

**You don't need to do anything!** The app code remains unchanged.

### Configuration in test-variants.js

Mock tests are already configured:

```javascript
{
  id: 'users-mock-simple',
  name: 'Users - Mock API (Simple)',
  mockConfig: {
    enabled: true,
    mockFile: 'mocks/environments/jsonplaceholder-simple.json'
  }
}
```

When `mockConfig.enabled = true`:
- Mockoon starts automatically
- MITM proxy starts automatically
- Device proxy is configured automatically
- Everything is cleaned up automatically

## Running Tests with Mocking

### From Dashboard

1. Open dashboard: `npm run dashboard`
2. Select a mock test variant (e.g., "Users - Mock API (Simple)")
3. Click "Run Test"
4. ✨ Magic happens - app uses Mockoon transparently!

### From Command Line

```bash
# Run with specific mock variant
npm run test:users  # Uses default config

# Alternatively, modify test.config.js to enable mocking:
# config.mocking.enabled = true
```

## Troubleshooting

### Certificate Not Trusted

**Symptom:** Tests fail with SSL errors

**Solution:**
- Android: Manually install certificate (see step 3 above)
- iOS: Enable certificate in Trust Settings
- Verify: `ls ~/.mitmproxy/` should show certificate files

### Proxy Not Working

**Symptom:** App still hits real API

**Solution:**
1. Check if mitmproxy is running: `ps aux | grep mitmdump`
2. Check device proxy settings:
   - Android: `adb shell settings get global http_proxy`
   - Should show: `localhost:8888`
3. Check mitmproxy logs for intercepted requests

### MITM Proxy Fails to Start

**Symptom:** Error: "mitmproxy: command not found"

**Solution:**
```bash
# Install mitmproxy
brew install mitmproxy

# Or
pip install mitmproxy
```

### Device Can't Connect

**Symptom:** App has no network connectivity

**Solution:**
1. Clear device proxy: `adb shell settings put global http_proxy :0`
2. Restart emulator
3. Run setup again

## Advanced Usage

### Custom Target Domains

Edit `TestBase.js` to intercept different domains:

```javascript
this.mitmProxyManager.startProxy({
  mockoonPort: 3001,
  targetDomains: [
    'jsonplaceholder.typicode.com',
    'api.example.com',
    'another-api.com'
  ]
});
```

### Verbose Logging

Enable verbose logging to see all intercepted requests:

```javascript
// In test.config.js
config.mocking.verbose = true
```

### View Traffic in Browser

Start mitmproxy with web interface:

```bash
# Instead of mitmdump, use mitmweb
mitmweb -s mocks/mitm-scripts/mitm-*.py --web-port 8081
```

Then open `http://localhost:8081` to see all traffic!

## Files Created

- `lib/MitmProxyManager.js` - MITM proxy management class
- `bin/setup-mitm.js` - Certificate setup script
- `mocks/mitm-scripts/*.py` - Generated Python scripts for mitmproxy
- `~/.mitmproxy/` - Certificate files (auto-generated)

## FAQ

**Q: Does the app need to be rebuilt?**
A: No! The app code is unchanged. Proxy works at network level.

**Q: Can I use this with physical devices?**
A: Yes, but you need to:
1. Set proxy manually in WiFi settings
2. Point to your computer's IP (not localhost)
3. Install certificate on device

**Q: Can I use this with cloud device farms?**
A: Yes, but only with providers that support tunneling:

**✅ Supported (with tunneling):**
- **BrowserStack** - Use BrowserStack Local binary to create tunnel
- **Sauce Labs** - Use Sauce Connect to tunnel to localhost
- **AWS Device Farm** - Use VPC endpoints for private network access
- **LambdaTest** - Use LambdaTest tunnel for localhost access

**❌ Not Supported (requires public deployment):**
- **Firebase Test Lab** - No tunneling support, deploy Mockoon publicly
- **Perfecto** - Limited tunneling capabilities
- **Kobiton** - No direct localhost tunneling

For unsupported providers, deploy Mockoon to a public server (Heroku, AWS, etc.) or use hybrid testing (local devices with mocks, cloud devices with real API).

**Q: Does this slow down tests?**
A: Minimal overhead. MITM proxy is very fast. Mockoon responses are faster than real API.

**Q: Can I record real API responses?**
A: Yes! Enable recording mode in MITM proxy script to capture real traffic.

## Next Steps

- ✅ Run setup: `npm run setup:mitm`
- ✅ Trust certificates (manual step)
- ✅ Run a mock test variant
- ✅ Watch it work transparently!

For more details, see:
- [Mockoon Documentation](../mocks/README.md)
- [Test Variants Configuration](../config/test-variants.js)
