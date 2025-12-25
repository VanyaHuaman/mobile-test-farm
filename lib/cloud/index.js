/**
 * Cloud Device Farm Providers
 *
 * Exports all cloud device farm provider classes and the manager
 */

const BaseCloudProvider = require('./BaseCloudProvider');
const BrowserStackProvider = require('./BrowserStackProvider');
const CloudDeviceManager = require('./CloudDeviceManager');

module.exports = {
  BaseCloudProvider,
  BrowserStackProvider,
  CloudDeviceManager,
  // TODO: Export other providers as they're implemented
  // SauceLabsProvider,
  // AWSDeviceFarmProvider,
  // FirebaseTestLabProvider,
};
