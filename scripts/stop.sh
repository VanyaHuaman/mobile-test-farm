#!/bin/bash

# Stop the Mobile Test Farm

cd "$(dirname "$0")/.."

echo "Stopping Mobile Test Farm..."

if command -v podman-compose &> /dev/null; then
    podman-compose down
else
    podman compose down
fi

echo "Mobile Test Farm stopped."
