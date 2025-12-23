#!/usr/bin/env node

const DeviceManager = require('../lib/device-manager');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const manager = new DeviceManager();

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function registerDeviceInteractive() {
  console.log('\n📝 Register New Device\n');

  // First, sync to show available devices (both Android and iOS)
  const { newDevices } = manager.syncAllDevices();

  if (newDevices.length === 0) {
    console.log('\n✅ All connected devices are already registered!\n');
    return;
  }

  console.log('\n📋 Available unregistered devices:\n');
  newDevices.forEach((device, index) => {
    const platformIcon = device.platform === 'android' ? '🤖' : '🍎';
    const typeIcon = device.type === 'simulator' ? '📲' : device.type === 'emulator' ? '🖥️ ' : '📱';
    console.log(`[${index + 1}] ${platformIcon} ${typeIcon} ${device.deviceId} (${device.model}) - ${device.platform}`);
  });

  const choice = await question('\nSelect device number (or "q" to quit): ');

  if (choice.toLowerCase() === 'q') {
    console.log('Cancelled.');
    return;
  }

  const index = parseInt(choice) - 1;
  if (index < 0 || index >= newDevices.length) {
    console.log('❌ Invalid selection');
    return;
  }

  const device = newDevices[index];

  console.log(`\n✅ Selected: ${device.deviceId} (${device.platform})\n`);

  const friendlyName = await question('Enter friendly name (e.g., "iPhone 15 Pro Simulator"): ');
  const id = friendlyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const osVersion = await question(`Enter OS version (default: "${device.osVersion || 'unknown'}"): `) || device.osVersion || 'unknown';
  const notes = await question('Enter notes (optional): ');

  try {
    manager.registerDevice(id, {
      friendlyName: friendlyName.trim(),
      deviceId: device.deviceId,
      platform: device.platform,
      type: device.type,
      model: device.model,
      osVersion: osVersion.trim(),
      notes: notes.trim(),
    });

    console.log(`\n✅ Device registered successfully!`);
    console.log(`   ID: ${id}`);
    console.log(`   Name: ${friendlyName}`);
    console.log(`   Device ID: ${device.deviceId}`);
    console.log(`   Platform: ${device.platform}\n`);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'list':
    case 'ls':
      manager.printDevices();
      rl.close();
      break;

    case 'sync':
      manager.syncAllDevices();
      console.log('');
      rl.close();
      break;

    case 'register':
    case 'add':
      await registerDeviceInteractive();
      rl.close();
      break;

    case 'remove':
    case 'rm':
      const deviceId = args[1];
      if (!deviceId) {
        console.log('❌ Usage: devices remove <device-id>');
        rl.close();
        return;
      }
      try {
        manager.unregisterDevice(deviceId);
        console.log(`✅ Device '${deviceId}' removed`);
      } catch (error) {
        console.error(`❌ Error: ${error.message}`);
      }
      rl.close();
      break;

    case 'get':
      const nameOrId = args[1];
      if (!nameOrId) {
        console.log('❌ Usage: devices get <name-or-id>');
        rl.close();
        return;
      }
      const device = manager.getDevice(nameOrId);
      if (device) {
        console.log('\n📱 Device Details:\n');
        console.log(JSON.stringify(device, null, 2));
        console.log('');
      } else {
        console.log(`❌ Device '${nameOrId}' not found`);
      }
      rl.close();
      break;

    case 'help':
    case '--help':
    case '-h':
    default:
      console.log(`
📱 Device Management Tool

Usage:
  devices <command> [options]

Commands:
  list, ls              List all registered devices
  sync                  Discover and sync connected Android devices
  register, add         Register a new device (interactive)
  remove, rm <id>       Remove a device from registry
  get <name-or-id>      Get device details
  help                  Show this help message

Examples:
  devices list
  devices sync
  devices register
  devices get lenovo-11-inch-tablet
  devices remove android-emulator-1

For more information, see docs/device-management.md
      `);
      rl.close();
      break;
  }
}

main().catch((error) => {
  console.error('❌ Error:', error);
  rl.close();
  process.exit(1);
});
