/**
 * Cloud Device Farm Providers
 *
 * Exports all cloud device farm provider classes and the manager
 */

const BaseCloudProvider = require('./BaseCloudProvider');
const BrowserStackProvider = require('./BrowserStackProvider');
const SauceLabsProvider = require('./SauceLabsProvider');
const AWSDeviceFarmProvider = require('./AWSDeviceFarmProvider');
const FirebaseTestLabProvider = require('./FirebaseTestLabProvider');
const CloudDeviceManager = require('./CloudDeviceManager');

module.exports = {
  BaseCloudProvider,
  BrowserStackProvider,
  SauceLabsProvider,
  AWSDeviceFarmProvider,
  FirebaseTestLabProvider,
  CloudDeviceManager,
};
