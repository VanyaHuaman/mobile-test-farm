#!/bin/bash

# Mobile Test Farm Setup Script

set -e

echo "========================================"
echo "Mobile Test Farm - Setup"
echo "========================================"
echo ""

# Check if running on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "Warning: This script is designed for Linux systems"
    echo "Some features may not work on other platforms"
    echo ""
fi

# Check for Podman
echo "Checking prerequisites..."
if ! command -v podman &> /dev/null; then
    echo "Error: Podman is not installed"
    echo "Please install Podman: https://podman.io/getting-started/installation"
    exit 1
fi
echo "✓ Podman installed: $(podman --version)"

# Check for Podman Compose
if ! command -v podman-compose &> /dev/null; then
    echo "Warning: podman-compose not found"
    echo "Install with: pip install podman-compose"
    echo "Or use 'podman compose' if using Podman 4.0+"
fi

# Check for ADB (optional at this stage)
if command -v adb &> /dev/null; then
    echo "✓ ADB installed: $(adb --version | head -n1)"
else
    echo "⚠ ADB not found (optional for host-side debugging)"
fi

# Check for iOS tools (optional)
if command -v idevice_id &> /dev/null; then
    echo "✓ libimobiledevice installed"
else
    echo "⚠ libimobiledevice not found (needed for iOS devices)"
fi

echo ""
echo "Building containers..."
echo "----------------------"

# Build containers
cd "$(dirname "$0")/.."

if command -v podman-compose &> /dev/null; then
    podman-compose build
else
    podman compose build
fi

echo ""
echo "✓ Containers built successfully"
echo ""
echo "========================================"
echo "Setup complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Connect your devices via USB"
echo "2. Enable USB debugging (Android) / Developer Mode (iOS)"
echo "3. Run: ./scripts/check-devices.sh"
echo "4. Update config/devices.yml with device UDIDs"
echo "5. Start the farm: podman-compose up -d"
echo "6. Access web UI: http://localhost:8080"
echo ""
