import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function FormScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    bio: '',
    notifications: true,
    newsletter: false,
  });

  const handleSubmit = () => {
    Alert.alert(
      'Form Submitted',
      `Name: ${formData.name}\nEmail: ${formData.email}\nAge: ${formData.age}`,
      [{ text: 'OK' }]
    );
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
        <Text style={styles.headerTitle}>User Form</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={formData.name}
          onChangeText={(value) => updateField('name', value)}
          testID="name-input"
          accessibilityLabel="name-input"
        />

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={formData.email}
          onChangeText={(value) => updateField('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          testID="email-input"
          accessibilityLabel="email-input"
        />

        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your age"
          value={formData.age}
          onChangeText={(value) => updateField('age', value)}
          keyboardType="numeric"
          testID="age-input"
          accessibilityLabel="age-input"
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell us about yourself"
          value={formData.bio}
          onChangeText={(value) => updateField('bio', value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          testID="bio-input"
          accessibilityLabel="bio-input"
        />

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Enable Notifications</Text>
          <Switch
            value={formData.notifications}
            onValueChange={(value) => updateField('notifications', value)}
            testID="notifications-switch"
            accessibilityLabel="notifications-switch"
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Subscribe to Newsletter</Text>
          <Switch
            value={formData.newsletter}
            onValueChange={(value) => updateField('newsletter', value)}
            testID="newsletter-switch"
            accessibilityLabel="newsletter-switch"
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          testID="submit-button"
          accessibilityLabel="submit-button"
        >
          <Text style={styles.submitButtonText}>Submit Form</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={() =>
            setFormData({
              name: '',
              email: '',
              age: '',
              bio: '',
              notifications: true,
              newsletter: false,
            })
          }
          testID="clear-button"
          accessibilityLabel="clear-button"
        >
          <Text style={styles.clearButtonText}>Clear Form</Text>
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
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    paddingTop: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: 'transparent',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  clearButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
