import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('SignUp'); // Replace 'SignUp' with the name of your initial screen
    }, 2000); // Adjust the duration (in milliseconds) as needed
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('./assets/splashNew.png')} style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Adjust background color as needed
  },
  image: {
    width: 750, // Adjust width and height as needed
    height: 750,
    resizeMode: 'contain', // Adjust resizeMode as needed
  },
});

export default SplashScreen;
