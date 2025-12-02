#!/bin/bash

# Script to check connected devices and their status

echo "========================================"
echo "Mobile Test Farm - Device Status Check"
echo "========================================"
echo ""

echo "Checking Android devices..."
echo "----------------------------"
if command -v adb &> /dev/null; then
    adb devices -l

    # Get device details
    for device in $(adb devices | grep -v "List" | awk '{print $1}'); do
        if [ ! -z "$device" ]; then
            echo ""
            echo "Device: $device"
            echo "  Model: $(adb -s $device shell getprop ro.product.model)"
            echo "  Android Version: $(adb -s $device shell getprop ro.build.version.release)"
            echo "  SDK: $(adb -s $device shell getprop ro.build.version.sdk)"
        fi
    done
else
    echo "ADB not found. Please install android-tools"
fi

echo ""
echo "Checking iOS devices..."
echo "-----------------------"
if command -v idevice_id &> /dev/null; then
    devices=$(idevice_id -l)
    if [ -z "$devices" ]; then
        echo "No iOS devices found"
    else
        for device in $devices; do
            echo "Device: $device"
            echo "  Name: $(ideviceinfo -u $device -k DeviceName 2>/dev/null)"
            echo "  Model: $(ideviceinfo -u $device -k ProductType 2>/dev/null)"
            echo "  iOS Version: $(ideviceinfo -u $device -k ProductVersion 2>/dev/null)"
            echo ""
        done
    fi
else
    echo "libimobiledevice not found. Please install libimobiledevice-utils"
fi

echo ""
echo "========================================"
