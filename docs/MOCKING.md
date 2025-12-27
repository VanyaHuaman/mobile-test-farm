# Transparent API Mocking with MITM Proxy + Mockoon

The Mobile Test Farm features a **transparent API mocking system** that works on both Android and iOS **without any app code changes**. Using MITM proxy + Mockoon CLI, the system:

✅ **Zero Code Changes** - Apps believe they're calling the real API
✅ **Works on Android & iOS** - Platform-specific proxy configuration
✅ **Mock API endpoints** - Control API responses for reliable tests
✅ **Record traffic** - Capture all API requests/responses for debugging
✅ **Automatic certificate trust** - Debug builds configured automatically
✅ **Save logs on failure** - Automatically save traffic when tests fail
✅ **Test offline** - Run tests without backend dependency
✅ **Simulate errors** - Test error handling with controlled failure scenarios

---

## Quick Start

### 1. Enable Mocking

```bash
# In your .env file
MOCKOON_ENABLED=true
MOCKOON_PORT=3001
MOCKOON_MOCK_FILE=./mocks/environments/jsonplaceholder-simple.json
MOCKOON_PROXY_URL=https://jsonplaceholder.typicode.com  # Optional: proxy unmocked requests
```

### 2. Run Tests

```bash
# Mocking automatically starts before each test
npm run test:login
```

### 3. Check Traffic Logs

If a test fails, traffic logs are automatically saved to `mocks/recordings/`:

```bash
mocks/recordings/
└── FAILED-login-test-android-emulator-1-2025-12-25T12-34-56.json
```

---

## How It Works

### Architecture

The system uses a **two-layer interception architecture**:

```
Mobile App
    ↓
    HTTPS API Call (e.g., https://jsonplaceholder.typicode.com/users)
    ↓
MITM Proxy (port 8888)
    ↓ Transparently intercepts & redirects
    ↓
Mockoon Server (localhost:3001)
    ↓ Checks mock routes
    ↓
    ├─→ Route mocked? → Return mock response
    └─→ Not mocked? → Proxy to real API (if proxy mode enabled)
    ↓
App receives response (completely unaware of mocking)
```

**Key Components:**

1. **MITM Proxy (mitmproxy)** - Intercepts HTTPS traffic transparently
2. **Mockoon Server** - Serves mock API responses
3. **Platform Proxy Config** - Routes device traffic through MITM
   - Android: `adb` device proxy (`10.0.2.2:8888`)
   - iOS: macOS system proxy (`localhost:8888`)

### Workflow

1. **Test starts** →
   - Mockoon server starts (port 3001)
   - MITM proxy starts (port 8888)
   - Device proxy configured automatically

2. **App makes HTTPS API call** →
   - Traffic routes through MITM proxy
   - MITM redirects to Mockoon
   - App certificate validates (trusted in debug builds)

3. **Mockoon handles request** →
   - If route is mocked → return mock response
   - If not mocked AND proxy enabled → forward to real API
   - Records all traffic

4. **Test fails** →
   - Traffic logs saved to `mocks/recordings/`
   - Includes: requests, responses, proxy routing

5. **Test ends** →
   - Mockoon and MITM proxy **persist** (reused for next test)
   - Device proxy **persists** (no reconfiguration needed)

---

## Mock Environment Files

Mock environments are JSON files that define:
- Mock API routes and responses
- Proxy configuration
- Headers and CORS settings

### Example: Simple Mock

File: `mocks/environments/jsonplaceholder-simple.json`

```json
{
  "name": "JSONPlaceholder API Mock - Simple Example",
  "port": 3001,
  "routes": [
    {
      "endpoint": "users/:id",
      "method": "get",
      "responses": [
        {
          "body": "{\"id\": {{urlParam 'id'}}, \"name\": \"Test User {{urlParam 'id'}}\"}",
          "statusCode": 200,
          "headers": [
            {"key": "Content-Type", "value": "application/json"}
          ]
        }
      ]
    }
  ],
  "proxyMode": true,
  "proxyHost": "https://jsonplaceholder.typicode.com"
}
```

