module.exports = {
  expo: {
    name: 'expo-arch-example-app',
    slug: 'expo-arch-example-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.vanyahuaman.expoarchexampleapp',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: 'com.vanyahuaman.expoarchexampleapp',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-router'],
    extra: {
      // API base URL can be overridden via environment variable
      // This allows tests to point the app to Mockoon mock server
      API_BASE_URL: process.env.API_BASE_URL || null,
    },
  },
};
