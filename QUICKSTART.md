# Mobile Test Farm - Quick Start Guide

Get your mobile test farm up and running in 5 steps.

## Prerequisites

- Linux server with Podman installed
- 3 USB ports (or powered USB hub)
- Your mobile devices: Android Tablet, Pixel 4 XL, iPhone SE

## Step 1: Setup Devices

### Android Devices (Tablet & Pixel 4 XL)

1. Enable Developer Options: Settings → About → Tap "Build number" 7 times
2. Enable USB Debugging: Settings → Developer Options → USB Debugging (ON)
3. Connect via USB and authorize the computer

See [docs/setup-android.md](docs/setup-android.md) for detailed instructions.

### iOS Device (iPhone SE)

1. Enable Developer Mode: Settings → Privacy & Security → Developer Mode (ON)
2. Connect via USB and tap "Trust This Computer"
3. Install WebDriverAgent (see iOS setup guide)

See [docs/setup-ios.md](docs/setup-ios.md) for detailed instructions.

## Step 2: Install and Setup

```bash
cd ~/mobile-test-farm

# Run setup script
chmod +x scripts/*.sh
./scripts/setup.sh
```

This will:
- Check prerequisites
- Build all containers
- Prepare the environment

## Step 3: Configure Devices

```bash
# Check connected devices
./scripts/check-devices.sh
```

Update `config/devices.yml` with your device UDIDs and details.

## Step 4: Start the Farm

```bash
./scripts/start.sh
```

Services will start:
- Selenium Hub: http://localhost:4444
- Appium (Android): http://localhost:4723
- Appium (iOS): http://localhost:4724
- Web UI: http://localhost:8080

## Step 5: Run Your First Test

Open http://localhost:8080 in your browser:

1. Select devices to test on
2. Select test to run
3. Click "Run Selected Tests"
4. View results in real-time

## Writing Your First Test

See [docs/writing-tests.md](docs/writing-tests.md) for:
- Example test code
- Page Object Model pattern
- Best practices
- Troubleshooting

## Common Commands

```bash
# Start the farm
./scripts/start.sh

# Stop the farm
./scripts/stop.sh

# Check device status
./scripts/check-devices.sh

# View container logs
podman logs appium-android
podman logs appium-ios
podman logs test-runner

# Check container status
podman ps
```

## Troubleshooting

### No devices detected

1. Check USB connections
2. Verify USB debugging is enabled
3. Check device authorization
4. Run: `./scripts/check-devices.sh`

### Container won't start

```bash
# Check logs
podman logs <container-name>

# Rebuild container
podman-compose build <service-name>
podman-compose up -d <service-name>
```

### Web UI not accessible

```bash
# Check if container is running
podman ps | grep test-runner

# Check logs
podman logs test-runner

# Verify port is not in use
netstat -tlnp | grep 8080
```

## Next Steps

1. **Configure your apps** - Update device configurations with your app details
2. **Write tests** - Create test files in `tests/android/` and `tests/ios/`
3. **Organize tests** - Use Page Object Model for better maintainability
4. **Automate** - Set up scheduled test runs
5. **Monitor** - Review test results and screenshots

## Project Structure

```
mobile-test-farm/
├── compose.yml              # Container orchestration
├── docker/                  # Container definitions
│   ├── appium-android/
│   ├── appium-ios/
│   └── test-runner/
├── tests/                   # Your test files
│   ├── android/
│   ├── ios/
│   └── common/
├── config/                  # Configuration files
│   ├── devices.yml         # Device definitions
│   └── capabilities.yml    # Appium capabilities
├── results/                 # Test results
│   ├── screenshots/
│   ├── videos/
│   └── reports/
├── web-ui/                  # Web dashboard
├── scripts/                 # Utility scripts
└── docs/                    # Documentation
```

## Support

- Check [PLAN.md](PLAN.md) for architecture details
- Review [docs/](docs/) for comprehensive guides
- See test examples in `tests/` directory

## Tips

- Keep devices charged and connected
- Disable screen lock on devices
- Run tests regularly to catch issues early
- Use descriptive test names
- Take screenshots on failures
- Keep tests independent and isolated
