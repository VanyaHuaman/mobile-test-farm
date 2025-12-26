/**
 * Test Variants Configuration
 *
 * Defines test variants for different mock scenarios.
 * Each variant specifies a unique test configuration with specific mock files.
 */

const path = require('path');

/**
 * Test Variants Registry
 *
 * Structure:
 * {
 *   baseTestId: {
 *     variants: [
 *       {
 *         id: 'variant-id',
 *         name: 'Variant Name',
 *         description: 'What this variant tests',
 *         mockConfig: { ... },
 *         env: { ... }
 *       }
 *     ]
 *   }
 * }
 */
const testVariants = {
  // Users API Test Variants
  users: {
    baseTest: {
      id: 'users',
      name: 'Users API Test',
      description: 'Tests the Users screen with API calls',
      script: 'test:users',
      estimatedDuration: '40s',
    },
    variants: [
      {
        id: 'users-real-api',
        name: 'Users - Real API',
        description: 'Test with real JSONPlaceholder API (no mocking)',
        estimatedDuration: '40s',
        mockConfig: {
          enabled: false,
        },
        env: {
          MOCKOON_ENABLED: 'false',
        },
      },
      {
        id: 'users-mock-simple',
        name: 'Users - Mock API (Simple)',
        description: 'Test with simple Mockoon mock (proxied data)',
        estimatedDuration: '40s',
        mockConfig: {
          enabled: true,
          mockFile: path.join(__dirname, '../mocks/environments/jsonplaceholder-simple.json'),
        },
        env: {
          MOCKOON_ENABLED: 'true',
          MOCKOON_MOCK_FILE: path.join(__dirname, '../mocks/environments/jsonplaceholder-simple.json'),
        },
      },
      {
        id: 'users-faker-data',
        name: 'Users - Faker Data Test',
        description: 'Test with realistic fake data from Faker.js',
        estimatedDuration: '40s',
        mockConfig: {
          enabled: true,
          mockFile: path.join(__dirname, '../mocks/environments/users-faker-advanced.json'),
        },
        env: {
          MOCKOON_ENABLED: 'true',
          MOCKOON_MOCK_FILE: path.join(__dirname, '../mocks/environments/users-faker-advanced.json'),
        },
      },
      {
        id: 'users-500-error',
        name: 'Users - 500 Error Test',
        description: 'Test app behavior when API returns 500 Internal Server Error',
        estimatedDuration: '40s',
        mockConfig: {
          enabled: true,
          mockFile: path.join(__dirname, '../mocks/environments/error-scenarios.json'),
        },
        env: {
          MOCKOON_ENABLED: 'true',
          MOCKOON_MOCK_FILE: path.join(__dirname, '../mocks/environments/error-scenarios.json'),
          TEST_ENDPOINT: '/users/error/500',
        },
      },
      {
        id: 'users-404-error',
        name: 'Users - 404 Error Test',
        description: 'Test app behavior when API returns 404 Not Found',
        estimatedDuration: '40s',
        mockConfig: {
          enabled: true,
          mockFile: path.join(__dirname, '../mocks/environments/error-scenarios.json'),
        },
        env: {
          MOCKOON_ENABLED: 'true',
          MOCKOON_MOCK_FILE: path.join(__dirname, '../mocks/environments/error-scenarios.json'),
          TEST_ENDPOINT: '/users/999',
        },
      },
      {
        id: 'users-timeout',
        name: 'Users - Timeout Test',
        description: 'Test app behavior with slow/timeout API responses (15s delay)',
        estimatedDuration: '60s',
        mockConfig: {
          enabled: true,
          mockFile: path.join(__dirname, '../mocks/environments/error-scenarios.json'),
        },
        env: {
          MOCKOON_ENABLED: 'true',
          MOCKOON_MOCK_FILE: path.join(__dirname, '../mocks/environments/error-scenarios.json'),
          TEST_ENDPOINT: '/users/timeout',
        },
      },
      {
        id: 'users-slow-response',
        name: 'Users - Slow Response Test',
        description: 'Test loading states with slow API (5s delay)',
        estimatedDuration: '50s',
        mockConfig: {
          enabled: true,
          mockFile: path.join(__dirname, '../mocks/environments/error-scenarios.json'),
        },
        env: {
          MOCKOON_ENABLED: 'true',
          MOCKOON_MOCK_FILE: path.join(__dirname, '../mocks/environments/error-scenarios.json'),
          TEST_ENDPOINT: '/users/slow',
        },
      },
      {
        id: 'users-401-unauthorized',
        name: 'Users - 401 Unauthorized Test',
        description: 'Test app behavior when API requires authentication',
        estimatedDuration: '40s',
        mockConfig: {
          enabled: true,
          mockFile: path.join(__dirname, '../mocks/environments/error-scenarios.json'),
        },
        env: {
          MOCKOON_ENABLED: 'true',
          MOCKOON_MOCK_FILE: path.join(__dirname, '../mocks/environments/error-scenarios.json'),
          TEST_ENDPOINT: '/users/error/401',
        },
      },
    ],
  },

  // Posts API Test Variants
  posts: {
    baseTest: {
      id: 'posts',
      name: 'Posts API Test',
      description: 'Tests the Posts screen with API calls',
      script: 'test:posts',
      estimatedDuration: '40s',
    },
    variants: [
      {
        id: 'posts-real-api',
        name: 'Posts - Real API',
        description: 'Test with real JSONPlaceholder API (no mocking)',
        estimatedDuration: '40s',
        mockConfig: {
          enabled: false,
        },
        env: {
          MOCKOON_ENABLED: 'false',
        },
      },
      {
        id: 'posts-mock-simple',
        name: 'Posts - Mock API (Simple)',
        description: 'Test with simple Mockoon mock (proxied data)',
        estimatedDuration: '40s',
        mockConfig: {
          enabled: true,
          mockFile: path.join(__dirname, '../mocks/environments/jsonplaceholder-simple.json'),
        },
        env: {
          MOCKOON_ENABLED: 'true',
          MOCKOON_MOCK_FILE: path.join(__dirname, '../mocks/environments/jsonplaceholder-simple.json'),
        },
      },
      {
        id: 'posts-500-error',
        name: 'Posts - 500 Error Test',
        description: 'Test app behavior when API returns 500 Internal Server Error',
        estimatedDuration: '40s',
        mockConfig: {
          enabled: true,
          mockFile: path.join(__dirname, '../mocks/environments/error-scenarios.json'),
        },
        env: {
          MOCKOON_ENABLED: 'true',
          MOCKOON_MOCK_FILE: path.join(__dirname, '../mocks/environments/error-scenarios.json'),
        },
      },
    ],
  },
};

