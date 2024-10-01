import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, ActivityIndicator, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import { useLazyQuery, useMutation, gql } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_USERS = gql`
  query Query($keyword: String!) {
    searchUsers(keyword: $keyword) {
      _id
      username
    }
  }
`;

const FOLLOW_USER = gql`
  mutation FollowUser($followingId: ID!) {
    followUser(followingId: $followingId) {
      _id
      following {
        username
      }
    }
  }
`;

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchUsers, { loading, data, error }] = useLazyQuery(SEARCH_USERS);
  const [followUser] = useMutation(FOLLOW_USER);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        searchUsers({ variables: { keyword: searchQuery } }).then(response => {
          setSearchResults(response.data.searchUsers);
        });
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchUsers]);

  const handleFollow = async (userId) => {
    try {
      const storedData = await AsyncStorage.getItem('userData')
      const parsedData = storedData ? JSON.parse(storedData) : null

      const token = parsedData?.token || null

      const { data } = await followUser({
        variables: { followingId: userId },
        context: {
          headers: {
            authorization: token ? `Bearer ${token}` : '',
          },
        },
      });

      Alert.alert("Followed", `You are now following ${data.followUser.following.username}`);
    } catch (err) {
      Alert.alert("Error", "Failed to follow the user. Please try again.");
      console.error(err);
    }
  };

  const handleNavigateToProfile = (userId) => {
    navigation.navigate('Profile', { getUserId: userId });
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search users..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.input}
      />

      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}
      {error && <Text style={styles.errorText}>Error: {error.message}</Text>}

      {searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              <View style={styles.userInfo}>
                <Image 
                  source={{ uri: 'https://via.placeholder.com/50' }} 
                  style={styles.userImage} 
                />
                <TouchableOpacity onPress={() => handleNavigateToProfile(item._id)}>
                  <Text style={styles.username}>{item.username}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => handleFollow(item._id)}>
                <Text style={styles.followButton}>Follow</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : searchQuery === '' ? (
        <View style={styles.centered}>
          <Text>Please enter a username to search.</Text>
        </View>
      ) : (
        <View style={styles.centered}>
          <Text>No users found.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    marginTop: 20,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  username: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  followButton: {
    color: '#1E90FF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centered: {
    alignItems: 'center',
    marginTop: 20,
  },
});
