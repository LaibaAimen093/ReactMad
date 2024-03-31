import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from 'react-native';
import {auth} from "./firebase";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously, onAuthStateChanged } from "firebase/auth";

export default function SignUp({ navigation }) {


    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

  const onPressRegister = async ()=>{
    console.log('Email:', email);
    console.log('Password:', password);
    await createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("Succesfull",userCredential);
      navigation.navigate('Login');
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log('Error Code == ',errorCode)
      console.log('Error Message == ',errorMessage)
      // ..
    });
  }

  const handleLogin = () => {
    // Here you can implement your login logic
    // For simplicity, let's just log the email and password for now
  //   console.log('Email:', email);
  //   console.log('Password:', password);

    // If login is successful, navigate to the dashboard screen
    navigation.navigate('Login', { data: "I am Coming from Login Screen" });
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

            <TouchableOpacity style={styles.signUpButton} onPress={onPressRegister}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
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
    signUpButton:{
        backgroundColor: 'green',
        paddingVertical: 15,
        marginBottom : 15,
        paddingHorizontal: 50,
        borderRadius: 30,
      },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    tinyLogo: {
        borderRadius:50,
        width: 100,
        height: 100,
    },
});
