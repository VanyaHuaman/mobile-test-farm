import { Stack } from 'expo-router';
import { QueryProvider } from './contexts/QueryProvider';
import { logApiConfig } from './config/api';

export default function RootLayout() {
  // Log API configuration on app start
  logApiConfig();

  return (
    <QueryProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="form" />
        <Stack.Screen name="list" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="users" />
        <Stack.Screen name="posts" />
      </Stack>
    </QueryProvider>
  );
}
