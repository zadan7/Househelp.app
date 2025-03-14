import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';


const { width } = Dimensions.get('window');

const CMenu = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnimation = useState(new Animated.Value(-width))[0];

  const toggleMenu = () => {
    Animated.timing(menuAnimation, {
      toValue: menuVisible ? -width : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setMenuVisible(!menuVisible);
  };

  return (
    <>
      {/* Overlay to close menu when clicked outside */}
      {menuVisible && (
        <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />
      )}

      {/* Floating Menu Button */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Ionicons name="menu" size={32} color="white" />
      </TouchableOpacity>

      {/* Sliding Menu */}
      <Animated.View style={[styles.menu, { left: menuAnimation }]}> 
        <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>

        <Text style={styles.menuHeader}>Menu</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('cmappage')}>
          <Ionicons name="home" size={20} color="white" style={styles.icon} />
          <Text style={styles.menuText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person" size={20} color="white" style={styles.icon} />
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Crequest')}>
          <Ionicons name="archive" size={20} color="white" style={styles.icon} />
          <Text style={styles.menuText}>Make Request</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings" size={20} color="white" style={styles.icon} />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Balances')}>
          <Ionicons name="wallet" size={20} color="white" style={styles.icon} />
          <Text style={styles.menuText}>Balances</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logout]} onPress={() => navigation.navigate('Login')}>
          <Ionicons name="log-out" size={20} color="white" style={styles.icon} />
          <Text style={styles.menuText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    position: 'absolute',
    top: "70%",
    right: 30,
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 50,
    // elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex:5
  },
  menu: {
    position: 'absolute',
    top: 0,
    left: -width,
    width: 250,
    height: '100%',
    backgroundColor: '#343a40',
    padding: 20,
    zIndex: 10,
    elevation: 5,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop:"15%"
    
  },
  menuHeader: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
  },
  icon: {
    width: 25,
  },
  logout: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 15,
  },
});

export { CMenu };