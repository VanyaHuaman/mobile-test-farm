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
import { postsApi } from './services/posts';

export default function PostsScreen() {
  const router = useRouter();

  // Fetch posts with TanStack Query
  const {
    data: posts,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['posts'],
    queryFn: postsApi.getAll,
  });

  const renderPost = ({ item }) => (
    <View style={styles.postCard} testID={`post-card-${item.id}`} accessibilityLabel={`post-card-${item.id}`}>
      <View style={styles.postHeader}>
        <Text style={styles.postId} testID={`post-id-${item.id}`} accessibilityLabel={`post-id-${item.id}`}>
          Post #{item.id}
        </Text>
        <Text style={styles.userId} testID={`post-user-id-${item.id}`} accessibilityLabel={`post-user-id-${item.id}`}>
          User #{item.userId}
        </Text>
      </View>
      <Text style={styles.postTitle} testID={`post-title-${item.id}`} accessibilityLabel={`post-title-${item.id}`}>
        {item.title}
      </Text>
      <Text style={styles.postBody} testID={`post-body-${item.id}`} accessibilityLabel={`post-body-${item.id}`} numberOfLines={3}>
        {item.body}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} testID="posts-screen" accessibilityLabel="posts-screen">
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
        <Text style={styles.headerTitle}>Posts</Text>
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
          <ActivityIndicator size="large" color="#34C759" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      )}

      {/* Error State */}
      {isError && (
        <View style={styles.centerContainer} testID="error-container" accessibilityLabel="error-container">
          <Text style={styles.errorText}>❌ Error loading posts</Text>
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

      {/* Success State - Posts List */}
      {!isLoading && !isError && posts && (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          testID="posts-list"
          accessibilityLabel="posts-list"
          ListHeaderComponent={
            <Text style={styles.listHeader} testID="posts-count">
              {posts.length} posts found
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
    backgroundColor: '#34C759',
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
    backgroundColor: '#34C759',
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
  postCard: {
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
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  userId: {
    fontSize: 12,
    color: '#999',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  postBody: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
