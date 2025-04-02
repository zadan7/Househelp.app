import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Cmenu = () => {
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
      {/* Floating Button to Open Menu */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Ionicons name="menu" size={40} color="white" />
        <Text style={{ color: "white" }}>MENU</Text>
      </TouchableOpacity>

      {/* Side Menu */}
      <Animated.View style={[styles.menu, { left: menuAnimation }]}>
        <TouchableOpacity onPress={toggleMenu}>
          <Text style={styles.closeMenu}>×</Text>
        </TouchableOpacity>
        <TouchableOpacity><Text style={styles.menuItem}>Dashboard</Text></TouchableOpacity>
        <TouchableOpacity><Text style={styles.menuItem}>Profile</Text></TouchableOpacity>
        <TouchableOpacity><Text style={styles.menuItem}>Settings</Text></TouchableOpacity>
        <TouchableOpacity><Text style={styles.menuItem}>Logout</Text></TouchableOpacity>
      </Animated.View>
    </>
  );
};

const Hmenu = () => {
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
      {/* Floating Button to Open Menu */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Ionicons name="menu" size={40} color="white" />
        <Text style={{ color: "white" }}>MENU</Text>
      </TouchableOpacity>

      {/* Side Menu */}
      <Animated.View style={[styles.menu, { left: menuAnimation }]}>
        <TouchableOpacity onPress={toggleMenu}>
          <Text style={styles.closeMenu}>×</Text>
        </TouchableOpacity>
        <TouchableOpacity><Text style={styles.menuItem}>Dashboard</Text></TouchableOpacity>
        <TouchableOpacity><Text style={styles.menuItem}>Profile</Text></TouchableOpacity>
        <TouchableOpacity><Text style={styles.menuItem}>Settings</Text></TouchableOpacity>
        <TouchableOpacity><Text style={styles.menuItem}>Logout</Text></TouchableOpacity>
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
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
});

export { Cmenu ,Hmenu};
