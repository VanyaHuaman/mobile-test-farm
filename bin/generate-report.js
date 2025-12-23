#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Generate Allure HTML report from test results
 */

const ALLURE_RESULTS_DIR = path.join(__dirname, '../allure-results');
const ALLURE_REPORT_DIR = path.join(__dirname, '../allure-report');

console.log('\n📊 Generating Allure Report...\n');

// Check if allure-results directory exists
if (!fs.existsSync(ALLURE_RESULTS_DIR)) {
  console.error(`❌ No test results found at: ${ALLURE_RESULTS_DIR}`);
  console.log('💡 Run tests first to generate results\n');
  process.exit(1);
}

// Check if there are any result files
const files = fs.readdirSync(ALLURE_RESULTS_DIR);
if (files.length === 0) {
  console.error(`❌ No test result files found in: ${ALLURE_RESULTS_DIR}`);
  console.log('💡 Run tests first to generate results\n');
  process.exit(1);
}

console.log(`✅ Found ${files.length} result file(s)`);
console.log(`📁 Results directory: ${ALLURE_RESULTS_DIR}`);
console.log(`📁 Report directory: ${ALLURE_REPORT_DIR}\n`);

try {
  // Generate Allure report
  console.log('🔨 Generating HTML report...\n');

  execSync(`npx allure generate ${ALLURE_RESULTS_DIR} -o ${ALLURE_REPORT_DIR} --clean`, {
    stdio: 'inherit',
  });

  console.log('\n✅ Report generated successfully!');
  console.log(`📂 Report location: ${ALLURE_REPORT_DIR}/index.html`);
  console.log('\n💡 To view the report, run: npm run report:open\n');
} catch (error) {
  console.error('\n❌ Failed to generate report:', error.message);
  process.exit(1);
}
