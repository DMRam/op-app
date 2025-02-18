import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  Text,
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router'; // Import useLocalSearchParams
import { axiosInstance } from '../api/AxiosInstance';

interface User {
  id: string;
  userName: string;
  emailAddress: string;
  isEnabled: boolean;
}

export default function UsersInGroup() {
  const { groupId } = useLocalSearchParams(); // Get groupId from the URL
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users in the group
  const fetchUsersInGroup = async () => {
    try {
      const response = await axiosInstance.get(`users_by_groupId/${groupId}`);
      setUsers(response.data);
    } catch (error: any) {
      setError('Error fetching users in group');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUsersInGroup();
  }, [groupId]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Users in Group {groupId}</Text>

        {users.length > 0 ? (
          users.map((user) => (
            <View key={user.id} style={styles.userContainer}>
              <Text style={styles.userName}>{user.userName}</Text>
              <Text style={styles.userEmail}>{user.emailAddress}</Text>
              <Text style={styles.userStatus}>
                {user.isEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          ))
        ) : (
          <Text>No users available</Text>
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
  scrollContainer: {
    paddingVertical: 16,
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
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  userStatus: {
    fontSize: 14,
    color: '#888',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 16,
  },
});