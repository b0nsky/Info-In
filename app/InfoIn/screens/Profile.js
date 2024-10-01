import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useQuery, gql } from '@apollo/client';

const GET_USER_QUERY = gql`
  query Query($getUserId: ID!) {
    getUser(id: $getUserId) {
      _id
      name
      username
      email
      followers {
        _id
        name
        username
        email
      }
      following {
        _id
        name
        username
        email
      }
    }
  }
`;

export default function ProfileScreen({ route }) {
  const { getUserId } = route.params;
  const { data, loading, error } = useQuery(GET_USER_QUERY, {
    variables: { getUserId },
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    if (data) {
      setUser(data.getUser);
    }
  }, [data]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user && (
        <>
          <View style={styles.profileInfo}>
            <Image
              source={require('../assets/user.png')}
              style={styles.profileImage}
            />
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.username}>@{user.username}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
          <View style={styles.followContainer}>
            <View style={styles.followCount}>
              <Text style={styles.count}>{user.followers.length}</Text>
              <Text style={styles.label}>Followers</Text>
            </View>
            <View style={styles.followCount}>
              <Text style={styles.count}>{user.following.length}</Text>
              <Text style={styles.label}>Following</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  loader: {
    marginTop: 20,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    width: '100%',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  name: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  username: {
    fontSize: 20,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  email: {
    fontSize: 16,
    color: '#777',
    marginTop: 5,
  },
  followContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
  },
  followCount: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '40%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  count: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E90FF',
  },
  label: {
    fontSize: 14,
    color: '#555',
  },
});
