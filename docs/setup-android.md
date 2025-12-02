# Android Device Setup Guide

This guide will help you prepare your Android devices (Tablet and Pixel 4 XL) for automated testing.

## Prerequisites

- Android device with USB debugging capability
- USB cable
- Access to device settings

## Step 1: Enable Developer Options

1. Open **Settings** on your Android device
2. Scroll to **About phone** (or **About tablet**)
3. Find **Build number**
4. Tap **Build number** 7 times quickly
5. You should see a message: "You are now a developer!"

## Step 2: Enable USB Debugging

1. Go back to main **Settings**
2. Find and open **Developer options** (usually under System or at bottom of Settings)
3. Enable **USB debugging**
4. Enable **Stay awake** (keeps screen on while charging)
5. Optional but recommended:
   - Disable **Window animation scale**
   - Disable **Transition animation scale**
   - Disable **Animator duration scale**
   (These make tests run faster)

## Step 3: Connect Device to Server

1. Connect your Android device to the server via USB
2. On the device, you'll see a prompt: "Allow USB debugging?"
3. Check "Always allow from this computer"
4. Tap **OK**

## Step 4: Verify Connection

### From Server (Linux/macOS):

```bash
# Install ADB if not already installed
# Ubuntu/Debian:
sudo apt-get install android-tools-adb android-tools-fastboot

# macOS:
brew install android-platform-tools

# Check connected devices
adb devices -l
```

You should see output like:
```
List of devices attached
1234567890ABCDEF    device usb:1-1 product:coral model:Pixel_4_XL device:coral
```

### From Container:

```bash
# Check devices from appium-android container
podman exec -it appium-android adb devices
```

## Step 5: Get Device UDID

```bash
# Get device serial number (UDID)
adb devices | grep -v "List" | awk '{print $1}'
```

Copy this UDID and update `config/devices.yml`:

```yaml
- id: pixel-4xl
  name: Google Pixel 4 XL
  platform: android
  udid: "1234567890ABCDEF"  # Paste your UDID here
```

## Step 6: Additional Device Information

```bash
# Get device model
adb shell getprop ro.product.model

# Get Android version
adb shell getprop ro.build.version.release

# Get SDK version
adb shell getprop ro.build.version.sdk
```

Update this information in `config/devices.yml` as well.

## Step 7: Install Test Application (when ready)

```bash
# Install APK
adb install /path/to/your-app.apk

# Verify installation
adb shell pm list packages | grep your.app.package

# Uninstall (if needed)
adb uninstall your.app.package
```

## Troubleshooting

### Device not appearing in `adb devices`

1. **Check USB cable**: Try a different cable (some cables are charge-only)
2. **Check USB mode**: Swipe down notification panel, tap USB notification, select "File Transfer" or "PTP"
3. **Revoke USB debugging authorizations**:
   - Developer options → Revoke USB debugging authorizations
   - Reconnect and authorize again
4. **Restart ADB server**:
   ```bash
   adb kill-server
   adb start-server
   ```

### "Unauthorized" device status

1. Disconnect and reconnect the device
2. The authorization prompt should appear again
3. Make sure to check "Always allow from this computer"

### Device offline

1. Run: `adb kill-server && adb start-server`
2. Unplug and replug the USB cable
3. Restart the device

### USB debugging grayed out

1. Some manufacturers require additional steps
2. **Samsung**: Disable "Auto Optimize Daily" in Device Care
3. **Xiaomi**: Enable "USB debugging (Security settings)" in Developer options
4. **Huawei**: Enable "Allow ADB debugging in charge only mode"

## Best Practices for Testing

1. **Disable automatic updates**:
   - Settings → System → Developer options → Automatic system updates (OFF)

2. **Disable screen lock**:
   - Settings → Security → Screen lock → None

3. **Keep screen on**:
   - Already enabled in Developer options

4. **Disable battery optimization** for test apps:
   - Settings → Apps → Special access → Battery optimization
   - Select app → Don't optimize

5. **Set screen timeout to maximum**:
   - Settings → Display → Screen timeout → 30 minutes

6. **Disable "Do Not Disturb"**:
   - To prevent notification interference

## Security Considerations

- USB debugging gives significant access to your device
- Only connect to trusted computers
- Consider using a dedicated device for testing
- Do not use devices with sensitive personal data

## Next Steps

1. Repeat these steps for all Android devices (Tablet and Pixel 4 XL)
2. Update `config/devices.yml` with all device UDIDs
3. Proceed to writing your first test
4. See [writing-tests.md](writing-tests.md) for test development guide
