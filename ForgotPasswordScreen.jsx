import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
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
            <Text style={styles.title}>Forgot Password</Text>
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
        backgroundColor: 'blue',
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 30,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ForgotPasswordScreen;
