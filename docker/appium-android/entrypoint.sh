#!/bin/bash

# Start ADB server
echo "Starting ADB server..."
adb start-server

# Wait for ADB to initialize
sleep 2

# List connected devices
echo "Connected Android devices:"
adb devices -l

# Start Appium server
echo "Starting Appium server on port ${APPIUM_PORT:-4723}..."
appium \
    --address ${APPIUM_HOST:-0.0.0.0} \
    --port ${APPIUM_PORT:-4723} \
    --allow-insecure chromedriver_autodownload \
    --relaxed-security \
    --log-timestamp \
    --log-no-colors
