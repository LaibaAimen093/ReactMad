import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously, onAuthStateChanged } from "firebase/auth";

export default function SignUp({ navigation }) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const onPressRegister = async () => {
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        console.log('Email:', email);
        console.log('Password:', password);
        await createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("Successful", userCredential);
                navigation.navigate('Login');
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                Alert.alert("Error", errorMessage);
                console.log('Error Code == ', errorCode)
                console.log('Error Message == ', errorMessage)
            });
    }

    const handleLogin = () => {
        navigation.navigate('Login', { data: "I am Coming from Login Screen" });
    }

    return (
        <View style={styles.container}>
            <View style={styles.logo}>
                <Image
                    style={styles.tinyLogo}
                    source={require('./assets/newIcon.png')}
                />
            </View>

            <View>
                <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#673987', }}>
                    Sign Up
                </Text>
            </View>

            <View style={styles.input}>
                <TextInput
                    style={styles.inputtext}
                    placeholder="Email"
                    onChangeText={setEmail}
                    value={email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Password"
                        onChangeText={setPassword}
                        value={password}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                        style={styles.togglePasswordIcon}
                        onPress={() => setShowPassword(!showPassword)}>
                        <Image
                            style={styles.eyeIcon}
                            source={showPassword ? require('./assets/eye.png') : require('./assets/eye-close.png')}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Confirm Password"
                        onChangeText={setConfirmPassword}
                        value={confirmPassword}
                        secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                        style={styles.togglePasswordIcon}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Image
                            style={styles.eyeIcon}
                            source={showConfirmPassword ? require('./assets/eye.png') : require('./assets/eye-close.png')}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={styles.signUpButton} onPress={onPressRegister}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={{
                    color: '#673987',
                    fontSize: 18,
                    fontWeight: 'bold',
                }}>Login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        marginBottom: 50,
    },
    input: {
        marginTop: 40,
        marginBottom: 30,
        width: '80%',
    },
    inputtext: {
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: 'lightgray',
        height: 50,
        marginVertical: 10,
        padding: 10,
        borderRadius: 5,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: 'lightgray',
        marginVertical: 10,
        borderRadius: 5,
    },
    passwordInput: {
        flex: 1,
        height: 40,
        padding: 10,
        borderRadius: 5,
    },
    togglePasswordIcon: {
        padding: 10,
    },
    eyeIcon: {
        width: 24,
        height: 24,
    },
    loginButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#673987',
        paddingVertical: 10,
        marginTop: 15,
        paddingHorizontal: 118,
        borderRadius: 20,
    },
    signUpButton: {
        backgroundColor: '#673987',
        paddingVertical: 10,
        paddingHorizontal: 110,
        borderRadius: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    tinyLogo: {
        width: 100,
        height: 100,
        tintColor: '#673987',
    },
});
