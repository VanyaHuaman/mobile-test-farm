# Device Management

The Mobile Test Farm includes a powerful device registry system that makes managing emulators, simulators, and physical devices easy and user-friendly.

## Why Device Management?

Instead of dealing with cryptic device IDs like `emulator-5554` or `00008110-001E7C8C3AB8301E`, you can give your devices friendly names like:
- "Lenovo 11-inch Tablet"
- "Pixel 4 XL - QA Device"
- "iPhone SE - Test Device 1"

## Features

✅ **User-Friendly Names** - Give devices memorable names
✅ **Automatic Discovery** - Detect connected Android devices via ADB
✅ **Metadata Storage** - Store device info (model, OS, type, notes)
✅ **Test Integration** - Select devices by name in tests
✅ **Universal Support** - Works with emulators, simulators, and physical devices
✅ **Easy Registration** - Interactive CLI for adding devices

---

## Quick Start

### 1. List Connected Devices

```bash
npm run devices sync
```

Example output:
```
🔍 Discovered 2 Android device(s):

✅ emulator-5554 - Already registered as 'android-emulator-1'
🆕 ZY223K7LXM - NEW (not registered)
```

### 2. List Registered Devices

```bash
npm run devices list
```

Example output:
```
📱 Registered Devices:

────────────────────────────────────────────────────────────────────
✅ 🖥️  Android Emulator (Pixel 64)
   ID: android-emulator-1
   Device ID: emulator-5554
   Platform: android | Type: emulator
   Model: sdk_gphone64_arm64 | OS: Android 14
────────────────────────────────────────────────────────────────────
✅ 📱 Lenovo 11-inch Tablet
   ID: lenovo-11-inch-tablet
   Device ID: ZY223K7LXM
   Platform: android | Type: physical
   Model: Lenovo_TB-X606F | OS: Android 10
   Notes: QA Testing Device
────────────────────────────────────────────────────────────────────

Total: 2 device(s) | Active: 2
```

### 3. Register a New Device

```bash
npm run devices register
```

Interactive prompts will guide you through:
1. Select device from discovered list
2. Enter friendly name
3. Enter OS version
4. Add optional notes

Example:
```
📝 Register New Device

📋 Available unregistered devices:

[1] ZY223K7LXM (Lenovo_TB-X606F)

Select device number (or "q" to quit): 1

✅ Selected: ZY223K7LXM

Enter friendly name (e.g., "Lenovo 11-inch Tablet"): Lenovo 11-inch Tablet
Enter OS version (default: "unknown"): Android 10
Enter notes (optional): QA Testing Device

✅ Device registered successfully!
   ID: lenovo-11-inch-tablet
   Name: Lenovo 11-inch Tablet
   Device ID: ZY223K7LXM
```

---

## Using Devices in Tests

### Default Device

By default, tests use the device `android-emulator-1`:

```bash
npm run test:login
```

### Specify Device by ID

```bash
node tests/login-test.js lenovo-11-inch-tablet
```

### Specify Device by Friendly Name

```bash
node tests/login-test.js "Lenovo 11-inch Tablet"
```

(Case-insensitive matching)

---

## CLI Commands Reference

### List Devices
```bash
npm run devices list
# or
npm run devices ls
```

Lists all registered devices with their details.

### Sync Devices
```bash
npm run devices sync
```

Discovers connected Android devices and shows their registration status.

### Register Device
```bash
npm run devices register
# or
npm run devices add
```

Interactive registration process for new devices.

### Get Device Details
```bash
npm run devices get <name-or-id>
```

Examples:
```bash
npm run devices get android-emulator-1
npm run devices get "Lenovo 11-inch Tablet"
```

### Remove Device
```bash
npm run devices remove <device-id>
# or
npm run devices rm <device-id>
```

Example:
```bash
npm run devices remove lenovo-11-inch-tablet
```

### Help
```bash
npm run devices help
```

---

## Device Configuration File

Devices are stored in `config/devices.json`:

```json
{
  "devices": {
    "lenovo-11-inch-tablet": {
      "friendlyName": "Lenovo 11-inch Tablet",
      "deviceId": "ZY223K7LXM",
      "platform": "android",
      "type": "physical",
      "model": "Lenovo_TB-X606F",
      "osVersion": "Android 10",
      "active": true,
      "capabilities": {
        "platformName": "Android",
        "appium:automationName": "UiAutomator2",
        "appium:deviceName": "ZY223K7LXM"
      },
      "notes": "QA Testing Device"
    }
  },
  "metadata": {
    "lastUpdated": "2024-12-21T23:45:00Z",
    "version": "1.0.0"
  }
}
```

