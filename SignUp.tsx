import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import { auth } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

type SignUpProps = {
    navigation: any;
};

type SignUpState = {
    email: string;
    password: string;
    confirmPassword: string;
    showPassword: boolean;
    showConfirmPassword: boolean;
};

class SignUp extends Component<SignUpProps, SignUpState> {
    constructor(props: SignUpProps) {
        super(props);
        this.state = {
            email: '',
            password: '',
            confirmPassword: '',
            showPassword: false,
            showConfirmPassword: false,
        };
    }

    // Regex patterns for validation 
    emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    onPressRegister = async () => {
        const { email, password, confirmPassword } = this.state;
        const { navigation } = this.props;

        if (!this.emailPattern.test(email)) { 
            Alert.alert("Error", "Invalid email address."); 
            return; 
        }

        // Validate password 
        if (!this.passwordPattern.test(password)) { 
            Alert.alert("Error", "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."); 
            return; 
        }

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
                console.log('Error Code == ', errorCode);
                console.log('Error Message == ', errorMessage);
            });
    };

    handleLogin = () => {
        const { navigation } = this.props;
        navigation.navigate('Login', { data: "I am Coming from Login Screen" });
    };

    render() {
        const { email, password, confirmPassword, showPassword, showConfirmPassword } = this.state;

        return (
            <View style={styles.container}>
                <View style={styles.logo}>
                    <Image
                        style={styles.tinyLogo}
                        source={require('./assets/newIcon.png')}
                    />
                </View>

                <View>
                    <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#673987' }}>
                        Sign Up
                    </Text>
                </View>

                <View style={styles.input}>
                    <TextInput
                        style={styles.inputtext}
                        placeholder="Email"
                        onChangeText={(text) => this.setState({ email: text })}
                        value={email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Password"
                            onChangeText={(text) => this.setState({ password: text })}
                            value={password}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            style={styles.togglePasswordIcon}
                            onPress={() => this.setState({ showPassword: !showPassword })}>
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
                            onChangeText={(text) => this.setState({ confirmPassword: text })}
                            value={confirmPassword}
                            secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity
                            style={styles.togglePasswordIcon}
                            onPress={() => this.setState({ showConfirmPassword: !showConfirmPassword })}>
                            <Image
                                style={styles.eyeIcon}
                                source={showConfirmPassword ? require('./assets/eye.png') : require('./assets/eye-close.png')}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.signUpButton} onPress={this.onPressRegister}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.loginButton} onPress={this.handleLogin}>
                    <Text style={{
                        color: '#673987',
                        fontSize: 18,
                        fontWeight: 'bold',
                    }}>Login</Text>
                </TouchableOpacity>
            </View>
        );
    }
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

export default SignUp;