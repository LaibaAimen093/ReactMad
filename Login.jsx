import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from 'react-native';
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function Login({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

    const handleLogin = async () => {
        console.log('Email:', email);   
        console.log('Password:', password);
        await signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("Succesfull", userCredential);
                navigation.navigate('Screen1');
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log('Error Code == ', errorCode)
                console.log('Error Message == ', errorMessage)
                // ..
            });
    }
    const handleSignUp = () => {
        navigation.navigate('SignUp', { data: "I am Coming from Login Screen" });
    }

    const handleForgotPassword = () => {
        navigation.navigate('ForgotPasswordScreen');
    }

    return (
        <View style={styles.container}>
            <View style={styles.logo}>
                <Image
                    style={styles.tinyLogo}
                    source={require('./assets/Library logo template design.jpg')}
                />
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
            </View>

            <TouchableOpacity style={styles.forgotPasswordButton} onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
                <Text style={styles.buttonText}>Sign Up</Text>
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
        marginBottom: 20,
        width: '80%',
    },
    inputtext: {
        backgroundColor: 'white',
        height: 40,
        marginVertical: 10,
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: 'lightgray',
        paddingBottom: 5,
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
        backgroundColor: 'blue',
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 30,
    },
    signUpButton: {
        backgroundColor: 'green',
        paddingVertical: 15,
        marginTop: 15,
        paddingHorizontal: 50,
        borderRadius: 30,
    },
    forgotPasswordButton: {
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: 'blue',
        fontSize: 16,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    tinyLogo: {
        borderRadius: 50,
        width: 100,
        height: 100,
    },
});
