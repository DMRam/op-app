import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  SafeAreaView,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  Button,
  TextInput,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Switch,
} from 'react-native';
import { axiosInstance } from '../api/AxiosInstance';

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
  groups?: Array<{
    id: string;
    groupName: string;
    description: string;
    isLocked: boolean;
    isHidden: boolean;
    isDeleted: boolean;
    isEnabled: boolean;
    isEditable: boolean;
    hasMembers: boolean;
    adminLevel: number;
  }>;
}

export default function TabTwoScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [showInputForm, setShowInputForm] = useState(true);
  const [filterEnabled, setFilterEnabled] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [idsToGetGroups, setIdsToGetGroups] = useState<string[]>([]);
  const [showGroups, setShowGroups] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [removed, setRemoved] = useState<boolean>(false)
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});
  const [expanded, setExpanded] = useState(false);

  // Recalculate filteredUsers whenever users or filters change
  useEffect(() => {
    const filtered = users.filter((user) => {

      // Filtering by all users disable status
      const matchesEnabled = !filterEnabled || user.isEnabled === false;
      const matchesEmail = user.emailAddress.toLowerCase().includes(searchEmail.toLowerCase());
      return matchesEnabled && matchesEmail;
    });
    setFilteredUsers(filtered);
  }, [users, filterEnabled, searchEmail, removed]);

  const getDisabledUsersPerGroup = () => {
    const groupMap: { [key: string]: { id: string; groupName: string; disabledCount: number } } = {};

    users.forEach((user) => {
      if (!user.isEnabled && user.groups) {
        user.groups.forEach((group) => {
          if (!groupMap[group.id]) {
            groupMap[group.id] = {
              id: group.id, // Ensure the ID is stored
              groupName: group.groupName,
              disabledCount: 0,
            };
          }
          groupMap[group.id].disabledCount += 1;
        });
      }
    });

    return Object.values(groupMap); // Convert to an array of groups with disabled user counts
  };


  // Fetch groups for enabled users
  const fetchGroupsForEnabledUsers = async () => {
    if (idsToGetGroups.length === 0) {
      Alert.alert('Info', 'No enabled users to fetch groups for.');
      return;
    }

    setLoading(true);
    try {
      const usersWithGroups = await Promise.all(
        idsToGetGroups.map(async (id) => {
          const user = users.find((user) => user.id === id);
          if (!user) {
            throw new Error(`User with ID ${id} not found.`);
          }

          try {
            const response = await axiosInstance.get(`group_that_user_belongs/${id}`);
            const userData = response.data.user;
            const groups = userData.groups;

            console.log(`Groups for user ${id}:`, JSON.stringify(groups));

            const userWithGroups: UserProfile = {
              ...user,
              groups: groups,
            };

            // Group 1 hast x number of users
            // Group 2 hast x number of users
            // Group 3 hast x number of users

            return userWithGroups;
          } catch (error) {
            console.error(`Error fetching groups for user ${id}:`, error);
            return {
              ...user,
              groups: [],
            };
          }
        })
      );

      setUsers(usersWithGroups);
      setShowGroups(true);
    } catch (error) {
      console.error('Error fetching groups for users:', error);
      setError('Error fetching groups for users');
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId], // Toggle the expanded state
    }));
  };

  const getUserById = async (id: string) => {
    if (!id) {
      Alert.alert('Error', 'Please enter a user ID');
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.get<UserProfile>(`users/${id}`);
      setUser(response.data);
      setUsers([]);
      setError(null);
      setShowInputForm(false);
    } catch (error: any) {
      setError('Error fetching user');
    } finally {
      setLoading(false);
    }
  };

  const getUserByGroupId = async (id: string) => {
    if (!id) {
      Alert.alert('Error', 'Please enter a group ID');
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.get<UserProfile[]>(`users_by_groupId/${id}`);
      const enabledUsers = response.data.filter((user) => user.isEnabled === false);

      setUsers(response.data);

      setIdsToGetGroups(enabledUsers.map((user) => user.id));
      setUser(null);
      setError(null);
      setShowInputForm(false);
    } catch (error: any) {
      setError('Error fetching users by group');
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

  const handleFetchUserByGroupId = () => {
    if (groupId.trim() === '') {
      Alert.alert('Error', 'Group ID cannot be empty');
    } else {
      getUserByGroupId(groupId);
    }
  };

  const handleGoBack = () => {
    setUser(null);
    setUsers([]);
    setShowInputForm(true);
    setShowGroups(false);
    setSelectedUserIds([]);
  };
  // Pass the entire list of the users that needs to be removed from a single group
  const removeUsersFromGroup = async (groupId: string, userIds: string[]) => {
    try {
      const response = await axiosInstance.delete(`groups/${groupId}/users`, {
        data: { value: userIds.join(',') }, // Send user IDs in the request body
        headers: {
          'Content-Type': 'application/json', // Ensure the Content-Type header is set
        },
      });

      if (response.status === 200) {
        Alert.alert('Success', response.data.message);
        setRemoved(!removed)
        // fetchUsersInGroup(groupId); // Refresh the list of users in the group
      } else {
        Alert.alert('Error', response.data.error || 'Failed to remove users from group.');
      }
    } catch (error) {
      console.error('Error removing users from group:', error);
      Alert.alert('Error', 'An error occurred while removing users from the group.');
    }
  };

  const renderUserItem = ({ item }: { item: UserProfile }) => {

    const handleRemoveUserFromGroup = (groupId: string) => {
      Alert.alert(
        "Remove User from Group",
        `Are you sure you want to remove ${item.userName} from this group?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Remove", onPress: () => removeUsersFromGroup(groupId, [item.id]) }
        ]
      );
    };

    return (
      <View key={item.id}>
        <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.accordionHeader}>
          <Text style={styles.header}>{expanded ? '▼' : '▶'} {item.firstName} {item.lastName}</Text>
        </TouchableOpacity>
        {expanded && (
          <View style={[styles.userContainer, selectedUserIds.includes(item.id) && styles.selectedUserContainer]}>
            <Text style={styles.header}>Username:</Text>
            <Text style={styles.itemText}>{item.userName}</Text>
            <Text style={styles.header}>Email:</Text>
            <Text style={styles.itemText}>{item.emailAddress}</Text>
            <Text style={styles.header}>Enabled:</Text>
            <Text style={styles.itemText}>{item.isEnabled ? 'Yes' : 'No'}</Text>

            {item.groups && item.groups.length > 0 ? (
              <>
                <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.accordionHeader}>
                  <Text style={styles.header}>Groups:</Text>
                </TouchableOpacity>
                {item.groups.map((group) => (
                  <TouchableOpacity
                    key={group.id} // Ensure each group has a unique key
                    style={styles.groupContainer}
                    onLongPress={() => handleRemoveUserFromGroup(group.id)}
                  >
                    <Text style={styles.groupText}>Name: {group.groupName}</Text>
                    <Text style={styles.groupText}>Description: {group.description}</Text>
                    <Text style={styles.groupText}>Admin Level: {group.adminLevel}</Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <Text style={styles.itemText}>No groups available</Text>
            )}
            {selectedUserIds.includes(item.id) && <Text style={styles.selectedIcon}>✓</Text>}
          </View>
        )}
      </View>
    );

  };


  interface Group {
    id: string;
    groupName: string;
    description: string;
    isLocked: boolean;
    isHidden: boolean;
    isDeleted: boolean;
    isEnabled: boolean;
    isEditable: boolean;
    hasMembers: boolean;
    adminLevel: number;
  }

  const renderGroupCards = () => {
    // Use the correct inferred type instead of forcing it to be `Group[]`
    const disabledUsersPerGroup = getDisabledUsersPerGroup();

    return disabledUsersPerGroup.map((group) => (
      <View key={group.id || group.groupName} style={styles.groupCard}>
        <TouchableOpacity
          onPress={() => toggleGroup(group.groupName)}
          style={styles.groupHeader}
        >
          <View style={{ flexDirection: 'column', marginVertical: 2 }}>
            <Text style={styles.groupName}>{group.groupName}</Text>
            <Text style={styles.disabledCount}>
              {group.disabledCount} disabled users
            </Text>
          </View>

          <Text style={styles.accordionIcon}>
            {expandedGroups[group.groupName] ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {expandedGroups[group.groupName] && (
          <View style={styles.groupContent}>
            <FlatList
              data={users.filter(
                (user) =>
                  !user.isEnabled &&
                  user.groups?.some((g) => g.groupName === group.groupName)
              )}
              renderItem={({ item }) => (
                <View style={styles.userItem} key={item.id || item.userName}>
                  <Text style={styles.userName}>{item.userName}</Text>
                  <Text style={styles.userEmail}>{item.emailAddress}</Text>
                </View>
              )}
              keyExtractor={(item) => item.id || item.userName}
              scrollEnabled={false}
            />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteDisabledUsers(group.groupName)}
            >
              <Text style={styles.deleteButtonText}>Delete Disabled Users</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    ));
  };



  const handleDeleteDisabledUsers = (groupName: string) => {
    // Find all disabled users in the specified group
    const disabledUserIds = users
      .filter((user) => !user.isEnabled && user.groups?.some((group) => group.groupName === groupName))
      .map((user) => user.id);

    if (disabledUserIds.length === 0) {
      Alert.alert('Info', 'No disabled users found in this group.');
      return;
    }

    Alert.alert(
      'Confirm Removal',
      `Are you sure you want to remove ${disabledUserIds.length} disabled users from ${groupName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => removeUsersFromGroup(groupName, disabledUserIds),
        },
      ]
    );
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>User Details</Text>
        <Text style={styles.title}>Displaying {filteredUsers.length} users</Text>
        {showInputForm ? (
          <>
            <Text style={styles.itemText}>No user details available</Text>
            <View>
              <Text style={styles.header}>Get Users by ID:</Text>
              <TextInput
                style={styles.input}
                value={userId}
                onChangeText={(value) => setUserId(value)}
                placeholder="Enter user ID"
                keyboardType="numeric"
              />
              <Button title="Fetch User" onPress={handleFetchUser} />

              <Text style={styles.header}>Get Users by Group:</Text>
              <TextInput
                style={styles.input}
                value={groupId}
                onChangeText={(value) => setGroupId(value)}
                placeholder="Enter group ID"
                keyboardType="numeric"
              />
              <TouchableOpacity onPress={handleFetchUserByGroupId} style={styles.button}>
                <Text style={styles.buttonText}>Fetch User by Group</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : user ? (
          <>
            <View style={styles.userContainer}>
              <Text style={styles.header}>Name:</Text>
              <Text style={styles.itemText}>{user.firstName} {user.lastName}</Text>
              <Text style={styles.header}>Username:</Text>
              <Text style={styles.itemText}>{user.userName}</Text>
              <Text style={styles.header}>Email:</Text>
              <Text style={styles.itemText}>{user.emailAddress}</Text>
              <Text style={styles.header}>Enabled:</Text>
              <Text style={styles.itemText}>{user.isEnabled ? 'Yes' : 'No'}</Text>
            </View>
          </>
        ) : users.length > 0 ? (
          <View key={userId}>
            {/* Filters */}
            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Show Disabled Users Only:</Text>
              <Switch
                value={filterEnabled}
                onValueChange={(value) => setFilterEnabled(value)}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={filterEnabled ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>
            <TextInput
              style={styles.searchInput}
              value={searchEmail}
              onChangeText={(value) => setSearchEmail(value)}
              placeholder="Search by email"
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={fetchGroupsForEnabledUsers} style={styles.button}>
              <Text style={styles.buttonText}>Fetch Groups for Disabled Users</Text>
            </TouchableOpacity>
            {/* Render group cards with accordion */}
            {renderGroupCards()}
            {filteredUsers.map((user) => renderUserItem({ item: user }))}
          </View>
        ) : null}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Retry" onPress={handleGoBack} />
          </View>
        )}
      </ScrollView>

      {/* Floating "Go Back" Button */}
      {!showInputForm && (
        <TouchableOpacity onPress={handleGoBack} style={styles.floatingButton}>
          <Text style={styles.floatingButtonText}>Go Back</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#f5f5f5',
    marginTop: 20,
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
  selectedUserContainer: {
    backgroundColor: '#c3e6cb',
  },
  groupCard: {
    marginVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden', // Ensure content doesn't overflow
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledCount: {
    fontSize: 16,
    color: '#ff4444',
    marginTop: 5
  },
  accordionIcon: {
    fontSize: 18,
    color: '#007bff',
  },
  groupContent: {
    padding: 16,
  },
  userItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  groupContainer: {
    marginVertical: 8,
    padding: 8,
    backgroundColor: '#d3d3d3',
    borderRadius: 4,
  },
  groupText: {
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  searchInput: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: 'white',
    marginTop: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    marginRight: 8,
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
    marginBottom: 8,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedIcon: {
    fontSize: 20,
    color: '#28a745',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 8,
  },


});