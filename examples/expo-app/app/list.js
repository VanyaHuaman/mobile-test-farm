import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

const INITIAL_ITEMS = [
  { id: '1', title: 'Complete project proposal', status: 'pending' },
  { id: '2', title: 'Review pull requests', status: 'completed' },
  { id: '3', title: 'Update documentation', status: 'pending' },
  { id: '4', title: 'Fix authentication bug', status: 'in-progress' },
  { id: '5', title: 'Deploy to staging', status: 'pending' },
  { id: '6', title: 'Write unit tests', status: 'completed' },
  { id: '7', title: 'Optimize database queries', status: 'pending' },
  { id: '8', title: 'Update dependencies', status: 'in-progress' },
  { id: '9', title: 'Code review session', status: 'completed' },
  { id: '10', title: 'Team standup meeting', status: 'pending' },
];

export default function ListScreen() {
  const router = useRouter();
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [filter, setFilter] = useState('all');

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#34C759';
      case 'in-progress':
        return '#FF9500';
      case 'pending':
        return '#8E8E93';
      default:
        return '#8E8E93';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Done';
      case 'in-progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const handleItemPress = (item) => {
    Alert.alert(
      item.title,
      `Status: ${getStatusLabel(item.status)}\nID: ${item.id}`,
      [{ text: 'OK' }]
    );
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => handleItemPress(item)}
      testID={`list-item-${item.id}`}
      accessibilityLabel={`list-item-${item.id}`}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          testID="back-button"
          accessibilityLabel="back-button"
        >
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task List</Text>
        <Text style={styles.itemCount}>{filteredItems.length} items</Text>
      </View>

      <View style={styles.filterContainer}>
        {['all', 'pending', 'in-progress', 'completed'].map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            style={[
              styles.filterButton,
              filter === filterOption && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(filterOption)}
            testID={`filter-${filterOption}`}
            accessibilityLabel={`filter-${filterOption}`}
          >
            <Text
              style={[
                styles.filterText,
                filter === filterOption && styles.filterTextActive,
              ]}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        testID="task-list"
        accessibilityLabel="task-list"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  itemCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  filterTextActive: {
    color: 'white',
  },
  listContent: {
    padding: 15,
  },
  listItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
