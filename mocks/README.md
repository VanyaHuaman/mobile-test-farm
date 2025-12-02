# Mocks Directory

This directory contains mock configurations and scripts for the mobile test farm.

## Structure

```
mocks/
├── mitmproxy/              # mitmproxy data and certificates
│   ├── mitmproxy-ca-cert.pem
│   ├── mitmproxy-ca-cert.cer
│   └── recordings.jsonl    # Recorded traffic
├── mockoon/                # Mockoon mock configurations
│   └── mobile-api-mocks.json
└── scripts/                # mitmproxy Python scripts
    ├── route_to_mockoon.py
    ├── fallback_mock.py
    ├── selective_record.py
    ├── conditional_mock.py
    ├── enhance_responses.py
    └── mitm_to_mockoon.py
```

## Quick Start

### 1. Using mitmproxy + Mockoon

```bash
# Services start automatically with ./scripts/start.sh

# Configure your mobile device:
# - Proxy: <server-ip>:8080
# - Install certificate from ./mocks/mitmproxy/

# View traffic in web UI:
open http://localhost:8081
```

### 2. Testing Direct with Mockoon

```bash
# Test Mockoon endpoints directly
curl http://localhost:3000/api/v1/products

# Returns realistic fake data via Faker.js
```

## mitmproxy Scripts

### route_to_mockoon.py (Default)

Routes specific endpoints to Mockoon, others to real API.

**Usage:**
```bash
# Already configured in compose.yml
# Edit MOCK_ENDPOINTS list to add your endpoints
```

**Edit:**
```python
MOCK_ENDPOINTS = [
    r'^/api/v1/auth/login$',
    r'^/api/v1/products.*',
]
```

### fallback_mock.py

Real API first, fallback to mock on errors (5xx).

**Usage:**
```bash
# Update compose.yml:
--scripts /scripts/fallback_mock.py

# Restart
podman restart mitmproxy
```

### selective_record.py

Record specific endpoints for later conversion.

**Usage:**
```bash
# Update compose.yml:
--scripts /scripts/selective_record.py

# Use your app, recordings save to:
# ./mocks/mitmproxy/recordings.jsonl

# Convert to Mockoon:
python mocks/scripts/mitm_to_mockoon.py \
  mocks/mitmproxy/recordings.jsonl \
  mocks/mockoon/recorded-api.json
```

### conditional_mock.py

Route based on headers or query params.

**Usage:**
```bash
# In your test, add header:
X-Mock-Mode: mock    # Use Mockoon
X-Mock-Mode: real    # Use real API

# Or query param:
/api/endpoint?mock=true
```

### enhance_responses.py

Get real API data, enhance with mock fields.

**Usage:**
```bash
# Add header to request:
X-Enhance-Response: true

# Real response is merged with mock data
```

## Mockoon Configuration

### mobile-api-mocks.json

Pre-configured mock API with:
- Login/register endpoints
- User profile
- Product list
- Order list
- Error scenarios (401, 500)

All use Faker.js for realistic fake data.

### Editing Mocks

**Option 1: Mockoon Desktop App (Recommended)**

1. Download Mockoon: https://mockoon.com/download/
2. Open `mobile-api-mocks.json`
3. Edit routes, add Faker.js helpers
4. Export and copy back to server

**Option 2: Edit JSON Directly**

```bash
nano mocks/mockoon/mobile-api-mocks.json
```

After editing:
```bash
podman restart mockoon
```

## Workflows

### Workflow 1: Development with Full Mocking

```bash
# Don't use proxy, point app to Mockoon
# Configure app: http://<server-ip>:3000

# Fast, fully controlled responses
```

### Workflow 2: Mixed Real/Mock Testing

```bash
# Use mitmproxy proxy
# Configure device: <server-ip>:8080

# Edit route_to_mockoon.py to specify which endpoints to mock
# Others go to real API
```

### Workflow 3: Record Real API → Create Mocks

```bash
# 1. Use selective_record.py script
# 2. Use your app to generate traffic
# 3. Convert recordings:
python mocks/scripts/mitm_to_mockoon.py \
  mocks/mitmproxy/recordings.jsonl \
  mocks/mockoon/new-mocks.json

# 4. Edit in Mockoon desktop app
# 5. Add Faker.js for dynamic data
# 6. Deploy to test farm
```

### Workflow 4: Resilience Testing

```bash
# Use fallback_mock.py
# Real API used, but on errors (5xx), returns mock

# Tests continue even if API is down
```

## Certificate Setup

### First Time

Certificates are auto-generated when mitmproxy starts.

### Manual Generation

```bash
podman exec -it mitmproxy mitmdump
# Press Ctrl+C after a few seconds
```

Certificates are in `./mocks/mitmproxy/`:
- `mitmproxy-ca-cert.pem` - For iOS
- `mitmproxy-ca-cert.cer` - For Android

### Installing on Devices

See [../docs/setup-proxy.md](../docs/setup-proxy.md) for detailed instructions.

## Tips

1. **Start simple** - Use route_to_mockoon.py with a few endpoints
2. **Add gradually** - Mock more endpoints as needed
3. **Record real APIs** - Use selective_record.py to capture real data
4. **Use Faker.js** - Makes mocks more realistic
5. **Version control** - Commit Mockoon configs to git
6. **Test direct first** - Test Mockoon directly before using proxy
7. **Check logs** - `podman logs mitmproxy -f` shows routing decisions

## Debugging

### Check if mitmproxy is routing correctly

```bash
# Watch logs
podman logs mitmproxy -f

# Look for:
# [MOCK] - Request routed to Mockoon
# [REAL] - Request sent to real API
```

### Test Mockoon directly

```bash
# Should return fake data
curl http://localhost:3000/api/v1/products

# Check Mockoon logs
podman logs mockoon
```

### View traffic in web UI

```bash
# Open mitmproxy web interface
open http://localhost:8081

# Shows all requests/responses in real-time
```

## Common Issues

### "No route configured" in Mockoon

- Check endpoint path matches exactly in `mobile-api-mocks.json`
- Check HTTP method (GET, POST, etc.)
- Test with curl to verify

### Requests not being mocked

- Verify endpoint pattern in `route_to_mockoon.py`
- Check mitmproxy logs for routing decisions
- Ensure Mockoon has the endpoint configured

### Certificate errors on device

- Verify certificate is installed correctly
- Check certificate is trusted (iOS: Certificate Trust Settings)
- For Android 7+, app must trust user certificates

## Next Steps

1. Configure devices: [../docs/setup-proxy.md](../docs/setup-proxy.md)
2. Create custom mocks for your app
3. Write tests using mocked endpoints
4. Record real APIs and convert to mocks

## Resources

- mitmproxy docs: https://docs.mitmproxy.org/
- Mockoon docs: https://mockoon.com/docs/
- Faker.js helpers: https://github.com/faker-js/faker
