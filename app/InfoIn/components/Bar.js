import React, { useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Modal, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const icons = {
  home: require('../assets/homepage.png'),
  createPost: require('../assets/addpost.png'),
  search: require('../assets/search.png'),
  profile: require('../assets/profile.png'),
};

export default function Navbar({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleProfilePress = () => {
    setModalVisible(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userData');
    
    navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
    });
    
    setModalVisible(false);
};


  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Image source={icons.home} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('CreatePost')}>
        <Image source={icons.createPost} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Search')}>
        <Image source={icons.search} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleProfilePress}>
        <Image source={icons.profile} style={styles.icon} />
      </TouchableOpacity>

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Profile Options</Text>
            <TouchableOpacity
              style={[styles.button, styles.viewProfileButton]}
              onPress={async () => {
                try {
                  const userData = await AsyncStorage.getItem('userData');
                  if (userData) {
                    const { userId } = JSON.parse(userData);
                    
                    if (userId) {
                      navigation.navigate('Profile', { getUserId: userId });
                    } else {
                      console.error('Error: userId is not available');
                    }
                  } else {
                    console.error('Error: userData is not available');
                  }
                } catch (error) {
                  console.error('Error fetching userData from AsyncStorage:', error);
                }

                setModalVisible(false);
              }}
            >
              <Text style={styles.buttonText}>View Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={handleLogout}
            >
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    elevation: 5,
  },
  icon: {
    width: 24,
    height: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: 'center',
  },
  viewProfileButton: {
    backgroundColor: 'blue',
  },
  logoutButton: {
    backgroundColor: 'red',
  },
  cancelButton: {
    backgroundColor: 'lightgray',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: 'black',
  },
});
