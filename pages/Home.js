import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View,ScrollView } from 'react-native';
import { Header } from '../component/Header';
import { Footer } from '../component/Footer';
import { useState } from 'react';
import { useEffect } from 'react';

function Home({ navigation }) {
  useEffect(()=>{
    // navigation.navigate("happliedjobs")
    
  },[])
  return (
    <ScrollView >
        <View style={styles.container}>
      <Header navigation={navigation} />

      <Text style={styles.titleText}>Start Earning With us good ($)</Text>

      <View style={styles.buttonContainer}>
      <Text style={{color:"green",fontSize:30,fontWeight:"bold"}}>Welcome!</Text>
        <Pressable style={styles.Pressable} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.buttonText}>Registration process </Text>
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
