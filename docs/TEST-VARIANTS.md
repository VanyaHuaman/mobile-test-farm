# Test Variants - Mock Scenario Testing

Test variants allow you to run the same test with different configurations, particularly useful for testing different API mock scenarios (error handling, slow responses, timeouts, etc.).

## What are Test Variants?

Test variants are different configurations of the same base test. Instead of creating separate test files for each scenario, you define variants that specify:

- **Mock API configuration** - Which mock file to use
- **Environment variables** - Test-specific settings
- **Test scenario** - What behavior is being tested

## How Test Variants Work

### Dashboard Organization

In the web dashboard, tests are organized into groups:

**Standard Tests**
- Login Test Suite
- Form Test Suite
- List Test Suite
- Profile Test Suite
- Navigation Test Suite
- All Test Suites

**Users Tests (with Mocks)**
- Users - Real API
- Users - Mock API (Simple)
- Users - Faker Data Test
- Users - 500 Error Test
- Users - 404 Error Test
- Users - Timeout Test
- Users - Slow Response Test
- Users - 401 Unauthorized Test

**Posts Tests (with Mocks)**
- Posts - Real API
- Posts - Mock API (Simple)
- Posts - 500 Error Test

### Selecting a Test Variant

1. Open the web dashboard at `http://localhost:3000`
2. Click "Run Tests" tab
3. In the "Select Test Suite" dropdown, you'll see:
   - Standard tests (no mocking)
   - Grouped variant tests by base test
4. Select a variant (e.g., "Users - 500 Error Test")
5. The description shows what scenario it tests
6. Click "Run Tests"

## Available Test Variants

### Users Test Variants

#### Users - Real API
- No mocking enabled
- Calls real JSONPlaceholder API
- Tests normal happy path with live data

#### Users - Mock API (Simple)
- Simple Mockoon mock with proxy mode
- Mocks some endpoints, proxies others
- Mock file: `jsonplaceholder-simple.json`

#### Users - Faker Data Test
- Realistic fake data using Faker.js
- Random user data on each request
- Mock file: `users-faker-advanced.json`

#### Users - 500 Error Test
**Specific Scenario**: Tests app behavior when API returns 500 Internal Server Error

- Mock endpoint: `/users/error/500`
- Expected behavior: App should show error message to user
- Error response includes timestamp
- Mock file: `error-scenarios.json`

#### Users - 404 Error Test
**Specific Scenario**: Tests app behavior when resource not found

- Mock endpoint: `/users/999`
- Expected behavior: App should show "User not found" message
- Mock file: `error-scenarios.json`

#### Users - Timeout Test
**Specific Scenario**: Tests app timeout handling

- Mock endpoint: `/users/timeout`
- 15 second delay before response
- Expected behavior: App should timeout and show error
- Mock file: `error-scenarios.json`

#### Users - Slow Response Test
**Specific Scenario**: Tests loading states with slow API

- Mock endpoint: `/users/slow`
- 5 second delay before response
- Expected behavior: App should show loading indicator for 5 seconds
- Mock file: `error-scenarios.json`

#### Users - 401 Unauthorized Test
**Specific Scenario**: Tests authentication error handling

- Mock endpoint: `/users/error/401`
- Returns 401 Unauthorized
- Expected behavior: App should show authentication error
- Mock file: `error-scenarios.json`

### Posts Test Variants

Similar structure to Users, with variants for:
- Real API
- Mock API (Simple)
- 500 Error Test

## Adding New Test Variants

### Step 1: Define Variant in Configuration

Edit `config/test-variants.js`:

```javascript
{
  baseTest: {
    id: 'mytest',
    name: 'My Test',
    script: 'test:mytest',
    estimatedDuration: '30s',
  },
  variants: [
    {
      id: 'mytest-503-error',
      name: 'My Test - 503 Service Unavailable',
      description: 'Test app behavior when service is down',
      estimatedDuration: '30s',
      mockConfig: {
        enabled: true,
        mockFile: path.join(__dirname, '../mocks/environments/error-scenarios.json'),
      },
      env: {
        MOCKOON_ENABLED: 'true',
        MOCKOON_MOCK_FILE: path.join(__dirname, '../mocks/environments/error-scenarios.json'),
        TEST_ENDPOINT: '/users/error/503',
      },
    },
  ],
}
```

### Step 2: Add to Test Variants Registry

In `config/test-variants.js`, add your test to the `testVariants` object:

```javascript
const testVariants = {
  users: { ... },
  posts: { ... },
  mytest: {  // Your new test
    baseTest: { ... },
    variants: [ ... ],
  },
};
```

