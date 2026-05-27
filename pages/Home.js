import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View,ScrollView } from 'react-native';
import { Header } from '../component/Header';
import { Footer } from '../component/Footer';
import { useState } from 'react';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginAsClient,loginAsHousehelp } from './Login';

function Home({ navigation }) {
useEffect(() => {
  const evaluateUserSession = async () => {
    try {
      // 1. Fetch all keys currently active in the app's storage
      const allKeys = await AsyncStorage.getAllKeys();
      
      const hasHousehelp = allKeys.includes("househelpdata");
      const hasClient = allKeys.includes("clientdata");

      // 2. CONFLICT CHECK: If both exist, flush everything and force login
      if (hasHousehelp && hasClient) {
        console.warn("Conflict detected: Both user profiles exist. Clearing storage...");
        
        await AsyncStorage.clear(); // Wipes out all keys completely
        
        // Reset the navigation stack so they can't swipe back into an unauthenticated state
        navigation.reset({
          index: 0,
          routes: [{ name: 'login' }], // Replace 'Login' with your exact login screen component name
        });
        return; 
      }

      // 3. SINGLE SESSION CHECKS: Handle isolated states
      if (hasHousehelp) {
        console.log("Only Househelp data exists.");
       navigation.reset({
          index: 0,
          routes: [{ name: 'hdashboard' }], // Replace 'Login' with your exact login screen component name
        }); // Call the househelp login flow to restore session
        // Write your specialized househelp routing logic here
      } 
      
      else if (hasClient) {
        console.log("Only Client data exists.");
        // Write your specialized client routing logic here
         navigation.reset({
          index: 0,
          routes: [{ name: 'cdashboard' }], // Replace 'Login' with your exact login screen component name
        }); 
      } 
      
      else {
        console.log("No active sessions found. Fresh device state.");
        // Optional: You can choose to navigate to a welcome screen or stay on the home screen with options to login or register
        
        // Optional: Send to welcome/login screen if nobody is logged in at all
      }

    } catch (error) {
      console.error("Session verification tracking failed:", error);
    }
  };

  evaluateUserSession();
}, [navigation]);
  return (
    <ScrollView >
        <View style={styles.container}>
      <Header navigation={navigation} />

      <Text style={styles.titleText}>Start Earning With us ($)</Text>

      <View style={styles.buttonContainer}>
      <Text style={{color:"green",fontSize:30,fontWeight:"bold"}}>Welcome!</Text>
        <Pressable style={styles.Pressable} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.buttonText}>Registration process</Text>
        </Pressable>
        <Text>or</Text>

        <Pressable style={styles.Pressable} onPress={() => navigation.navigate('login')}>
          <Text style={styles.buttonText2}>Login</Text>
        </Pressable>
        <Text>Click to order househelp</Text>
        <Pressable style={styles.Pressable} onPress={() => navigation.navigate('Request')}>
          <Text style={styles.buttonText}>Order Househelp Now</Text>
        </Pressable>
        
      </View>
     
        <Footer></Footer>
     
      </View>
      {/* <Footer></Footer> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    // paddingTop: 10, // Added padding for better layout on screens
    fontFamily:"Roboto"
  },
  titleText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginVertical: 5, // Added some margin around the title
  },
  buttonContainer: {
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,             // Border width for the container
    borderColor: 'green',       // Border color
    borderRadius: 10,           // Rounded corners for the container
    padding: 20,                // Padding inside the container
  },
  buttonText: {
    backgroundColor: 'green',
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 15,
    textAlign: 'center',
    borderRadius: 5, // Added border radius for better button appearance
  },
  buttonText2: {
    backgroundColor: 'white',
    color: 'green',
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 15,
    textAlign: 'center',
    borderRadius: 5, // Added border radius for better button appearance
    borderWidth: 1,             // Border width for the container
    borderColor: 'green',       // Border color
    borderRadius: 10,  
  },
  Pressable: {
    backgroundColor: 'green',
    color: 'white',
    // paddingVertical: 10,
    // paddingHorizontal: 20,
    marginBottom:20,
    marginTop:20,
    width:"100%",

    fontSize: 15,
    textAlign: 'center',
    borderRadius: 20, // Added border radius for better button appearance
  },
});

export { Home };
