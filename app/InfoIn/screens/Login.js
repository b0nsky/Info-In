import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useMutation, gql } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Snackbar } from 'react-native-paper';
import Toast from 'react-native-toast-message';

const LOGIN_MUTATION = gql`
    mutation Mutation($username: String!, $password: String!) {
    login(username: $username, password: $password) {
        userId
        token
    }
}
`;

const backgroundImage = require('../assets/infoin.png');

export default function LoginScreen({ navigation }) {
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [visible, setVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [login] = useMutation(LOGIN_MUTATION);

    const handleLogin = async () => {
        try {
            const { data } = await login({ variables: { username, password } });
            
            if (data.login) {
                console.log(data.login, " <<<<< ")
                await AsyncStorage.setItem('userData', JSON.stringify(data.login));

                Toast.show({
                    text1: 'Login Berhasil',
                    text2: `Selamat datang ${username}`,
                    type: 'success',
                    position: 'top',
                    duration: 3000
                });

                setTimeout(() => {
                    navigation.replace('Home');
                }, 3000);
            } else {
                setSnackbarMessage('Username / Password Salah');
                setVisible(true);
            }
        } catch (error) {
            setSnackbarMessage('Username / Password Salah');
            setVisible(true);
        }
    };


    return (
        <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
            <View style={styles.container}>
                <TextInput
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                    placeholderTextColor="#aaa"
                />
                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                    style={styles.input}
                    placeholderTextColor="#aaa"
                />

                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.registerLink}>Don't have an account? Register</Text>
                </TouchableOpacity>

                <Snackbar
                    visible={visible}
                    onDismiss={() => setVisible(false)}
                    duration={3000}
                >
                    {snackbarMessage}
                </Snackbar>

                <Toast />
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
    loginButton: {
        width: '100%',
        paddingVertical: 12,
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    loginButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    registerLink: {
        color: '#fff',
        marginTop: 20,
        fontSize: 16,
    },
});
