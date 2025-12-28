# iOS Device Setup Guide

This guide will help you prepare your iPhone SE for automated testing with Appium.

## Prerequisites

- iPhone SE (or other iOS device)
- USB Lightning cable
- macOS computer (recommended for iOS testing)
- Apple ID (free or paid developer account)

## Important Notes

iOS testing is more complex than Android due to Apple's security requirements:
- Requires WebDriverAgent to be installed on the device
- May require a paid Apple Developer account ($99/year) for device provisioning
- Free accounts have limitations (7-day app signing, limited devices)

## Step 1: Enable Developer Mode (iOS 16+)

1. Open **Settings** on your iPhone
2. Go to **Privacy & Security**
3. Scroll to **Developer Mode**
4. Toggle **Developer Mode** ON
5. Restart your device when prompted
6. After restart, confirm Developer Mode activation

**Note**: For iOS 15 and earlier, Developer Mode doesn't exist. Skip this step.

## Step 2: Trust the Computer

1. Connect your iPhone to the server via USB
2. Unlock your iPhone
3. A prompt will appear: "Trust This Computer?"
4. Tap **Trust**
5. Enter your device passcode if prompted

## Step 3: Install libimobiledevice (Linux)

### Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install -y \
    libimobiledevice-utils \
    usbmuxd \
    libimobiledevice6 \
    ifuse \
    ideviceinstaller
```

### macOS:
```bash
brew install libimobiledevice
brew install ideviceinstaller
```

## Step 4: Verify Device Connection

```bash
# Check connected iOS devices
idevice_id -l

# Get device information
ideviceinfo

# Get specific details
ideviceinfo -k DeviceName
ideviceinfo -k ProductType
ideviceinfo -k ProductVersion
```

You should see output with your device details.

## Step 5: Get Device UDID

```bash
# Get UDID
idevice_id -l
```

Copy this UDID and update `config/devices.yml`:

```yaml
- id: iphone-se
  name: iPhone SE
  platform: ios
  udid: "00008030-XXXXXXXXXXXX"  # Paste your UDID here
  platformVersion: "16.0"  # Your iOS version
```

## Step 6: Apple Developer Account Setup

### Option A: Free Apple Developer Account (Limitations)

1. Create an Apple ID at https://appleid.apple.com (if you don't have one)
2. Apps signed with free account expire after 7 days
3. Limited to 3 devices
4. Requires re-signing weekly

### Option B: Paid Apple Developer Account (Recommended)

1. Enroll at https://developer.apple.com/programs/enroll/
2. Cost: $99/year
3. No expiration on app signing
4. Support for 100 devices
5. Required for distribution

## Step 7: Install Xcode (macOS only)

If running on macOS:

```bash
# Install Xcode from App Store
# Or install Command Line Tools only:
xcode-select --install
```

## Step 8: WebDriverAgent Setup

WebDriverAgent is required for iOS automation with Appium.

### Automatic Installation (Preferred):

Appium 2.0+ can auto-install WebDriverAgent:

```bash
# Install Appium XCUITest driver
appium driver install xcuitest

# The driver will attempt to install WebDriverAgent automatically
# when you run your first test
```

### Manual Installation (if automatic fails):

1. Clone WebDriverAgent:
```bash
cd ~
git clone https://github.com/appium/WebDriverAgent.git
cd WebDriverAgent
```

2. Install dependencies:
```bash
./Scripts/bootstrap.sh
```

3. Open in Xcode:
```bash
open WebDriverAgent.xcodeproj
```

4. Configure signing:
   - Select **WebDriverAgentRunner** target
   - Go to **Signing & Capabilities**
   - Select your Team (Apple Developer account)
   - Change bundle identifier (e.g., `com.yourname.WebDriverAgentRunner`)

5. Build for your device:
```bash
xcodebuild -project WebDriverAgent.xcodeproj \
  -scheme WebDriverAgentRunner \
  -destination 'platform=iOS,id=YOUR_DEVICE_UDID' \
  test
```

## Step 9: Trust Developer Certificate on Device

1. On iPhone, go to **Settings**
2. Go to **General** → **VPN & Device Management**
3. Find your Apple ID or developer certificate
4. Tap it and select **Trust**

## Troubleshooting

### Device not detected

1. **Check cable**: Use official Apple cable or MFi-certified cable
2. **Check trust**: Make sure you trusted the computer
3. **Restart usbmuxd**:
   ```bash
   sudo systemctl restart usbmuxd
   ```
4. **Check iOS version**: Very old or beta iOS may have issues

### "Could not connect to lockdownd" error

1. Disconnect and reconnect device
2. Re-trust the computer
3. Restart device
4. Check usbmuxd is running:
   ```bash
   sudo systemctl status usbmuxd
   ```

### WebDriverAgent won't install

1. **Check bundle ID**: Must be unique
2. **Check provisioning**: Ensure proper team and signing
3. **Check Developer Mode**: Must be enabled (iOS 16+)
4. **Free account**: Re-sign every 7 days

### "Developer Mode Required" error

iOS 16+ requires Developer Mode. See Step 1.

### Certificate/Provisioning issues

1. **Revoke certificates** in Apple Developer portal
2. **Clean Xcode**: Product → Clean Build Folder
3. **Delete derived data**:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```
4. Try automatic signing in Xcode

## Best Practices

1. **Keep device unlocked during tests**:
   - Disable auto-lock: Settings → Display & Brightness → Auto-Lock → Never

2. **Disable notifications**:
   - Settings → Notifications → Turn off for test apps

3. **Disable automatic updates**:
   - Settings → General → Software Update → Automatic Updates (OFF)

4. **Keep device charged**:
   - Low battery can interfere with testing

5. **Use dedicated test device**:
   - Don't use personal device with important data

## Security Considerations

- Developer Mode and debugging access pose security risks
- Only connect to trusted computers
- Consider using a dedicated testing device
- Disable Developer Mode when not testing

## Limitations with Free Apple Developer Account

- Apps expire after 7 days (requires weekly re-signing)
- Maximum 3 devices per account
- Cannot distribute apps
- Some entitlements not available

For serious testing, paid account is recommended.

## Next Steps

1. Ensure WebDriverAgent is installed and trusted
2. Update `config/devices.yml` with device UDID and iOS version
3. Write your first iOS test
4. See [writing-tests.md](writing-tests.md) for test development guide

## Useful Commands

```bash
# List all iOS devices
idevice_id -l

# Get device info
ideviceinfo -k DeviceName
ideviceinfo -k ProductVersion

# Install app
ideviceinstaller -i app.ipa

# List installed apps
ideviceinstaller -l

# Get device logs
idevicesyslog

# Screenshot
idevicescreenshot screenshot.png
```
