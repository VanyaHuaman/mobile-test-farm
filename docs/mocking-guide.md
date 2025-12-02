# API Mocking Guide

Complete guide to creating and using mocks in the mobile test farm.

## Table of Contents

- [Overview](#overview)
- [When to Use Mocking](#when-to-use-mocking)
- [Mockoon Basics](#mockoon-basics)
- [Creating Mocks](#creating-mocks)
- [Using mitmproxy](#using-mitmproxy)
- [Testing Scenarios](#testing-scenarios)
- [Best Practices](#best-practices)

## Overview

The mobile test farm supports multiple mocking strategies:

```
┌─────────────────────────────────────────┐
│  Strategy 1: Direct Mockoon             │
│  App → Mockoon                          │
│  ✓ Fastest, simplest                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Strategy 2: Selective via mitmproxy    │
│  App → mitmproxy → Mockoon or Real API  │
│  ✓ Mix real and mock                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Strategy 3: Recording                  │
│  App → mitmproxy → Real API (record)    │
│  ✓ Capture real responses               │
└─────────────────────────────────────────┘
```

## When to Use Mocking

### ✅ Good Reasons to Mock

1. **Speed** - Tests run faster without network calls
2. **Reliability** - No dependency on external services
3. **Test Data** - Control exact data returned
4. **Edge Cases** - Test error scenarios (timeouts, 500s)
5. **Offline Development** - Work without internet
6. **Cost** - Avoid API rate limits or charges

### ⚠️ When NOT to Mock

1. **Integration Tests** - Need to verify real integration
2. **Performance Testing** - Real latency matters
3. **Contract Testing** - Verifying actual API contract
4. **Production Smoke Tests** - Must use real backend

## Mockoon Basics

### Mockoon Structure

```json
{
  "name": "My API",
  "port": 3000,
  "routes": [
    {
      "method": "get|post|put|delete",
      "endpoint": "api/path",
      "responses": [{
        "statusCode": 200,
        "body": "response body"
      }]
    }
  ]
}
```

### Faker.js Helpers

Mockoon includes Faker.js for realistic fake data:

```json
{
  "body": "{\n  \"name\": \"{{faker 'name.firstName'}}\",\n  \"email\": \"{{faker 'internet.email'}}\"\n}"
}
```

**Common Faker.js helpers:**

```javascript
// Names
{{faker 'name.firstName'}}          // John
{{faker 'name.lastName'}}           // Smith
{{faker 'name.fullName'}}           // John Smith

// Internet
{{faker 'internet.email'}}          // john@example.com
{{faker 'internet.url'}}            // https://example.com
{{faker 'internet.userName'}}       // john.smith

// Numbers
{{faker 'random.number'}}           // 12345
{{faker 'random.number' min=1 max=100}}
{{faker 'commerce.price'}}          // 99.99

// Dates
{{faker 'date.recent'}}             // Recent date
{{faker 'date.past'}}               // Past date
{{faker 'date.future'}}             // Future date

// Commerce
{{faker 'commerce.productName'}}    // Product Name
{{faker 'commerce.price'}}          // 123.45
{{faker 'commerce.department'}}     // Electronics

// Address
{{faker 'address.streetAddress'}}   // 123 Main St
{{faker 'address.city'}}            // New York
{{faker 'address.country'}}         // United States

// Lorem
{{faker 'lorem.sentence'}}          // Lorem ipsum dolor...
{{faker 'lorem.paragraph'}}         // Long text

// UUIDs
{{faker 'random.uuid'}}             // a1b2c3d4-...

// Booleans
{{faker 'random.boolean'}}          // true or false
```

### Handlebars Helpers

Mockoon also supports Handlebars:

```javascript
// Repeat
{{#repeat 5}}
{
  "id": {{@index}},
  "name": "Item {{@index}}"
}{{#unless @last}},{{/unless}}
{{/repeat}}

// Conditional
{{#if variable}}
  "enabled": true
{{else}}
  "enabled": false
{{/if}}

// Random choice
{{faker 'helpers.randomize' '["option1", "option2", "option3"]'}}
```

## Creating Mocks

### Method 1: Mockoon Desktop App (Recommended)

1. **Download Mockoon:** https://mockoon.com/download/

2. **Create New Environment:**
   - File → New Environment
   - Name: "My App API"
   - Port: 3000

3. **Add Route:**
   - Click "+" next to Routes
   - Method: POST
   - Endpoint: `api/login`

4. **Add Response:**
   ```json
   {
     "token": "{{faker 'random.uuid'}}",
     "user": {
       "id": {{faker 'random.number'}},
       "email": "{{faker 'internet.email'}}"
     }
   }
   ```

5. **Export:**
   - File → Export Environment
   - Save to: `~/mobile-test-farm/mocks/mockoon/my-app-api.json`

6. **Update compose.yml:**
   ```yaml
   mockoon:
     command: ["--data", "/data/my-app-api.json", "--port", "3000"]
   ```

### Method 2: Edit JSON Directly

Edit `mocks/mockoon/mobile-api-mocks.json`:

```json
{
  "routes": [
    {
      "uuid": "unique-id-here",
      "method": "get",
      "endpoint": "api/products",
      "responses": [{
        "statusCode": 200,
        "body": "{\n  \"products\": [\n    {{#repeat 10}}\n    {\n      \"id\": {{faker 'random.number'}},\n      \"name\": \"{{faker 'commerce.productName'}}\"\n    }{{#unless @last}},{{/unless}}\n    {{/repeat}}\n  ]\n}"
      }]
    }
  ]
}
```

Restart Mockoon:
```bash
podman restart mockoon
```

### Method 3: Record from Real API

```bash
# 1. Update compose.yml to use recording script
services:
  mitmproxy:
    command: >
      mitmweb
      --web-host 0.0.0.0
      --scripts /scripts/selective_record.py

# 2. Restart mitmproxy
podman restart mitmproxy

# 3. Configure device to use proxy and use your app
# Generates traffic

# 4. Convert recordings
python mocks/scripts/mitm_to_mockoon.py \
  mocks/mitmproxy/recordings.jsonl \
  mocks/mockoon/recorded.json

# 5. Import into Mockoon desktop app and refine
```

## Using mitmproxy

### Basic Routing

Edit `mocks/scripts/route_to_mockoon.py`:

```python
MOCK_ENDPOINTS = [
    r'^/api/v1/auth/login$',      # Exact match
    r'^/api/v1/products.*',        # Prefix match
    r'^/api/v1/users/\d+$',        # With regex
]
```

### Conditional Routing

Use headers to control routing:

```python
# In your test
requests.get(
    'https://api.example.com/users',
    headers={'X-Mock-Mode': 'mock'}
)
```

### Fallback Strategy

Automatically fallback to mock on errors:

```yaml
# compose.yml
mitmproxy:
  command: >
    mitmweb
    --web-host 0.0.0.0
    --scripts /scripts/fallback_mock.py
```

Now if real API returns 500, mock is used instead.

## Testing Scenarios

### Scenario 1: Successful Flow

```json
// Mockoon route
{
  "method": "post",
  "endpoint": "api/checkout",
  "responses": [{
    "statusCode": 200,
    "body": "{\n  \"orderId\": \"{{faker 'random.uuid'}}\",\n  \"status\": \"success\"\n}"
  }]
}
```

### Scenario 2: Error Cases

```json
{
  "method": "post",
  "endpoint": "api/test/payment-declined",
  "responses": [{
    "statusCode": 402,
    "body": "{\n  \"error\": \"Payment declined\",\n  \"code\": \"CARD_DECLINED\"\n}"
  }]
}
```

### Scenario 3: Slow Network

```json
{
  "method": "get",
  "endpoint": "api/test/slow",
  "responses": [{
    "statusCode": 200,
    "latency": 5000,  // 5 second delay
    "body": "{\n  \"message\": \"Slow response\"\n}"
  }]
}
```

### Scenario 4: Timeout

```json
{
  "method": "get",
  "endpoint": "api/test/timeout",
  "responses": [{
    "statusCode": 408,
    "latency": 30000,  // 30 seconds
    "body": "{\n  \"error\": \"Request timeout\"\n}"
  }]
}
```

### Scenario 5: Conditional Response

Use response rules:

```json
{
  "endpoint": "api/login",
  "responses": [
    {
      "rules": [
        {
          "target": "body",
          "modifier": "email",
          "value": "admin@example.com",
          "operator": "equals"
        }
      ],
      "body": "{\"role\": \"admin\"}"
    },
    {
      "default": true,
      "body": "{\"role\": \"user\"}"
    }
  ]
}
```

## Best Practices

### 1. Use Realistic Data

```json
// Bad
{"name": "Test User", "email": "test@test.com"}

// Good - uses Faker.js
{"name": "{{faker 'name.fullName'}}", "email": "{{faker 'internet.email'}}"}
```

### 2. Match Real API Structure

```json
// If real API returns:
{
  "data": [...],
  "meta": {"page": 1, "total": 100}
}

// Mock should too:
{
  "data": [...],
  "meta": {"page": 1, "total": 100}
}
```

### 3. Version Your Mocks

```bash
# Commit mock configs to git
git add mocks/mockoon/*.json
git commit -m "Add product API mocks"
```

### 4. Document Endpoints

```json
{
  "documentation": "Login endpoint - returns JWT token",
  "endpoint": "api/login"
}
```

### 5. Create Test Endpoints

```json
// Special endpoints for testing specific scenarios
{
  "endpoint": "api/test/unauthorized",
  "responses": [{"statusCode": 401}]
}
{
  "endpoint": "api/test/server-error",
  "responses": [{"statusCode": 500}]
}
```

### 6. Use Environment-Specific Configs

```bash
mocks/mockoon/
├── dev-api-mocks.json        # For development
├── staging-api-mocks.json    # For staging tests
└── prod-like-mocks.json      # Realistic production data
```

### 7. Keep Mocks Simple

Don't over-engineer. Mock what you need, when you need it.

```json
// Don't mock every field if you only test some
{
  "user": {
    "id": 1,
    "email": "test@example.com"
    // Don't add 50 unused fields
  }
}
```

### 8. Test Your Mocks

```bash
# Verify mocks work before using in tests
curl http://localhost:3000/api/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'
```

## Debugging Mocks

### Check Mockoon is Running

```bash
podman ps | grep mockoon
podman logs mockoon
```

### Test Direct Access

```bash
# From server
curl http://localhost:3000/api/products

# From device (if on same network)
curl http://<server-ip>:3000/api/products
```

### Check mitmproxy Routing

```bash
# Watch logs
podman logs mitmproxy -f

# Should show:
# [MOCK] GET /api/products → Mockoon
```

### Web UI Debug

```bash
# Open mitmproxy web UI
open http://localhost:8081

# Click on requests to see:
# - Which server it went to
# - Request/response details
# - Headers
```

### Common Issues

**404 from Mockoon:**
- Endpoint path doesn't match exactly
- Check HTTP method (GET vs POST)
- Look for trailing slashes

**Empty Response:**
- Check JSON syntax in body
- Look for unclosed Handlebars helpers

**Faker.js not working:**
- Check quotes around helper name
- Verify helper exists: https://fakerjs.dev/api/

## Example: Full Login Flow Mock

```json
{
  "name": "Auth API",
  "port": 3000,
  "routes": [
    {
      "uuid": "login",
      "method": "post",
      "endpoint": "api/v1/auth/login",
      "responses": [
        {
          "uuid": "login-success",
          "label": "Successful login",
          "rules": [
            {
              "target": "body",
              "modifier": "password",
              "value": "correct",
              "operator": "equals"
            }
          ],
          "statusCode": 200,
          "latency": 200,
          "body": "{\n  \"success\": true,\n  \"token\": \"{{faker 'random.uuid'}}\",\n  \"refreshToken\": \"{{faker 'random.uuid'}}\",\n  \"expiresAt\": \"{{faker 'date.future'}}\",\n  \"user\": {\n    \"id\": {{faker 'random.number'}},\n    \"email\": \"{{faker 'internet.email'}}\",\n    \"name\": \"{{faker 'name.fullName'}}\",\n    \"avatar\": \"{{faker 'image.avatar'}}\"\n  }\n}"
        },
        {
          "uuid": "login-fail",
          "label": "Invalid credentials",
          "default": true,
          "statusCode": 401,
          "latency": 100,
          "body": "{\n  \"success\": false,\n  \"error\": \"Invalid credentials\",\n  \"code\": \"AUTH_INVALID\"\n}"
        }
      ]
    },
    {
      "uuid": "refresh",
      "method": "post",
      "endpoint": "api/v1/auth/refresh",
      "responses": [{
        "statusCode": 200,
        "body": "{\n  \"token\": \"{{faker 'random.uuid'}}\",\n  \"expiresAt\": \"{{faker 'date.future'}}\"\n}"
      }]
    },
    {
      "uuid": "logout",
      "method": "post",
      "endpoint": "api/v1/auth/logout",
      "responses": [{
        "statusCode": 204,
        "body": ""
      }]
    }
  ]
}
```

## Next Steps

1. Create mocks for your app's API
2. Test mocks directly with curl
3. Configure mitmproxy routing
4. Write tests using mocked endpoints
5. Record real API for more test data

See also:
- [setup-proxy.md](setup-proxy.md) - Device proxy configuration
- [../mocks/README.md](../mocks/README.md) - Mocks directory overview
- [writing-tests.md](writing-tests.md) - Using mocks in tests