### Device Properties

| Property | Description | Example |
|----------|-------------|---------|
| `friendlyName` | User-friendly device name | "Lenovo 11-inch Tablet" |
| `deviceId` | ADB/iOS device identifier | "ZY223K7LXM" |
| `platform` | Operating system | "android" or "ios" |
| `type` | Device type | "emulator", "simulator", "physical" |
| `model` | Device model | "Lenovo_TB-X606F" |
| `osVersion` | OS version | "Android 10" |
| `active` | Whether device is active | true/false |
| `capabilities` | Appium capabilities | {...} |
| `notes` | Optional notes | "QA Testing Device" |

---

## Device Manager API

### Using in Node.js

```javascript
const DeviceManager = require('./lib/device-manager');

const manager = new DeviceManager();

// List all devices
const devices = manager.listDevices();

// Get active devices only
const activeDevices = manager.listActiveDevices();

// Get device by name or ID
const device = manager.getDevice('lenovo-11-inch-tablet');

// Get Appium capabilities
const capabilities = manager.getCapabilities('lenovo-11-inch-tablet', {
  'appium:app': '/path/to/app.apk',
  'appium:noReset': false,
});

// Register new device
manager.registerDevice('my-device', {
  friendlyName: 'My Device',
  deviceId: 'ABC123',
  platform: 'android',
  type: 'physical',
  model: 'Pixel 4',
  osVersion: 'Android 12',
});

// Update device
manager.updateDevice('my-device', {
  osVersion: 'Android 13',
  notes: 'Updated to Android 13',
});

// Remove device
manager.unregisterDevice('my-device');

// Discover Android devices
const discovered = manager.discoverAndroidDevices();
```

---

## Best Practices

### Naming Conventions

**Good:**
- `lenovo-11-inch-tablet`
- `pixel-4-xl-qa`
- `iphone-se-test-1`

**Avoid:**
- `device1` (not descriptive)
- `my_device` (use hyphens instead)
- `test` (too generic)

### Device Notes

Add helpful notes for your team:
- "Primary QA device - keep charged"
- "Android 10 - for backwards compatibility testing"
- "Connected to USB hub port 3"

### Active vs Inactive

Set `active: false` for devices that are:
- Temporarily disconnected
- Out for repairs
- Reserved for other purposes

This keeps them in the registry but excludes them from `listActiveDevices()`.

---

## Troubleshooting

### Device Not Detected

**Android:**
```bash
# Check if ADB can see the device
adb devices -l

# If not listed, check USB debugging is enabled
# Developer Options > USB Debugging
```

**iOS (Coming in Phase 2):**
```bash
# Check iOS device connectivity
idevice_id -l
```

### Device ID Changed

Physical devices keep the same ID, but emulators may get new IDs when restarted.

If an emulator's ID changes, you'll need to update or re-register it.

### Permission Issues

If ADB shows "unauthorized":
1. Check the device for the authorization prompt
2. Select "Always allow from this computer"
3. Click OK

---

## Future Enhancements

Coming soon:
- iOS device discovery
- Automatic device health checks
- Device pools for parallel testing
- Cloud device integration
- Device capability templates
- Web-based device management UI

---

## Examples

### Test on All Active Devices

```javascript
const DeviceManager = require('./lib/device-manager');
const manager = new DeviceManager();

const devices = manager.listActiveDevices();

for (const device of devices) {
  console.log(`Testing on ${device.friendlyName}...`);
  // Run your test with device.id
}
```

### Filter Devices by Platform

```javascript
const androidDevices = manager
  .listActiveDevices()
  .filter(d => d.platform === 'android');

const iosDevices = manager
  .listActiveDevices()
  .filter(d => d.platform === 'ios');
```

### Filter by Type

```javascript
const physicalDevices = manager
  .listActiveDevices()
  .filter(d => d.type === 'physical');

const emulators = manager
  .listActiveDevices()
  .filter(d => d.type === 'emulator' || d.type === 'simulator');
```

---

## See Also

- [Writing Tests](./writing-tests.md)
- [Phase 1 Completion Report](./phase1-completion.md)
- [Setup Android](./setup-android.md)
