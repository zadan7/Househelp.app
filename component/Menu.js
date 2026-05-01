import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Cmenu = ({navigation}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnimation = useState(new Animated.Value(-250))[0];

  const toggleMenu = () => {
    Animated.timing(menuAnimation, {
      toValue: menuVisible ? -250 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setMenuVisible(!menuVisible);
  };

  return (
    <>
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Ionicons name="menu" size={40} color="white" />
        <Text style={{ color: "white" }}>MENU</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.menu, { left: menuAnimation }]}>
        <TouchableOpacity onPress={toggleMenu}>
          <Text style={styles.closeMenu}>×</Text>
        </TouchableOpacity>


        <TouchableOpacity onPress={() => { navigation.navigate("cdashboard") }} style={styles.menuItem}>
  <Ionicons name="home-outline" size={20} color="#fff" />
  <Text style={styles.menuText}>Dashboard</Text>
</TouchableOpacity>

        <TouchableOpacity onPress={()=>{navigation.navigate("cprofile")}} style={styles.menuItem}>
          <Ionicons name="person-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>{navigation.navigate("cmakerequest")}} style={styles.menuItem}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Make Request</Text>
        </TouchableOpacity>
{/* 
        <TouchableOpacity onPress={()=>{navigation.navigate("cHousehelplist")}} style={styles.menuItem}>
          <Ionicons name="people-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Househelp List</Text>
        </TouchableOpacity> */}

        <TouchableOpacity onPress={()=>{navigation.navigate("requestconfirmation")}} style={styles.menuItem}>
          <Ionicons name="clipboard-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Pending Jobs</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>{navigation.navigate("ccompletedjobs")}} style={styles.menuItem}>
          <Ionicons name="done-all" size={20} color="#fff" />
          <Text style={styles.menuText}>Completed Jobs</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>{navigation.navigate("profile")}} style={styles.menuItem}>
          <Ionicons name="wallet-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Balances</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>{navigation.navigate("csettings")}} style={styles.menuItem}>
          <Ionicons name="settings-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("referandearn")} style={styles.menuItem}>
  <Ionicons name="gift-outline" size={20} color="#fff" />
  <Text style={styles.menuText}>Refer & Earn</Text>
</TouchableOpacity>
<TouchableOpacity onPress={() => navigation.navigate("cmappage")} style={styles.menuItem}>
  <Ionicons name="map" size={20} color="#fff" />
  <Text style={styles.menuText}>Map</Text>
</TouchableOpacity>

        <TouchableOpacity onPress={()=>{
          AsyncStorage.clear().then(()=>{
            Alert.alert("Logged Out", "See you soon");
            setTimeout(()=>{navigation.navigate("login")},1000);
          });
        }} style={styles.menuItem}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

const Hmenu = ({navigation}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnimation = useState(new Animated.Value(-250))[0];

  const toggleMenu = () => {
    Animated.timing(menuAnimation, {
      toValue: menuVisible ? -250 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setMenuVisible(!menuVisible);
  };

  return (
    <>
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Ionicons name="menu" size={40} color="white" />
        <Text style={{ color: "white" }}>MENU</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.menu, { left: menuAnimation }]}>
        <TouchableOpacity onPress={toggleMenu}>
          <Text style={styles.closeMenu}>×</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>{navigation.navigate("hdashboard")}} style={styles.menuItem}>
          <Ionicons name="home-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>{navigation.navigate("hfulltime")}} style={styles.menuItem}>
          <Ionicons name="briefcase-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Fulltime Request</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>{navigation.navigate("hpartime")}} style={styles.menuItem}>
          <Ionicons name="time-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Partime Request</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>{navigation.navigate("happliedjobs")}} style={styles.menuItem}>
          <Ionicons name="calendar-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Applied Jobs</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>{navigation.navigate("hprofile")}} style={styles.menuItem}>
          <Ionicons name="person-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>{navigation.navigate("hsettings")}} style={styles.menuItem}>
          <Ionicons name="settings-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>{
          AsyncStorage.clear().then(()=>{
            Alert.alert("Logged Out", "See you soon");
            setTimeout(()=>{navigation.navigate("Home")},1000);
          });
        }} style={styles.menuItem}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    position: 'absolute',
    bottom: "10%",
    right: "10%",
    padding: 10,
    backgroundColor: '#28a745',
    borderRadius: 50,
    zIndex: 1000,
    elevation: 5,
  },
  menu: {
    position: 'absolute',
    top: 0,
    left: -250,
    width: 250,
    height: '100%',
    backgroundColor: '#343a40',
    padding: 20,
    zIndex: 2000,
    elevation: 5,
  },
  closeMenu: {
    color: '#fff',
    fontSize: 24,
    textAlign: 'right',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
  },
});

export { Cmenu , Hmenu };
