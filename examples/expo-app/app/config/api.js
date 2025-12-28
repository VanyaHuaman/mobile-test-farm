import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * API Configuration
 *
 * The app always uses the real API URL.
 * For testing with mocks, a MITM proxy transparently redirects traffic.
 */

// Get API base URL
const getApiBaseUrl = () => {
  // Always use the real API URL
  // MITM proxy will transparently redirect to Mockoon when tests are running
  const apiUrl = 'https://jsonplaceholder.typicode.com';

  console.log('[API Config] API URL:', apiUrl);
  return apiUrl;
};

// For Mockoon integration during tests:
// Android emulator: Use http://10.0.2.2:3001
// iOS simulator: Use http://localhost:3001
// Physical device: Use http://<your-ip>:3001
const getMockoonUrl = () => {
  if (Platform.OS === 'android') {
    // Android emulator localhost is 10.0.2.2
    return 'http://10.0.2.2:3001';
  } else {
    // iOS simulator can use localhost
    return 'http://localhost:3001';
  }
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  MOCKOON_URL: getMockoonUrl(),
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Helper to log API configuration
export const logApiConfig = () => {
  console.log('=== API Configuration ===');
  console.log('Base URL:', API_CONFIG.BASE_URL);
  console.log('Mockoon URL:', API_CONFIG.MOCKOON_URL);
  console.log('Platform:', Platform.OS);
  console.log('========================');
};
