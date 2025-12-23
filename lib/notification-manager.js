const https = require('https');
const http = require('http');
const { URL } = require('url');

/**
 * NotificationManager - Multi-platform notification system
 *
 * Supports:
 * - Slack
 * - Microsoft Teams
 * - Discord
 * - Email (via webhooks like SendGrid, Mailgun)
 * - Custom Webhooks
 *
 * Configuration via environment variables or config file
 */
class NotificationManager {
  constructor(config = {}) {
    this.config = {
      enabled: process.env.NOTIFICATIONS_ENABLED !== 'false',
      platforms: this.loadPlatformConfig(),
      ...config,
    };
  }

  /**
   * Load platform configurations from environment variables
   */
  loadPlatformConfig() {
    return {
      slack: {
        enabled: !!process.env.SLACK_WEBHOOK_URL,
        webhookUrl: process.env.SLACK_WEBHOOK_URL,
        channel: process.env.SLACK_CHANNEL,
        username: process.env.SLACK_USERNAME || 'Mobile Test Farm',
        iconEmoji: process.env.SLACK_ICON_EMOJI || ':robot_face:',
      },
      teams: {
        enabled: !!process.env.TEAMS_WEBHOOK_URL,
        webhookUrl: process.env.TEAMS_WEBHOOK_URL,
      },
      discord: {
        enabled: !!process.env.DISCORD_WEBHOOK_URL,
        webhookUrl: process.env.DISCORD_WEBHOOK_URL,
        username: process.env.DISCORD_USERNAME || 'Mobile Test Farm',
        avatarUrl: process.env.DISCORD_AVATAR_URL,
      },
      email: {
        enabled: !!process.env.EMAIL_WEBHOOK_URL,
        webhookUrl: process.env.EMAIL_WEBHOOK_URL,
        to: process.env.EMAIL_TO,
        from: process.env.EMAIL_FROM || 'noreply@mobile-test-farm.com',
      },
      webhook: {
        enabled: !!process.env.CUSTOM_WEBHOOK_URL,
        url: process.env.CUSTOM_WEBHOOK_URL,
        method: process.env.CUSTOM_WEBHOOK_METHOD || 'POST',
        headers: this.parseHeaders(process.env.CUSTOM_WEBHOOK_HEADERS),
      },
    };
  }

  /**
   * Parse custom headers from environment variable
   */
  parseHeaders(headersString) {
    if (!headersString) return {};

    try {
      return JSON.parse(headersString);
    } catch (e) {
      console.warn('Failed to parse CUSTOM_WEBHOOK_HEADERS:', e.message);
      return {};
    }
  }

  /**
   * Send notification to all enabled platforms
   */
  async sendNotification(notification) {
    if (!this.config.enabled) {
      console.log('📭 Notifications disabled');
      return { sent: false, reason: 'disabled' };
    }

    const results = [];

    // Send to each enabled platform
    if (this.config.platforms.slack.enabled) {
      results.push(await this.sendSlack(notification));
    }

    if (this.config.platforms.teams.enabled) {
      results.push(await this.sendTeams(notification));
    }

    if (this.config.platforms.discord.enabled) {
      results.push(await this.sendDiscord(notification));
    }

    if (this.config.platforms.email.enabled) {
      results.push(await this.sendEmail(notification));
    }

    if (this.config.platforms.webhook.enabled) {
      results.push(await this.sendWebhook(notification));
    }

    return {
      sent: results.some(r => r.success),
      results,
    };
  }

