# Mobile Test Farm

Automated mobile device testing infrastructure for running screen tests and end-to-end flows across multiple physical devices.

## Quick Overview

Run automated tests on your Android and iOS devices from a centralized server using containerized Appium instances.

**Supported Devices:**
- Android Tablet
- Google Pixel 4 XL
- iPhone SE

## Features

- Run tests on multiple devices in parallel
- Web UI for test selection and execution
- Automated test scheduling
- Screenshot and video capture
- Test result reporting and history
- USB-connected physical devices
- **API mocking with Mockoon and mitmproxy**
- **Traffic interception and recording**
- **Mix real and mock APIs in tests**

## Project Status

Currently in planning phase. See [PLAN.md](PLAN.md) for detailed implementation roadmap.

## Quick Start

(Coming after Phase 1 implementation)

```bash
# Clone and setup
cd ~/mobile-test-farm

# Start the test farm
podman-compose up -d

# Access web UI
# http://localhost:8080
```

## Prerequisites

### Server Requirements
- Linux server with Podman installed
- USB ports for 3 devices (or powered USB hub)
- 4GB+ RAM recommended
- 20GB+ disk space

### Device Requirements
- Android devices with USB debugging enabled
- iOS device with Developer Mode enabled
- All devices connected via USB

### Software
- Podman 4.0+
- Podman Compose
- Python 3.9+

## Project Structure

```
mobile-test-farm/
├── docker/          # Container definitions
├── tests/           # Test scripts
├── web-ui/          # Dashboard interface
├── config/          # Device and capability configs
├── mocks/           # Mock API configurations
│   ├── mockoon/     # Mockoon mock configs
│   ├── mitmproxy/   # Certificates and recordings
│   └── scripts/     # mitmproxy routing scripts
├── results/         # Test results and artifacts
├── scripts/         # Utility scripts
└── docs/            # Documentation
```

## Documentation

- [PLAN.md](PLAN.md) - Detailed project plan and architecture
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [docs/setup-android.md](docs/setup-android.md) - Android device setup
- [docs/setup-ios.md](docs/setup-ios.md) - iOS device setup
- [docs/setup-proxy.md](docs/setup-proxy.md) - Proxy configuration for mocking
- [docs/writing-tests.md](docs/writing-tests.md) - Test development guide
- [docs/mocking-guide.md](docs/mocking-guide.md) - API mocking guide
- [mocks/README.md](mocks/README.md) - Mocking infrastructure overview

## Roadmap

- [ ] Phase 1: Foundation and Android support
- [ ] Phase 2: Multi-device and iOS support
- [ ] Phase 3: Test management and UI
- [ ] Phase 4: Automation and polish

## License

(To be determined)

## Contributing

(To be determined)