### Step 3: Restart Dashboard Server

```bash
npm run dashboard
```

The new variants will appear in the test suite dropdown automatically.

## How Variants Pass Configuration to Tests

When you select a variant and run it:

1. **Test Runner** identifies the variant and loads its configuration
2. **Environment variables** from `variant.env` are passed to the test process
3. **Test process** reads env vars like `MOCKOON_ENABLED`, `MOCKOON_MOCK_FILE`
4. **TestBase** helper automatically starts Mockoon with the variant's mock file
5. **Test executes** with the variant's specific configuration
6. **Logs are saved** if test fails (in `mocks/recordings/`)

## Example Test Run Flow

**User selects**: "Users - 500 Error Test"

**System does**:
1. Test Runner finds variant config:
   ```javascript
   {
     env: {
       MOCKOON_ENABLED: 'true',
       MOCKOON_MOCK_FILE: '.../error-scenarios.json',
     }
   }
   ```

2. Spawns test process with environment:
   ```bash
   MOCKOON_ENABLED=true \
   MOCKOON_MOCK_FILE=.../error-scenarios.json \
   npm run test:users
   ```

3. TestBase reads config and starts Mockoon:
   ```javascript
   mockoonManager.startMock('error-scenarios.json', { port: 3001 })
   ```

4. Test runs against Mockoon mock server
5. App makes request to `/users/error/500`
6. Mockoon returns 500 error with realistic error response
7. Test verifies app shows error message
8. If test fails, traffic logs are saved to `mocks/recordings/`

## Benefits of Test Variants

### 1. Clear Test Names
Instead of:
- "Users Test"

You get:
- "Users - 500 Error Test"
- "Users - Timeout Test"
- "Users - Faker Data Test"

### 2. No Code Duplication
Same test file, multiple configurations - DRY principle

### 3. Easy to Add Scenarios
Just add a variant config, no new test file needed

### 4. Organized Dashboard
Tests grouped by base test type, easy to find specific scenarios

### 5. Searchable Results
Test results show specific variant name, easy to track which scenario failed

## Variant Naming Convention

Follow this pattern for consistency:

```
{BaseTest} - {Scenario} Test
```

Examples:
- ✅ Users - 500 Error Test
- ✅ Users - Timeout Test
- ✅ Posts - Faker Data Test
- ❌ Users test with 500 error
- ❌ Test users timeout

## Environment Variable Precedence

When running tests with variants:

1. **System environment** (lowest priority)
2. **config/test.config.js** defaults
3. **Variant env vars** (highest priority)

Example:
```javascript
// System: MOCKOON_PORT=3001
// Config: MOCKOON_PORT=3001
// Variant: MOCKOON_PORT=3002

// Test runs with: MOCKOON_PORT=3002 (variant wins)
```

## Debugging Variant Configuration

### Check Which Config is Active

Test output shows:
```
Starting test: users-500-error
Mock enabled: true
Mock file: /path/to/error-scenarios.json
Mock port: 3001
```

### View Test Run Details

In dashboard → Test Results → Click test run

Shows:
- Variant ID
- Configuration used
- Environment variables
- Mock file path
- Full output

### Common Issues

**Issue**: Variant not appearing in dropdown
- **Fix**: Restart dashboard server, refresh browser

**Issue**: Wrong mock file used
- **Fix**: Check variant env vars, ensure `MOCKOON_MOCK_FILE` path is correct

**Issue**: Test ignores variant config
- **Fix**: Ensure TestBase reads `config.mocking` from test.config.js

## Best Practices

### 1. One Scenario Per Variant
Each variant should test ONE specific scenario
- ✅ "Users - 500 Error Test" (tests 500 errors)
- ❌ "Users - Errors Test" (too vague, what errors?)

### 2. Descriptive Names
Clearly indicate what behavior is being tested
- ✅ "Users - Slow Response Test (5s delay)"
- ❌ "Users - Test 3"

### 3. Realistic Mock Data
Use Faker.js or realistic data, not hardcoded "Test User 1"

### 4. Document Expected Behavior
In variant description, explain what the app SHOULD do
```javascript
description: 'Test app shows error message when API returns 500'
```

### 5. Use Existing Mock Files
Reuse mock files across variants when possible
```javascript
// Good - reuse error-scenarios.json
mockFile: 'error-scenarios.json'

// Less good - create new file for each scenario
mockFile: 'users-500-only.json'
```

## See Also

- [Mocking Documentation](./MOCKING.md) - Full Mockoon CLI documentation
- [Mock Environments README](../mocks/README.md) - Available mock files
- [Test Configuration](../config/test.config.js) - Default test settings
