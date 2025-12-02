#!/bin/bash

# Start usbmuxd for iOS device communication
echo "Starting usbmuxd..."
usbmuxd

# Wait for usbmuxd to initialize
sleep 2

# List connected iOS devices
echo "Connected iOS devices:"
idevice_id -l

# Check for devices
if [ -z "$(idevice_id -l)" ]; then
    echo "Warning: No iOS devices detected"
else
    echo "iOS device info:"
    ideviceinfo
fi

# Start Appium server
echo "Starting Appium server on port ${APPIUM_PORT:-4724}..."
appium \
    --address ${APPIUM_HOST:-0.0.0.0} \
    --port ${APPIUM_PORT:-4724} \
    --relaxed-security \
    --log-timestamp \
    --log-no-colors
