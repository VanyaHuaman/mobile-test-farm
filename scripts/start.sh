#!/bin/bash

# Start the Mobile Test Farm

cd "$(dirname "$0")/.."

echo "Starting Mobile Test Farm..."

if command -v podman-compose &> /dev/null; then
    podman-compose up -d
else
    podman compose up -d
fi

echo ""
echo "Mobile Test Farm is starting..."
echo ""
echo "Services:"
echo "  - Selenium Hub: http://localhost:4444"
echo "  - Appium (Android): http://localhost:4723"
echo "  - Appium (iOS): http://localhost:4724"
echo "  - Web UI: http://localhost:8080"
echo ""
echo "Check status with: podman ps"
echo "View logs with: podman logs <container-name>"
echo "Stop with: ./scripts/stop.sh"
