import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { usersApi } from './services/users';

export default function UsersScreen() {
  const router = useRouter();

  // Fetch users with TanStack Query
  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  const renderUser = ({ item }) => (
    <View style={styles.userCard} testID={`user-card-${item.id}`} accessibilityLabel={`user-card-${item.id}`}>
      <View style={styles.userHeader}>
        <Text style={styles.userName} testID={`user-name-${item.id}`} accessibilityLabel={`user-name-${item.id}`}>
          {item.name}
        </Text>
        <Text style={styles.userId} testID={`user-id-${item.id}`} accessibilityLabel={`user-id-${item.id}`}>
          #{item.id}
        </Text>
      </View>
      <Text style={styles.userEmail} testID={`user-email-${item.id}`} accessibilityLabel={`user-email-${item.id}`}>
        📧 {item.email}
      </Text>
      <Text style={styles.userPhone} testID={`user-phone-${item.id}`} accessibilityLabel={`user-phone-${item.id}`}>
        📱 {item.phone}
      </Text>
      <Text style={styles.userWebsite} testID={`user-website-${item.id}`} accessibilityLabel={`user-website-${item.id}`}>
        🌐 {item.website}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} testID="users-screen" accessibilityLabel="users-screen">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
          accessibilityLabel="back-button"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Users</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => refetch()}
          testID="refresh-button"
          accessibilityLabel="refresh-button"
        >
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.centerContainer} testID="loading-indicator" accessibilityLabel="loading-indicator">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      )}

      {/* Error State */}
      {isError && (
        <View style={styles.centerContainer} testID="error-container" accessibilityLabel="error-container">
          <Text style={styles.errorText}>❌ Error loading users</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
            testID="retry-button"
            accessibilityLabel="retry-button"
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Success State - Users List */}
      {!isLoading && !isError && users && (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          testID="users-list"
          accessibilityLabel="users-list"
          ListHeaderComponent={
            <Text style={styles.listHeader} testID="users-count">
              {users.length} users found
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#007AFF',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff3b30',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  listHeader: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  userId: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  userWebsite: {
    fontSize: 14,
    color: '#007AFF',
  },
});
