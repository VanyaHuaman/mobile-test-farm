import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  const profileData = {
    name: 'Demo User',
    email: 'demo@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    memberSince: '2024',
  };

  const settingsOptions = [
    { id: 1, title: 'Edit Profile', icon: '✏️' },
    { id: 2, title: 'Notifications', icon: '🔔' },
    { id: 3, title: 'Privacy', icon: '🔒' },
    { id: 4, title: 'Help & Support', icon: '❓' },
    { id: 5, title: 'About', icon: 'ℹ️' },
  ];

  const handleOptionPress = (option) => {
    Alert.alert(option.title, 'This is a demo action', [{ text: 'OK' }]);
  };

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
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>DU</Text>
          </View>
          <Text style={styles.profileName}>{profileData.name}</Text>
          <Text style={styles.profileEmail}>{profileData.email}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue} testID="profile-phone" accessibilityLabel="profile-phone">
              {profileData.phone}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue} testID="profile-location" accessibilityLabel="profile-location">
              {profileData.location}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue} testID="profile-member-since" accessibilityLabel="profile-member-since">
              {profileData.memberSince}
            </Text>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>

          {settingsOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.settingItem}
              onPress={() => handleOptionPress(option)}
              testID={`setting-${option.title.toLowerCase().replace(/\s+/g, '-')}`}
              accessibilityLabel={`setting-${option.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Text style={styles.settingIcon}>{option.icon}</Text>
              <Text style={styles.settingTitle}>{option.title}</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() =>
            Alert.alert(
              'Delete Account',
              'Are you sure you want to delete your account?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive' },
              ]
            )
          }
          testID="delete-account-button"
          accessibilityLabel="delete-account-button"
        >
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
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
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: 'white',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
  },
  infoSection: {
    backgroundColor: 'white',
    marginTop: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingsSection: {
    backgroundColor: 'white',
    marginTop: 20,
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  settingArrow: {
    fontSize: 20,
    color: '#999',
  },
  deleteButton: {
    margin: 20,
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
