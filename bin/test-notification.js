#!/usr/bin/env node

/**
 * Test Notification CLI
 *
 * Quick tool to test notification configurations
 */

const NotificationManager = require('../lib/notification-manager');

async function testNotifications() {
  console.log('\n🔔 Testing Notification Configuration\n');
  console.log('=' .repeat(70));

  const notifier = new NotificationManager();

  // Check which platforms are enabled
  console.log('\n📡 Enabled Platforms:');
  let enabledCount = 0;

  Object.entries(notifier.config.platforms).forEach(([platform, config]) => {
    const status = config.enabled ? '✅' : '❌';
    console.log(`   ${status} ${platform.padEnd(10)} ${config.enabled ? '(configured)' : '(not configured)'}`);
    if (config.enabled) enabledCount++;
  });

  if (enabledCount === 0) {
    console.log('\n⚠️  No notification platforms configured!');
    console.log('\nTo configure notifications, set environment variables in .env file:');
    console.log('  - SLACK_WEBHOOK_URL');
    console.log('  - TEAMS_WEBHOOK_URL');
    console.log('  - DISCORD_WEBHOOK_URL');
    console.log('  - EMAIL_WEBHOOK_URL');
    console.log('  - CUSTOM_WEBHOOK_URL');
    console.log('\nSee .env.example for full configuration options.\n');
    process.exit(0);
  }

  console.log(`\n✅ Found ${enabledCount} configured platform(s)\n`);
  console.log('=' .repeat(70));

  // Send test notification
  console.log('\n📤 Sending test notification...\n');

  try {
    const result = await notifier.notifySuccess('Test Notification', {
      message: 'This is a test notification from Mobile Test Farm!',
      device: 'Test Device',
      platform: 'Test Platform',
      duration: '5s',
      fields: [
        { title: 'Status', value: 'Testing', short: true },
        { title: 'Sent At', value: new Date().toLocaleString(), short: true },
      ],
      footer: 'Mobile Test Farm - Notification Test',
    });

    console.log('\n✅ Notification sent successfully!\n');
    console.log('Results:');
    result.results.forEach(r => {
      const status = r.success ? '✅' : '❌';
      console.log(`   ${status} ${r.platform.padEnd(10)} ${r.success ? 'sent' : `failed: ${r.error}`}`);
    });

    console.log('\n✨ Check your notification channels for the test message!\n');
  } catch (error) {
    console.error('\n❌ Notification test failed:', error.message);
    console.error('\nPlease check your notification configuration in .env file.\n');
    process.exit(1);
  }
}

// Run test
testNotifications();
