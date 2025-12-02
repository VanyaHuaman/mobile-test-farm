# Mobile Device Proxy Setup Guide

This guide explains how to configure your mobile devices to route traffic through mitmproxy for testing with mocked APIs.

## Overview

```
Mobile Device → mitmproxy (proxy) → Mockoon (mock) or Real API
                    ↓
              Web UI (localhost:8081)
```

## Why Use a Proxy?

- ✅ Intercept all app traffic without modifying the app
- ✅ Route specific endpoints to mock server
- ✅ Record real API traffic for test data
- ✅ Debug API issues with full visibility
- ✅ Test error scenarios and edge cases
- ✅ Mix real and mock APIs in the same test

## Prerequisites

- mitmproxy and Mockoon containers running
- Mobile device on same network as server
- Device can reach server IP address

## Step 1: Start the Services

```bash
cd ~/mobile-test-farm
./scripts/start.sh
```

Verify services are running:
```bash
podman ps | grep -E "mitmproxy|mockoon"
```

You should see:
- `mitmproxy` on ports 8080 (proxy) and 8081 (web UI)
- `mockoon` on port 3000

## Step 2: Get Server IP Address

```bash
# Linux
hostname -I | awk '{print $1}'

# Or
ip addr show | grep "inet " | grep -v 127.0.0.1
```

Example: `192.168.1.100`

## Step 3: Install mitmproxy Certificate

### Generate Certificate (First Time Only)

```bash
# Start mitmproxy briefly to generate certificates
podman exec -it mitmproxy mitmdump

# Press Ctrl+C after a few seconds

# Certificates are now in ./mocks/mitmproxy/
```

### Android Certificate Installation

**Method 1: Download from Device**

1. Configure device proxy (see Step 4)
2. Open browser on device
3. Navigate to: `http://mitm.it`
4. Tap "Android"
5. Download certificate
6. Go to Settings → Security → Install certificate → CA certificate
7. Select downloaded certificate
8. Name it "mitmproxy"

**Method 2: Manual Transfer**

1. Copy certificate from server:
   ```bash
   # The .cer file is for Android
   ls -la mocks/mitmproxy/mitmproxy-ca-cert.cer
   ```

2. Transfer to device:
   ```bash
   adb push mocks/mitmproxy/mitmproxy-ca-cert.cer /sdcard/Download/
   ```

3. On device:
   - Settings → Security → Install from storage
   - Navigate to Downloads
   - Select `mitmproxy-ca-cert.cer`
   - Name: "mitmproxy"
   - Use for: VPN and apps

**Android 7+ Note:**
Apps targeting Android 7+ don't trust user certificates by default. You may need to:
- Use system certificate (requires root)
- Modify app to trust user certificates (requires app rebuild)
- Use debug builds (usually trust user certificates)

### iOS Certificate Installation

1. Copy certificate from server:
   ```bash
   # The .pem file works for iOS
   ls -la mocks/mitmproxy/mitmproxy-ca-cert.pem
   ```

2. **Transfer certificate to device:**
   - Email it to yourself and open on device
   - Upload to cloud storage and download
   - Use AirDrop from Mac
   - Or host via web server:
     ```bash
     cd mocks/mitmproxy
     python3 -m http.server 8888
     # On device, browse to http://<server-ip>:8888/mitmproxy-ca-cert.pem
     ```

3. **Install profile:**
   - Tap the downloaded certificate
   - iOS prompts "Profile Downloaded"
   - Settings → Profile Downloaded → Install
   - Enter device passcode
   - Tap Install (confirm)

4. **Trust certificate:**
   - Settings → General → About
   - Scroll to bottom: Certificate Trust Settings
   - Enable "mitmproxy" certificate
   - Tap Continue

## Step 4: Configure Device Proxy

### Android

1. Open Settings → Network & Internet → Wi-Fi
2. Long press your connected Wi-Fi network
3. Tap "Modify network" or "Manage network settings"
4. Tap "Advanced options"
5. Proxy: Select "Manual"
6. Enter:
   - **Proxy hostname:** `192.168.1.100` (your server IP)
   - **Proxy port:** `8080`
7. Save

**Alternative (for testing apps only):**
```bash
# Set proxy via ADB
adb shell settings put global http_proxy <server-ip>:8080

# Remove proxy
adb shell settings put global http_proxy :0
```

### iOS

1. Settings → Wi-Fi
2. Tap (i) icon next to connected network
3. Scroll down to HTTP PROXY
4. Tap "Configure Proxy"
5. Select "Manual"
6. Enter:
   - **Server:** `192.168.1.100` (your server IP)
   - **Port:** `8080`
   - **Authentication:** Off
7. Save

## Step 5: Verify Setup

### Test with Browser

1. Open browser on device
2. Visit: `http://httpbin.org/get`
3. You should see the request details

### Check mitmproxy Web UI

1. On your computer, open: `http://localhost:8081`
2. You should see requests from your mobile device
3. Click on a request to see details

### Test with Your App

1. Open your app on the device
2. Perform actions that trigger API calls
3. Check mitmproxy web UI to see requests
4. Requests matching patterns in `route_to_mockoon.py` go to Mockoon
5. Others go to real API

## Routing Scripts

The project includes several mitmproxy scripts:

### 1. **route_to_mockoon.py** (Default)

Routes specific endpoints to Mockoon:

```python
# Edit mocks/scripts/route_to_mockoon.py
MOCK_ENDPOINTS = [
    r'^/api/v1/auth/login$',
    r'^/api/v1/products.*',
    # Add your endpoints here
]
```

### 2. **conditional_mock.py**

