import * as React from 'react';
import { View, Image, StyleSheet,Pressable } from 'react-native';
import logo from "../assets/Househelp.png";
import logo2 from "../assets/House.png";
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';

const Header = ({navigation}) => {
  return (
    <View style={styles.container}>
      {/* Header Logo */}
      <View  style={styles.logoContainer}>
          <Pressable onPress={()=>{
             navigation.navigate('Home')
          }}>
        <Image source={logo2} style={styles.headerImage} />
        </Pressable>
      </View>

      {/* Main Logo */}
      <View style={styles.mainLogoContainer}>
      <Pressable onPress={()=>{
             navigation.navigate('Home')
          }}>
        <Image source={logo} style={styles.mainLogo} />
        </Pressable>
      </View>
    </View>
  );
};
const Header2 = ({navigation}) => {
  return (
    <View style={styles.container}>
      {/* Header Logo */}
      <View  style={styles.logoContainer}>
          <Pressable onPress={()=>{
             navigation.navigate('Home')
          }}>
        <Image source={logo2} style={styles.headerImage} />
        </Pressable>
      </View>

      {/* Main Logo */}
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    backgroundColor:"green"
    
  },
  logoContainer: {
    backgroundColor: "green",
    width: "100%",
    alignItems: "center",
  },
  headerImage: {
    width: 375,
    height: 100,
    paddingTop:50,
    marginTop:30

  },
  mainLogoContainer: {
    width: "100%",
    backgroundColor: "white",
    alignItems: "center",
    
  },
  mainLogo: {
    width: 100,
    height: 100,
  },
});

export { Header,Header2 }
