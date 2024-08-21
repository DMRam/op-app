import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet, ScrollView, View, ActivityIndicator, Alert } from 'react-native';

const axiosInstance = axios.create({
  baseURL: 'http://192.168.2.16:3000/api/', // Replace with your machine's local IP address
});

interface Role {
  id: string;
  roleName: string;
  description: string;
}

export default function HomeScreen() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getRoles = async () => {
    try {
      const response = await axiosInstance.get<Role[]>('roles');
      setRoles(response.data);
    } catch (error: any) {
      setError('Error fetching roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRoles();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

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
        <Text style={styles.title}>Roles List</Text>
        {roles.length > 0 ? (
          roles.map((role) => (
            <View key={role.id} style={styles.item}>
              <Text style={styles.itemText}>{role.roleName}</Text>
              <Text style={styles.itemTextDes}>{role.description}</Text>
            </View>
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
