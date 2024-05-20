import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from 'react-native';
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from '@react-navigation/native'; 
import UserContext from './UserContext';

export default function Login() {
    const { setUserId } = useContext(UserContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const navigation = useNavigation();

    const handleLogin = async () => {
        console.log('Email:', email);   
        console.log('Password:', password);
        await signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const userId = userCredential.user.uid;
                setUserId(userId);
                console.log("Succesfull", userCredential);
                navigation.navigate('HomeTabs', { screen: 'Home' }); 
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
                    source={require('./assets/newLogo2.png')}
                />
            </View>

            <View>
                <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#673987', }}>
                    Login
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
            </View>

            <TouchableOpacity style={styles.forgotPasswordButton} onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
                <Text style={{color: '#673987',
                    fontSize: 18,
                    fontWeight: 'bold',
                }}>Sign Up</Text>
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
        marginTop:40,
        marginBottom: 30,
        width: '80%',
    },
    inputtext: {
        // backgroundColor: 'white',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: 'lightgray',
        height: 50,
        marginVertical: 10,
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: 'lightgray',
        paddingBottom: 5,
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
        backgroundColor: '#673987',
        paddingVertical: 10,
        paddingHorizontal: 120,
        borderRadius: 20,
    },
    signUpButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#673987',
        // borderBlockColor: '#673987',
        paddingVertical: 10,
        marginTop: 15,
        paddingHorizontal: 110,
        borderRadius: 20,
    },
    forgotPasswordButton: {
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: 'gray',
        fontSize: 16,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    tinyLogo: {
        // borderRadius: 50,
        width: 100,
        height: 100,
        tintColor: '#673987',
    },
});
