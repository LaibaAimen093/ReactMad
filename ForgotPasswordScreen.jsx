import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { auth } from './firebase'; // Import the Firebase authentication instance
import {sendPasswordResetEmail} from 'firebase/auth';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');

    const handleResetPassword = async ()=>{
        if (!email) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }

        await sendPasswordResetEmail(auth,email)
            .then(() => {
                Alert.alert('Success', 'Password reset email sent. Check your inbox.');
                // Navigate the user back to the login screen or any other screen
                navigation.navigate('Login');
            })
            .catch((error) => {
                Alert.alert('Error', 'Failed to send password reset email. Please try again later.');
                console.error('Error sending password reset email:', error);
            });
    };

    return (
        <View style={styles.container}>

            <View style={styles.logo}>
                <Image
                    style={styles.tinyLogo}
                    source={require('./assets/forgetPasswordImg.png')}
                />
            </View>

            <Text style={{ fontSize: 25, fontWeight: 'bold', color: '#673987', marginBottom: 50,}}>
                    Forgot Password
                </Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                onChangeText={setEmail}
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword}>
                <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 40,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    resetButton: {
        backgroundColor: '#673987',
        paddingVertical: 10,
        paddingHorizontal: 100,
        borderRadius: 20,
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    tinyLogo: {
        // borderRadius: 50,
        width: 300,
        height: 300,
        // tintColor: '#673987',
    },
    logo: {
        marginBottom: 50,
    }
});

export default ForgotPasswordScreen;