  /**
   * Send notification to Slack
   */
  async sendSlack(notification) {
    const config = this.config.platforms.slack;

    const payload = {
      channel: config.channel,
      username: config.username,
      icon_emoji: config.iconEmoji,
      attachments: [
        {
          color: this.getColor(notification.status),
          title: notification.title,
          text: notification.message,
          fields: notification.fields || [],
          footer: notification.footer || 'Mobile Test Farm',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    try {
      await this.sendWebhookRequest(config.webhookUrl, payload);
      console.log('✅ Slack notification sent');
      return { platform: 'slack', success: true };
    } catch (error) {
      console.error('❌ Slack notification failed:', error.message);
      return { platform: 'slack', success: false, error: error.message };
    }
  }

  /**
   * Send notification to Microsoft Teams
   */
  async sendTeams(notification) {
    const config = this.config.platforms.teams;

    const payload = {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      summary: notification.title,
      themeColor: this.getColor(notification.status),
      title: notification.title,
      text: notification.message,
      sections: notification.fields
        ? [
            {
              facts: notification.fields.map(f => ({
                name: f.title,
                value: f.value,
              })),
            },
          ]
        : [],
    };

    try {
      await this.sendWebhookRequest(config.webhookUrl, payload);
      console.log('✅ Teams notification sent');
      return { platform: 'teams', success: true };
    } catch (error) {
      console.error('❌ Teams notification failed:', error.message);
      return { platform: 'teams', success: false, error: error.message };
    }
  }

  /**
   * Send notification to Discord
   */
  async sendDiscord(notification) {
    const config = this.config.platforms.discord;

    const payload = {
      username: config.username,
      avatar_url: config.avatarUrl,
      embeds: [
        {
          title: notification.title,
          description: notification.message,
          color: parseInt(this.getColor(notification.status).replace('#', ''), 16),
          fields: notification.fields || [],
          footer: {
            text: notification.footer || 'Mobile Test Farm',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    try {
      await this.sendWebhookRequest(config.webhookUrl, payload);
      console.log('✅ Discord notification sent');
      return { platform: 'discord', success: true };
    } catch (error) {
      console.error('❌ Discord notification failed:', error.message);
      return { platform: 'discord', success: false, error: error.message };
    }
  }

  /**
   * Send notification via Email webhook
   */
  async sendEmail(notification) {
    const config = this.config.platforms.email;

    const payload = {
      to: config.to,
      from: config.from,
      subject: notification.title,
      text: notification.message,
      html: this.formatEmailHTML(notification),
    };

    try {
      await this.sendWebhookRequest(config.webhookUrl, payload);
      console.log('✅ Email notification sent');
      return { platform: 'email', success: true };
    } catch (error) {
      console.error('❌ Email notification failed:', error.message);
      return { platform: 'email', success: false, error: error.message };
    }
  }

  /**
   * Send notification to custom webhook
   */
  async sendWebhook(notification) {
    const config = this.config.platforms.webhook;

    try {
      await this.sendWebhookRequest(
        config.url,
        notification,
        config.method,
        config.headers
      );
      console.log('✅ Custom webhook notification sent');
      return { platform: 'webhook', success: true };
    } catch (error) {
      console.error('❌ Custom webhook notification failed:', error.message);
      return { platform: 'webhook', success: false, error: error.message };
    }
  }

  /**
   * Send HTTP request to webhook URL
   */
  sendWebhookRequest(url, payload, method = 'POST', customHeaders = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      const data = JSON.stringify(payload);

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...customHeaders,
        },
      };

      const req = protocol.request(options, res => {
        let responseData = '';

        res.on('data', chunk => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ statusCode: res.statusCode, data: responseData });
          } else {
            reject(
              new Error(`HTTP ${res.statusCode}: ${responseData || res.statusMessage}`)
            );
          }
        });
      });

      req.on('error', error => {
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  /**
   * Get color based on status
   */
  getColor(status) {
    const colors = {
      success: '#36a64f',
      failure: '#ff0000',
      warning: '#ff9900',
      info: '#0099ff',
    };

    return colors[status] || colors.info;
  }

  /**
   * Format email HTML
   */
  formatEmailHTML(notification) {
    const color = this.getColor(notification.status);

    let fieldsHTML = '';
    if (notification.fields && notification.fields.length > 0) {
      fieldsHTML = `
        <table style="width: 100%; margin-top: 20px;">
          ${notification.fields
            .map(
              field => `
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 40%;">${field.title}:</td>
              <td style="padding: 8px;">${field.value}</td>
            </tr>
          `
            )
            .join('')}
        </table>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${color}; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
          .footer { background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #666; }
          table { border-collapse: collapse; }
          tr { border-bottom: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${notification.title}</h2>
          </div>
          <div class="content">
            <p>${notification.message}</p>
            ${fieldsHTML}
          </div>
          <div class="footer">
            ${notification.footer || 'Mobile Test Farm'}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send test success notification
   */
  async notifySuccess(testName, details = {}) {
    return this.sendNotification({
      status: 'success',
      title: `✅ Test Passed: ${testName}`,
      message: details.message || 'All tests passed successfully!',
      fields: [
        { title: 'Test Suite', value: testName, short: true },
        { title: 'Duration', value: details.duration || 'N/A', short: true },
        { title: 'Device', value: details.device || 'N/A', short: true },
        { title: 'Platform', value: details.platform || 'N/A', short: true },
        ...(details.fields || []),
      ],
      footer: details.footer,
    });
  }

  /**
   * Send test failure notification
   */
  async notifyFailure(testName, details = {}) {
    return this.sendNotification({
      status: 'failure',
      title: `❌ Test Failed: ${testName}`,
      message: details.message || 'Test execution failed!',
      fields: [
        { title: 'Test Suite', value: testName, short: true },
        { title: 'Duration', value: details.duration || 'N/A', short: true },
        { title: 'Device', value: details.device || 'N/A', short: true },
        { title: 'Platform', value: details.platform || 'N/A', short: true },
        { title: 'Error', value: details.error || 'Unknown error', short: false },
        ...(details.fields || []),
      ],
      footer: details.footer,
    });
  }

  /**
   * Send test summary notification
   */
  async notifySummary(summary) {
    const status = summary.failed > 0 ? 'failure' : 'success';
    const title =
      summary.failed > 0
        ? `⚠️ Test Suite Completed with Failures`
        : `✅ Test Suite Completed Successfully`;

    return this.sendNotification({
      status,
      title,
      message: `Test execution completed. ${summary.passed} passed, ${summary.failed} failed out of ${summary.total} tests.`,
      fields: [
        { title: 'Total Tests', value: summary.total.toString(), short: true },
        { title: 'Passed', value: summary.passed.toString(), short: true },
        { title: 'Failed', value: summary.failed.toString(), short: true },
        { title: 'Duration', value: summary.duration || 'N/A', short: true },
        { title: 'Success Rate', value: `${summary.successRate}%`, short: true },
        { title: 'Devices', value: summary.devices || 'N/A', short: true },
        ...(summary.fields || []),
      ],
      footer: summary.footer,
    });
  }
}

module.exports = NotificationManager;
