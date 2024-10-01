import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useMutation, gql } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Snackbar } from 'react-native-paper';

const REGISTER_MUTATION = gql`
mutation Register($name: String!, $username: String!, $email: String!, $password: String!) {
    register(name: $name, username: $username, email: $email, password: $password) {
        _id
        email
        name
        username
    }
}`;

const backgroundImage = require('../assets/infoin.png');

export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [register] = useMutation(REGISTER_MUTATION);
    const [visible, setVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handleRegister = async () => {
        if (!name || !username || !email || !password) {
            setSnackbarMessage("Name, username, email, and password are required.");
            setVisible(true);
            return;
        }
        if (password.length < 5) {
            setSnackbarMessage("Password must be at least 5 characters long.");
            setVisible(true);
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setSnackbarMessage("Email format is invalid.");
            setVisible(true);
            return;
        }

        try {
            const { data } = await register({ variables: { name, username, email, password } });
            if (data.register) {
                await AsyncStorage.setItem('userData', JSON.stringify(data.register));
                navigation.navigate('Login');
            }
        } catch (error) {
            setSnackbarMessage("An error occurred while registering. Please try again.");
            setVisible(true);
        }
    };

    return (
        <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
            <View style={styles.container}>
                <TextInput
                    placeholder="Name"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    placeholderTextColor="#aaa"
                />
                <TextInput
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                    placeholderTextColor="#aaa"
                />
                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    placeholderTextColor="#aaa"
                />
                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                    placeholderTextColor="#aaa"
                />

                <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                    <Text style={styles.registerButtonText}>Sign Up</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginLink}>Already have an account? Login</Text>
                </TouchableOpacity>

                <Snackbar
                    visible={visible}
                    onDismiss={() => setVisible(false)}
                    duration={3000}
                >
                    {snackbarMessage}
                </Snackbar>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    input: {
        width: '100%',
        padding: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        color: '#333',
    },
    registerButton: {
        width: '100%',
        paddingVertical: 12,
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    registerButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loginLink: {
        color: '#fff',
        marginTop: 20,
        fontSize: 16,
    },
});