**What this does:**
- Mocks `GET /users/:id` endpoint
- Uses Mockoon templating (`{{urlParam 'id'}}`) for dynamic responses
- Proxies all other requests to JSONPlaceholder

### Creating Mock Files

**Option 1: Use Mockoon Desktop App** (Recommended)

1. Download [Mockoon Desktop](https://mockoon.com/)
2. Create your mock API visually
3. Export to JSON file
4. Save to `mocks/environments/`

**Option 2: Write JSON Manually**

See [Mockoon Data File Format](https://mockoon.com/docs/latest/mockoon-data-files/data-files-location/) for full schema.

---

## Configuration

### Environment Variables

All settings in `.env`:

```bash
# Enable/Disable Mocking
MOCKOON_ENABLED=true                 # Set to false to disable

# Server Settings
MOCKOON_PORT=3001                    # Port for mock server (must not conflict with Appium)

# Mock Environment
MOCKOON_MOCK_FILE=./mocks/environments/your-api-mock.json

# Proxy Mode (optional)
MOCKOON_PROXY_URL=https://api.example.com  # Forward unmocked requests here
# Leave empty to disable proxy mode (only mocked routes will work)

# Traffic Logging
MOCKOON_SAVE_LOGS_ON_FAILURE=true    # Save logs when test fails
MOCKOON_VERBOSE=false                # Show detailed Mockoon output
MOCKOON_RECORDINGS_PATH=./mocks/recordings
```

### Per-Test Configuration

Override config in individual tests:

```javascript
const config = require('../config/test.config');

// Temporarily enable mocking for this test
config.mocking.enabled = true;
config.mocking.mockFile = './mocks/environments/custom-mock.json';

// Run test
await testBase.runTest(deviceId, appConfig, async () => {
  // Test logic
}, 'custom-api-test');
```

---

## Traffic Logs

### Automatic Logging on Failure

When a test fails with mocking enabled, Mockoon automatically saves traffic logs:

**Example log file:** `FAILED-login-test-android-emulator-1-2025-12-25T12-34-56.json`

```json
{
  "status": "FAILED",
  "mockId": "mock-1234567890",
  "timestamp": "2025-12-25T12:34:56.789Z",
  "test": {
    "name": "Login Test",
    "deviceId": "android-emulator-1",
    "error": "Element not found: login-button",
    "duration": 15234
  },
  "totalTransactions": 5,
  "summary": {
    "total": 5,
    "mockedCount": 3,
    "proxiedCount": 2,
    "errorCount": 1,
    "methods": {"GET": 4, "POST": 1},
    "endpoints": {
      "/users/1": 2,
      "/login": 1,
      "/posts": 2
    }
  },
  "transactions": [
    {
      "request": {
        "method": "GET",
        "path": "/users/1",
        "headers": {...},
        "query": {},
        "body": ""
      },
      "response": {
        "statusCode": 200,
        "headers": {...},
        "body": "{\"id\": 1, \"name\": \"Test User 1\"}"
      },
      "proxied": false,
      "timestamp": "2025-12-25T12:34:57.123Z"
    }
    // ... more transactions
  ]
}
```

### Using Traffic Logs for Debugging

**1. Identify the failed request:**
```bash
# Look for requests with statusCode >= 400
jq '.transactions[] | select(.response.statusCode >= 400)' FAILED-*.json
```

**2. See what was proxied vs mocked:**
```bash
# Show all proxied requests
jq '.transactions[] | select(.proxied == true)' FAILED-*.json
```

**3. Check request/response bodies:**
```bash
# See the actual data sent/received
jq '.transactions[0].request.body' FAILED-*.json
jq '.transactions[0].response.body' FAILED-*.json
```

**4. Create mocks from real traffic:**
Use recorded traffic to create new mock routes based on actual API responses.

---

## Use Cases

### 1. Test Isolation (No Backend Dependency)

**Problem:** Backend is down or unstable
**Solution:** Mock all endpoints, disable proxy

```bash
MOCKOON_ENABLED=true
MOCKOON_PROXY_URL=   # Empty = no proxy, fully isolated
```

### 2. Partial Mocking (Hybrid Mode)

**Problem:** Want to mock specific flaky endpoints but use real API for others
**Solution:** Mock only problematic routes, proxy the rest

```bash
MOCKOON_ENABLED=true
MOCKOON_PROXY_URL=https://api.example.com  # Proxy unmocked routes
```

**Mock file:** Only define routes you want to control
```json
{
  "routes": [
    {
      "endpoint": "payments/process",  // Mock this flaky endpoint
      "method": "post",
      "responses": [{"body": "{\"success\": true}", "statusCode": 200}]
    }
    // All other routes proxy to real API
  ],
  "proxyMode": true,
  "proxyHost": "https://api.example.com"
}
```

### 3. Error Scenario Testing

**Problem:** Need to test how app handles API errors
**Solution:** Mock error responses

```json
{
  "endpoint": "users/:id",
  "method": "get",
  "responses": [
    {
      "label": "User Not Found",
      "statusCode": 404,
      "body": "{\"error\": \"User not found\"}"
    },
    {
      "label": "Server Error",
      "statusCode": 500,
      "body": "{\"error\": \"Internal server error\"}"
    }
  ]
}
```

Use Mockoon's [response rules](https://mockoon.com/docs/latest/route-responses/dynamic-rules/) to return different responses based on conditions.

### 4. Debugging Failed Tests

**Problem:** Test failed, need to see what API calls were made
**Solution:** Check automatically saved traffic logs

```bash
# Test fails → logs automatically saved
cat mocks/recordings/FAILED-login-test-*.json | jq '.summary'

# See all endpoints hit
cat mocks/recordings/FAILED-*.json | jq '.summary.endpoints'

# Find the error
cat mocks/recordings/FAILED-*.json | jq '.transactions[] | select(.response.statusCode >= 400)'
```

### 5. CI/CD Testing (No Cloud Dependencies)

**Problem:** CI/CD pipelines should not depend on external APIs
**Solution:** Mock all APIs in CI

```yaml
# .github/workflows/test.yml
env:
  MOCKOON_ENABLED: true
  MOCKOON_PROXY_URL: ""  # No proxy in CI
```

### 6. Performance Testing

**Problem:** Test app performance with slow API
**Solution:** Mock with latency

```json
{
  "endpoint": "data/large",
  "method": "get",
  "responses": [
    {
      "body": "{...}",
      "latency": 3000  // 3 second delay
    }
  ]
}
```

---

## Advanced Features

### 1. Dynamic Data with Faker.js

Mockoon supports [Faker.js templating](https://mockoon.com/docs/latest/templating/mockoon-helpers/) for realistic data:

```json
{
  "body": "{\"id\": {{faker 'number.int'}}, \"name\": \"{{faker 'person.fullName'}}\", \"email\": \"{{faker 'internet.email'}}\"}"
}
```

**Coming soon:** Advanced mock examples using Faker.js (Phase 3)

### 2. Response Rules

Return different responses based on request parameters:

```json
{
  "responses": [
    {
      "label": "Admin User",
      "body": "{\"role\": \"admin\"}",
      "rules": [
        {
          "target": "query",
          "modifier": "role",
          "value": "admin",
          "operator": "equals"
        }
      ]
    },
    {
      "label": "Regular User",
      "body": "{\"role\": \"user\"}",
      "default": true
    }
  ]
}
```

### 3. Multiple Mock Environments

Switch between different mock configurations:

```bash
# Development (uses real API for most calls)
MOCKOON_MOCK_FILE=./mocks/environments/dev-partial.json
MOCKOON_PROXY_URL=https://dev-api.example.com

# Staging (mocks unstable endpoints)
MOCKOON_MOCK_FILE=./mocks/environments/staging-hybrid.json
MOCKOON_PROXY_URL=https://staging-api.example.com

# CI (fully mocked, no external deps)
MOCKOON_MOCK_FILE=./mocks/environments/ci-isolated.json
MOCKOON_PROXY_URL=  # Empty
```

---

## Programmatic Usage

### MockoonManager API

For advanced control, use MockoonManager directly:

```javascript
const MockoonManager = require('./lib/MockoonManager');
const mockoon = new MockoonManager();

// Start mock server
const mockId = await mockoon.startMock('./mocks/my-api.json', {
  port: 3002,
  proxyUrl: 'https://api.example.com',
  verbose: true
});

// Get live transaction logs
const logs = mockoon.getTransactionLogs(mockId);
console.log(`Captured ${logs.length} requests`);

// Save logs manually
mockoon.saveTransactionLogs(mockId, 'my-test-recording.json');

// Stop server
await mockoon.stopMock(mockId);
```

---

## Troubleshooting

### Mock Server Not Starting

**Error:** `Failed to start Mockoon server`

**Solutions:**
- Check port 3001 is not in use: `lsof -i :3001`
- Verify mock file exists and is valid JSON
- Try increasing startup timeout (2s default)

### App Can't Connect to Mock Server

**Error:** `Network request failed`

**Solutions:**

**Android Emulator:**
```javascript
// Use 10.0.2.2 instead of localhost
const API_BASE_URL = 'http://10.0.2.2:3001';
```

**iOS Simulator:**
```javascript
// Can use localhost
const API_BASE_URL = 'http://localhost:3001';
```

**Physical Devices:**
```javascript
// Use your machine's IP address
const API_BASE_URL = 'http://192.168.1.100:3001';
```

**Cloud Device Farms:**

MITM proxy works with cloud providers that support tunneling to localhost:

**✅ Supported (with tunneling):**
- **BrowserStack** - Use BrowserStack Local binary to create tunnel
- **Sauce Labs** - Use Sauce Connect to tunnel to localhost
- **AWS Device Farm** - Use VPC endpoints for private network access
- **LambdaTest** - Use LambdaTest tunnel for localhost access

**❌ Not Supported (requires public deployment):**
- **Firebase Test Lab** - No tunneling support, deploy Mockoon publicly
- **Perfecto** - Limited tunneling capabilities
- **Kobiton** - No direct localhost tunneling

For unsupported providers, deploy Mockoon to a public server (Heroku, AWS, etc.) or use hybrid testing (local devices with mocks, cloud devices with real API).

### No Traffic Logs Saved

**Possible causes:**
- `MOCKOON_SAVE_LOGS_ON_FAILURE=false`
- Test passed (logs only saved on failure by default)
- Mocking not enabled

**Solution:**
```javascript
// Save logs manually regardless of test result
const logs = testBase.mockoonManager.getTransactionLogs(mockId);
testBase.mockoonManager.saveTransactionLogs(mockId, 'manual-save.json');
```

### Proxy Not Working

**Error:** Unmocked requests return 404

**Solutions:**
- Check `MOCKOON_PROXY_URL` is set
- Verify `proxyMode: true` in mock file
- Check `proxyHost` matches `MOCKOON_PROXY_URL`

---

## Next Steps

### Phase 2: Add Real API to Example App

We'll update `expo-arch-example-app` to:
1. Install TanStack Query for data fetching
2. Add API calls to JSONPlaceholder test API
3. Configure API_BASE_URL to use Mockoon
4. Create example screens with real data

### Phase 3: Advanced Mock Examples

Create advanced mock files demonstrating:
- Faker.js integration for realistic test data
- Response rules for conditional mocking
- CRUD operations with data buckets
- Complex scenarios (pagination, auth, file uploads)

---

## Resources

- **[Mockoon CLI Documentation](https://mockoon.com/cli/)** - Official CLI docs
- **[Proxy Mode Guide](https://mockoon.com/docs/latest/server-configuration/proxy-mode/)** - Partial mocking
- **[Traffic Recording](https://mockoon.com/docs/latest/logging-and-recording/requests-logging/)** - Request logging
- **[Templating Guide](https://mockoon.com/docs/latest/templating/mockoon-helpers/)** - Dynamic data with Faker.js
- **[Data File Format](https://mockoon.com/docs/latest/mockoon-data-files/data-files-location/)** - Mock file schema

---

**Built with ❤️ by Mobile Test Farm**