/**
 * Get all test variants for a base test
 */
function getTestVariants(baseTestId) {
  const test = testVariants[baseTestId];
  if (!test) {
    return null;
  }
  return {
    baseTest: test.baseTest,
    variants: test.variants,
  };
}

/**
 * Get all tests with variants flattened into a single list
 * This is what the dashboard will display
 */
function getAllTestsWithVariants() {
  const allTests = [];

  // Add base tests that don't have variants
  const baseTests = [
    {
      id: 'login',
      name: 'Login Test Suite',
      description: 'Tests login functionality with valid and invalid credentials',
      script: 'test:login:pom',
      estimatedDuration: '30s',
      hasVariants: false,
    },
    {
      id: 'form',
      name: 'Form Test Suite',
      description: 'Tests form filling, validation, and submission',
      script: 'test:form',
      estimatedDuration: '45s',
      hasVariants: false,
    },
    {
      id: 'list',
      name: 'List Test Suite',
      description: 'Tests list filtering, item interaction, and navigation',
      script: 'test:list',
      estimatedDuration: '60s',
      hasVariants: false,
    },
    {
      id: 'profile',
      name: 'Profile Test Suite',
      description: 'Tests profile display and settings navigation',
      script: 'test:profile',
      estimatedDuration: '40s',
      hasVariants: false,
    },
    {
      id: 'navigation',
      name: 'Navigation Test Suite',
      description: 'Tests complete app navigation flow',
      script: 'test:navigation',
      estimatedDuration: '90s',
      hasVariants: false,
    },
    {
      id: 'all',
      name: 'All Test Suites',
      description: 'Run all test suites sequentially',
      script: 'test:suite:all',
      estimatedDuration: '4m',
      hasVariants: false,
    },
  ];

  allTests.push(...baseTests);

  // Add variant tests
  Object.keys(testVariants).forEach((baseTestId) => {
    const test = testVariants[baseTestId];
    test.variants.forEach((variant) => {
      allTests.push({
        id: variant.id,
        name: variant.name,
        description: variant.description,
        script: test.baseTest.script,
        estimatedDuration: variant.estimatedDuration,
        hasVariants: true,
        baseTestId: baseTestId,
        variantConfig: {
          mockConfig: variant.mockConfig,
          env: variant.env,
        },
      });
    });
  });

  return allTests;
}

/**
 * Get variant configuration by variant ID
 */
function getVariantConfig(variantId) {
  for (const baseTestId in testVariants) {
    const test = testVariants[baseTestId];
    const variant = test.variants.find(v => v.id === variantId);
    if (variant) {
      return {
        baseTestId,
        baseScript: test.baseTest.script,
        variantConfig: {
          mockConfig: variant.mockConfig,
          env: variant.env,
        },
      };
    }
  }
  return null;
}

module.exports = {
  testVariants,
  getTestVariants,
  getAllTestsWithVariants,
  getVariantConfig,
};
