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

#### Basic Mocks

**`jsonplaceholder-simple.json`** - Simple example mock
- Mocks: `GET /users/:id`, `GET /posts`
- Proxy: https://jsonplaceholder.typicode.com
- Use case: Learning, basic testing

#### Advanced Mocks (Phase 3)

**`users-faker-advanced.json`** - Faker.js data generation
- `GET /users/random` - Random user with realistic Faker data
- `GET /users/faker` - Array of 10 users with Faker data
- `GET /users/:id/profile` - Seeded Faker data (same ID = same data)
- `GET /products` - 20 products with commerce data
- **Features**: Realistic data, repeat helper, seeded generation
- **Use case**: Realistic test data without hardcoding

**`users-response-rules.json`** - Conditional responses
- `GET /users?role=admin` - Filter by role with rules
- `POST /auth/login` - Success/error based on credentials
- `GET /users/me` - Requires Authorization header
- `GET /users/paginated?page=1` - Pagination with rules
- `GET /users/search?q=john` - Search with regex matching
- **Features**: Query params, headers, request body rules
- **Use case**: Testing different scenarios, authentication

**`users-crud-databucket.json`** - CRUD operations
- `GET /users` - Get all users from data bucket
- `POST /users` - Create user (adds to bucket)
- `PUT /users/:id` - Update user (modifies bucket)
- `DELETE /users/:id` - Delete user (removes from bucket)
- **Features**: Persistent data storage, CRUD operations
- **Use case**: Testing create/update/delete flows

**`error-scenarios.json`** - Error handling
- `GET /users/999` - 404 Not Found
- `GET /users/error/500` - 500 Internal Server Error
- `GET /users/error/503` - 503 Service Unavailable
- `GET /users/error/401` - 401 Unauthorized
- `DELETE /users/error/403` - 403 Forbidden
- `POST /users/error/400` - 400 Bad Request (validation)
- `GET /users/error/429` - 429 Too Many Requests (rate limit)
- `GET /users/slow` - Slow response (5s delay)
- `GET /users/timeout` - Timeout (15s delay)
- **Features**: All common HTTP errors, latency simulation
- **Use case**: Testing error handling, loading states, timeouts

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

## Advanced Examples

### Using Faker.js Mocks

```bash
# Use Faker mock
MOCKOON_MOCK_FILE=./mocks/environments/users-faker-advanced.json \
MOCKOON_ENABLED=true \
npm run test:users

# Every request to /users/random returns different realistic data
# /users/:id/profile returns same data for same ID (seeded)
```

### Using Response Rules

```bash
# Use response rules mock
MOCKOON_MOCK_FILE=./mocks/environments/users-response-rules.json \
MOCKOON_ENABLED=true \
npm run test:users

# Test different scenarios:
# GET /users?role=admin → Returns admins only
# POST /auth/login with correct credentials → 200 success
# POST /auth/login with wrong credentials → 401 error
# GET /users/me without Authorization header → 401
```

### Using CRUD Operations

```bash
# Use CRUD mock
MOCKOON_MOCK_FILE=./mocks/environments/users-crud-databucket.json \
MOCKOON_ENABLED=true \
npm run test:users

# Data bucket acts like a database:
# POST /users → Creates new user
# GET /users → Returns all users (including newly created)
# PUT /users/1 → Updates user 1
# DELETE /users/1 → Deletes user 1
# Data persists during Mockoon session
```

### Testing Error Scenarios

```bash
# Use error scenarios mock
MOCKOON_MOCK_FILE=./mocks/environments/error-scenarios.json \
MOCKOON_ENABLED=true \
npm run test:users

# Test app handles errors:
# GET /users/999 → 404 (verify error state displayed)
# GET /users/error/500 → 500 (verify error message)
# GET /users/slow → 5s delay (verify loading state)
# GET /users/timeout → 15s delay (verify timeout handling)
```

## Tips

**Combine with Proxy Mode:**
```bash
# Use advanced mock for some routes, proxy rest to real API
MOCKOON_MOCK_FILE=./mocks/environments/error-scenarios.json \
MOCKOON_PROXY_URL=https://jsonplaceholder.typicode.com \
MOCKOON_ENABLED=true \
npm run test:users

# Error routes return mocks
# Other routes proxy to real API
```

**Switch Mocks Without Code Changes:**
```bash
# Simple mock for basic testing
MOCKOON_MOCK_FILE=./mocks/environments/jsonplaceholder-simple.json

# Faker mock for realistic data
MOCKOON_MOCK_FILE=./mocks/environments/users-faker-advanced.json

# Error mock for error handling tests
MOCKOON_MOCK_FILE=./mocks/environments/error-scenarios.json
```

See [Full Documentation](../docs/MOCKING.md) for details.
