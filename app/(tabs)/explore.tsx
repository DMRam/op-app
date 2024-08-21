import axios from 'axios';
import React, { useState } from 'react';
import {ScrollView, SafeAreaView, Text, StyleSheet, View, ActivityIndicator, Button, TextInput, Alert } from 'react-native';

const axiosInstance = axios.create({
  baseURL: 'http://192.168.2.16:3000/api/', // Replace with your machine's local IP address
});

interface UserProfile {
  adminLevel: number;
  availableProfileNames: string[];
  canChangePassword: boolean;
  description: string;
  displayName: string;
  emailAddress: string;
  firstName: string;
  id: string;
  isDeleted: boolean;
  isEditable: boolean;
  isEnabled: boolean;
  isHidden: boolean;
  isLocked: boolean;
  isPasswordChangeFromAdmin: boolean;
  isSecurityAdministrator: boolean;
  isTemporaryPassword: boolean;
  lastName: string;
  localeISOCode: string;
  passwordCreationDate: string;
  passwordExpiresInDays: number;
  preferredProfileName: string;
  userName: string;
}

export default function TabTwoScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState(''); // Start with an empty string

  const getUserById = async (id: string) => {
    if (!id) {
      Alert.alert('Error', 'Please enter a user ID');
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.get<UserProfile>(`users/${id}`);
      setUser(response.data);
      setError(null); // Clear any previous errors
    } catch (error: any) {
      setError('Error fetching user');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchUser = () => {
    if (userId.trim() === '') {
      Alert.alert('Error', 'User ID cannot be empty');
    } else {
      getUserById(userId);
    }
  };

  const handleRetry = () => {
    handleFetchUser();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>User Details</Text>
        {user ? (
          <View style={styles.userContainer}>
            <Text style={styles.header}>Name:</Text>
            <Text style={styles.itemText}>{user.firstName} {user.lastName}</Text>

            <Text style={styles.header}>Username:</Text>
            <Text style={styles.itemText}>{user.userName}</Text>

            <Text style={styles.header}>Email:</Text>
            <Text style={styles.itemText}>{user.emailAddress}</Text>

            <Text style={styles.header}>Display Name:</Text>
            <Text style={styles.itemText}>{user.displayName}</Text>

            <Text style={styles.header}>Description:</Text>
            <Text style={styles.itemText}>{user.description}</Text>

            <Text style={styles.header}>Preferred Profile Name:</Text>
            <Text style={styles.itemText}>{user.preferredProfileName}</Text>

            <Text style={styles.header}>Available Profile Names:</Text>
            <Text style={styles.itemText}>{user.availableProfileNames.join(', ')}</Text>

            <Text style={styles.header}>Password Creation Date:</Text>
            <Text style={styles.itemText}>{new Date(user.passwordCreationDate).toLocaleDateString()}</Text>

            <Text style={styles.header}>Password Expires In Days:</Text>
            <Text style={styles.itemText}>{user.passwordExpiresInDays}</Text>

            <Text style={styles.header}>Admin Level:</Text>
            <Text style={styles.itemText}>{user.adminLevel}</Text>

            <Text style={styles.header}>Can Change Password:</Text>
            <Text style={styles.itemText}>{user.canChangePassword ? 'Yes' : 'No'}</Text>

            <Text style={styles.header}>Temporary Password:</Text>
            <Text style={styles.itemText}>{user.isTemporaryPassword ? 'Yes' : 'No'}</Text>

            <Text style={styles.header}>Password Change From Admin:</Text>
            <Text style={styles.itemText}>{user.isPasswordChangeFromAdmin ? 'Yes' : 'No'}</Text>

            <Text style={styles.header}>Locked:</Text>
            <Text style={styles.itemText}>{user.isLocked ? 'Yes' : 'No'}</Text>

            <Text style={styles.header}>Security Administrator:</Text>
            <Text style={styles.itemText}>{user.isSecurityAdministrator ? 'Yes' : 'No'}</Text>

            <Text style={styles.header}>Hidden:</Text>
            <Text style={styles.itemText}>{user.isHidden ? 'Yes' : 'No'}</Text>

            <Text style={styles.header}>Deleted:</Text>
            <Text style={styles.itemText}>{user.isDeleted ? 'Yes' : 'No'}</Text>

            <Text style={styles.header}>Enabled:</Text>
            <Text style={styles.itemText}>{user.isEnabled ? 'Yes' : 'No'}</Text>

            <Text style={styles.header}>Editable:</Text>
            <Text style={styles.itemText}>{user.isEditable ? 'Yes' : 'No'}</Text>
          </View>
        ) : (
          <Text style={styles.itemText}>No user details available</Text>
        )}

        <TextInput
          style={styles.input}
          value={userId}
          onChangeText={setUserId}
          placeholder="Enter user ID"
          keyboardType="numeric"
        />
        <Button title="Fetch User" onPress={handleFetchUser} />

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Retry" onPress={handleRetry} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
  },
  userContainer: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#e3e3e3',
    borderRadius: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  errorContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 8,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 12,
  },
});
