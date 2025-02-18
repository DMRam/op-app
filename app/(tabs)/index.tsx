import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  Text,
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  TextInput,
  Button,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // For navigation
import { axiosInstance } from '../api/AxiosInstance';

interface Role {
  id: string;
  groupName: string;
  description: string;
}

export default function HomeScreen({navigation}:any) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [instance, setInstance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState(''); // State to hold the new OpenPages URL input

  // Fetch roles from the backend
  const getRoles = async () => {
    try {
      const response = await axiosInstance.get('groups');

      // Extract instance URL
      setInstance(response.data.instance);

      // Convert object to an array, ignoring "instance"
      const groupsArray = Object.keys(response.data)
        .filter((key) => key !== "instance")
        .map((key) => response.data[key]);

      setRoles(groupsArray);
    } catch (error: any) {
      setError('Error fetching roles');
    } finally {
      setLoading(false);
    }
  };

  // Update the OpenPages URL
  const updateOpenPagesUrl = async () => {
    if (!newUrl) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      // Send the new URL to the backend
      await axiosInstance.post('/update-url', { newUrl });

      // Fetch data again with the updated URL
      setLoading(true);
      await getRoles();
    } catch (error: any) {
      setError('Error updating OpenPages URL');
    }
  };

  // Navigate to the UsersInGroup screen
  const navigateToUsersInGroup = (groupId: string) => {
    navigation.navigate('UsersInGroup', { groupId }); // Pass groupId as a parameter
  };

  // Initial fetch
  useEffect(() => {
    getRoles();
  }, []);

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
        {/* Input for new OpenPages URL */}
        <View style={styles.urlInputContainer}>
          <TextInput
            style={styles.urlInput}
            placeholder="Enter new OpenPages URL (e.g., 54.187.194.156)"
            value={newUrl}
            onChangeText={setNewUrl}
          />
          <Button title="Update OpenPages URL" onPress={updateOpenPagesUrl} />
        </View>

        {/* Display Instance */}
        {instance && (
          <View style={styles.instanceContainer}>
            <Text style={styles.instanceText}>Instance called:</Text>
            <Text style={styles.instanceUrl}>{instance}</Text>
          </View>
        )}

        <Text style={styles.title}>Groups within the instance</Text>

        {/* List of roles */}
        {roles.length > 0 ? (
          roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={styles.item}
              onPress={() => navigateToUsersInGroup(role.id)} // Navigate to UsersInGroup screen
            >
              <Text style={styles.itemText}>Group ID: {role.id}</Text>
              <Text style={styles.itemText}>{role.groupName}</Text>
              <Text style={styles.itemTextDes}>{role.description}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.itemText}>No roles available</Text>
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
  urlInputContainer: {
    margin: 20,
    marginBottom: 16,
  },
  urlInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  instanceContainer: {
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    margin: 20,
  },
  instanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0277bd',
  },
  instanceUrl: {
    fontSize: 16,
    color: '#01579b',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
  },
  item: {
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
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemTextDes: {
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 16,
  },
});