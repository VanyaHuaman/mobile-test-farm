/**
 * Test Retry Logic
 *
 * Automatically retry failed tests with configurable attempts and delays
 */

class TestRetry {
  constructor(config = {}) {
    this.maxRetries = config.maxRetries || parseInt(process.env.TEST_MAX_RETRIES || '2', 10);
    this.retryDelay = config.retryDelay || parseInt(process.env.TEST_RETRY_DELAY || '3000', 10);
    this.enabled = config.enabled !== false && process.env.TEST_RETRY_ENABLED !== 'false';
  }

  /**
   * Execute test with retry logic
   * @param {Function} testFunction - Test function to execute
   * @param {Object} options - Retry options
   * @returns {Promise<Object>} - Result with attempt info
   */
  async executeWithRetry(testFunction, options = {}) {
    const maxAttempts = options.maxRetries !== undefined ? options.maxRetries : this.maxRetries;
    const delay = options.retryDelay !== undefined ? options.retryDelay : this.retryDelay;
    const testName = options.testName || 'Test';

    if (!this.enabled) {
      console.log('🔄 Test retry disabled, running test once');
      await testFunction();
      return { success: true, attempts: 1, retried: false };
    }

    let lastError = null;
    let attempt = 0;

    for (attempt = 1; attempt <= maxAttempts + 1; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`\n🔄 Retry attempt ${attempt - 1}/${maxAttempts} for: ${testName}`);
          console.log(`   Waiting ${delay}ms before retry...`);
          await this.sleep(delay);
        }

        console.log(`\n${'='.repeat(70)}`);
        console.log(`🧪 Attempt ${attempt}${attempt > 1 ? ` (Retry ${attempt - 1})` : ''}: ${testName}`);
        console.log(`${'='.repeat(70)}`);

        await testFunction();

        // Test passed
        if (attempt > 1) {
          console.log(`\n✅ Test passed on retry attempt ${attempt - 1}`);
        }

        return {
          success: true,
          attempts: attempt,
          retried: attempt > 1,
        };
      } catch (error) {
        lastError = error;

        if (attempt <= maxAttempts) {
          console.error(`\n❌ Attempt ${attempt} failed: ${error.message}`);
          console.log(`   Will retry (${maxAttempts - attempt + 1} ${maxAttempts - attempt + 1 === 1 ? 'attempt' : 'attempts'} remaining)`);
        } else {
          console.error(`\n❌ All ${maxAttempts + 1} attempts failed`);
        }
      }
    }

    // All attempts failed
    throw new RetryExhaustedError(
      `Test failed after ${maxAttempts + 1} attempts: ${lastError.message}`,
      {
        attempts: maxAttempts + 1,
        originalError: lastError,
      }
    );
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Custom error for retry exhaustion
 */
class RetryExhaustedError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'RetryExhaustedError';
    this.attempts = details.attempts;
    this.originalError = details.originalError;
  }
}

module.exports = { TestRetry, RetryExhaustedError };