Route based on headers:

```bash
# In your test, add header to request
X-Mock-Mode: mock    # Route to Mockoon
X-Mock-Mode: real    # Use real API
```

To use:
```bash
# Update compose.yml to use this script instead
--scripts /scripts/conditional_mock.py
```

### 3. **fallback_mock.py**

Real API first, fallback to mock on error:

```bash
# Update compose.yml
--scripts /scripts/fallback_mock.py
```

### 4. **selective_record.py**

Record API traffic for later conversion to mocks:

```bash
# Update compose.yml
--scripts /scripts/selective_record.py

# Recordings saved to: mocks/mitmproxy/recordings.jsonl
```

## Switching Between Scripts

Edit `compose.yml`:

```yaml
services:
  mitmproxy:
    command: >
      mitmweb
      --web-host 0.0.0.0
      --set block_global=false
      --scripts /scripts/YOUR_SCRIPT.py
```

Then restart:
```bash
podman restart mitmproxy
```

**Or use multiple scripts:**
```yaml
--scripts /scripts/route_to_mockoon.py
--scripts /scripts/fallback_mock.py
```

## Testing Modes

### Mode 1: All Mocked (Fastest)

Don't use proxy, point app directly to Mockoon:

```
App → Mockoon (port 3000)
```

Configure app to use: `http://<server-ip>:3000`

### Mode 2: Selective Mocking (Recommended)

Use proxy with routing:

```
App → mitmproxy → Some to Mockoon, some to Real API
```

Configure app to use proxy: `<server-ip>:8080`

### Mode 3: All Real with Recording

```
App → mitmproxy → Real API (record everything)
```

Use `selective_record.py` script

### Mode 4: Real with Fallback

```
App → mitmproxy → Real API (fallback to mock on error)
```

Use `fallback_mock.py` script

## Troubleshooting

### Certificate Errors

**Error:** "Your connection is not private" / SSL errors

**Solution:**
1. Verify certificate is installed
2. Check certificate is trusted (iOS: Certificate Trust Settings)
3. Restart device after installing certificate
4. For Android 7+, ensure app trusts user certificates

### No Traffic in mitmproxy

**Check:**
1. Device proxy is configured correctly
2. Server IP is reachable from device (`ping <server-ip>`)
3. Port 8080 is not blocked by firewall
4. mitmproxy container is running

**Test connectivity:**
```bash
# From device browser, try to reach proxy
http://<server-ip>:8080

# Should show mitmproxy info or error
```

### Proxy Not Working

**Android:**
```bash
# Check proxy settings
adb shell settings get global http_proxy

# Should show: <ip>:8080
```

**iOS:**
- Verify proxy under Wi-Fi settings
- Try forgetting and reconnecting to Wi-Fi

### Requests Not Being Mocked

**Check:**
1. Endpoint pattern matches in `route_to_mockoon.py`
2. Mockoon has mock for that endpoint
3. Check mitmproxy web UI logs

**Debug:**
```bash
# Check mitmproxy logs
podman logs mitmproxy -f

# Should see: [MOCK] or [REAL] for each request
```

### Mockoon Returns 404

**Check:**
1. Endpoint in Mockoon config matches exactly
2. HTTP method matches (GET, POST, etc.)
3. Test Mockoon directly:
   ```bash
   curl http://localhost:3000/api/v1/auth/login
   ```

## Disabling Proxy

### Android

**Method 1:**
- Settings → Wi-Fi → Modify network → Proxy → None

**Method 2:**
```bash
adb shell settings put global http_proxy :0
```

### iOS

- Settings → Wi-Fi → (i) → Configure Proxy → Off

## Advanced: Proxy on Different Network

If mobile device can't reach server directly:

### Option 1: Port Forwarding

```bash
# Forward from device to server via ADB
adb reverse tcp:8080 tcp:8080
adb reverse tcp:3000 tcp:3000

# Configure device to use: localhost:8080
```

### Option 2: VPN/Tunnel

Use ngrok or similar to expose proxy:

```bash
# Install ngrok
# Forward mitmproxy port
ngrok http 8080

# Use ngrok URL as proxy in device
```

## Security Notes

- ⚠️ mitmproxy intercepts ALL traffic including sensitive data
- ⚠️ Only use on test devices, not personal devices
- ⚠️ Remove certificate when done testing
- ⚠️ Don't expose mitmproxy to public internet
- ⚠️ Use test accounts, not real credentials

## Best Practices

1. **Use dedicated test devices** - Don't proxy personal devices
2. **Remove certificates after testing** - Clean up when done
3. **Use test accounts** - Never use real user credentials
4. **Document mock patterns** - Comment your endpoint patterns
5. **Version control mocks** - Save Mockoon configs in git
6. **Regular cert rotation** - Regenerate certs periodically

## Quick Reference

```bash
# Start services
./scripts/start.sh

# Check services
podman ps | grep -E "mitmproxy|mockoon"

# View mitmproxy logs
podman logs mitmproxy -f

# View Mockoon logs
podman logs mockoon -f

# Restart mitmproxy (after config change)
podman restart mitmproxy

# Access web UIs
# mitmproxy: http://localhost:8081
# Mockoon test: curl http://localhost:3000/api/v1/products

# Remove proxy from Android
adb shell settings put global http_proxy :0
```

## Next Steps

1. Configure your devices following steps above
2. Test with browser first
3. Verify in mitmproxy web UI
4. Test with your app
5. Adjust mock patterns in `route_to_mockoon.py`
6. Create additional Mockoon endpoints as needed

See [docs/mocking-guide.md](mocking-guide.md) for more on creating mocks.
