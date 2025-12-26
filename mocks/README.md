# API Mocks

This directory contains Mockoon CLI mock environments and recorded traffic logs for testing.

## Directory Structure

```
mocks/
├── environments/          # Mock API environment files (.json)
│   └── jsonplaceholder-simple.json  # Simple example mock
├── recordings/           # Recorded API traffic (auto-generated)
│   └── FAILED-*.json    # Traffic logs from failed tests
└── README.md
```

## Mock Environments

Mock environment files define your API mocks. Each file contains:
- API routes and responses
- Proxy configuration
- Headers and CORS settings

### Available Mocks

**`jsonplaceholder-simple.json`** - Simple example mock
- Mocks: `GET /users/:id`, `GET /posts`
- Proxy: https://jsonplaceholder.typicode.com
- Use case: Example/learning

### Creating New Mocks

**Option 1: Mockoon Desktop App (Recommended)**

1. Download [Mockoon Desktop](https://mockoon.com/)
2. Create your mock API visually
3. File → Export environment to JSON
4. Save to `mocks/environments/your-mock-name.json`

**Option 2: Copy Existing Mock**

```bash
cp jsonplaceholder-simple.json my-api-mock.json
# Edit my-api-mock.json
```

## Traffic Recordings

When tests fail with mocking enabled, traffic logs are automatically saved to `recordings/`:

**Filename format:** `FAILED-{testName}-{deviceId}-{timestamp}.json`

### Viewing Logs

```bash
# Pretty print
cat recordings/FAILED-*.json | jq '.'

# See summary
cat recordings/FAILED-*.json | jq '.summary'
```

## Usage

### Enable Mocking

In `.env`:
```bash
MOCKOON_ENABLED=true
MOCKOON_PORT=3001
MOCKOON_MOCK_FILE=./mocks/environments/jsonplaceholder-simple.json
```

### Run Tests

```bash
# Mocking automatically starts/stops with each test
npm run test:login
```

See [Full Documentation](../docs/MOCKING.md) for details.
