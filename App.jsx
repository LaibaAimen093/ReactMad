import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { Ionicons  } from "react-native-vector-icons/Icon";
import {Image,StatusBar,View,StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// import SplashScreen from './SplashScreen';
import SplashScreen from "./SplashScreen ";
import SignUp from "./SignUp";
import Login from "./Login";
import Screen1 from "./Screen1";
import Player from "./Player";
import ForgotPasswordScreen from "./ForgotPasswordScreen";
import Home from "./Home";
import Books from "./Books";
import AudioBooks from "./AudioBooks";
import BookInfo from "./BookInfo";
import PlaylistScreen from "./PlaylistScreen";
import PlaylistDetailsScreen from "./PLaylistDetailsScreen";
import ProgressScreen from "./ProgressScreen";
import SearchScreen from "./SearchScreen";
import AuthorDetails from './AuthorDetails';
import { UserProvider } from './UserContext';

import homeIcon from './assets/Home.png';
import booksIcon from './assets/books.png';
import audiobooksIcon from './assets/audiobooks.png';
import playlistIcon from './assets/playlist.png';
import progressIcon from './assets/progress.png';
import searchIcon from './assets/search.png';

// Define your tab navigator component
function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          let icon;

          if (route.name === 'Home') {
            icon = homeIcon;
          } else if (route.name === 'Books') {
            icon = booksIcon;
          } else if (route.name === 'AudioBooks') {
            icon = audiobooksIcon;
          } else if (route.name === 'PlaylistScreen') {
            icon = playlistIcon;
          } else if (route.name === 'ProgressScreen') {
            icon = progressIcon;
          } else if (route.name === 'SearchScreen') {
            icon = searchIcon;
          }

          // Return the Image component with the icon
          return <Image source={icon} style={{ width: 25, height: 25, tintColor: focused ? '#673987' : 'gray' }} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: '#673987',
        inactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen name="Home" component={Home} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Books" component={Books} options={{ tabBarLabel: 'Books' }} />
      <Tab.Screen name="AudioBooks" component={AudioBooks} options={{ tabBarLabel: 'AudioBooks' }} />
      <Tab.Screen name="PlaylistScreen" component={PlaylistScreen} options={{ tabBarLabel: 'Playlist' }} />
      <Tab.Screen name="ProgressScreen" component={ProgressScreen} options={{ tabBarLabel: 'Progress' }} />
      <Tab.Screen name="SearchScreen" component={SearchScreen} options={{ tabBarLabel: 'Search' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return ( 
    <View style={styles.container}>
      <StatusBar backgroundColor="#673987" barStyle="light-content" />
      <UserProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SplashScreen" component={SplashScreen} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
            <Stack.Screen name="HomeTabs" component={HomeTabs} />
            <Stack.Screen name="Screen1" component={Screen1} />
            <Stack.Screen name="Player" component={Player} />
            <Stack.Screen name="BookInfo" component={BookInfo} />
            <Stack.Screen name="AuthorDetails" component={AuthorDetails} />
            <Stack.Screen name="PlaylistDetailsScreen" component={PlaylistDetailsScreen} />
            {/* <Stack.Screen name="Books" component={Books} />
            <Stack.Screen name="AudioBooks" component={AudioBooks} /> */}
          </Stack.Navigator>
        </NavigationContainer>
        <Toast ref={(ref) => Toast.setRef(ref)} />
      </UserProvider>
    </View> 
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginTop:0,
    // paddingTop:0,
    backgroundColor: '#fff',
  },
});
