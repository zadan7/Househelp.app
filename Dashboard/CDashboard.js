import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Animated, Easing 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header2 } from '../component/Header';
import { Cmenu } from '../component/Menu';
import AsyncStorage from '@react-native-async-storage/async-storage';

const menuItems = [
  { title: 'Profile', icon: 'person-circle-outline', screen: 'cprofile' },
  { title: 'Make Request', icon: 'create-outline', screen: 'cmakerequest' },
  { title: 'Request fulltime', icon: 'create-outline', screen: 'cfulltimeselection' },
  { title: 'Pending Jobs', icon: 'hourglass-outline', screen: 'requestconfirmation' },
  { title: 'Job History', icon: 'document-text-outline', screen: 'ccompletedjobs' },
  { title: 'Favorites', icon: 'heart-outline', screen: 'FavoriteHelpers' },
  { title: 'Refer & Earn', icon: 'gift-outline', screen: 'referandearn' },
  { title: 'Settings', icon: 'settings-outline', screen: 'csettings' },
  { title: 'Balances', icon: 'wallet-outline', screen: 'ClientBalances' },
  { title: 'Arriving', icon: 'car-outline', screen: 'arriving' },
  { title: 'Help Center', icon: 'help-circle-outline', screen: 'ClientSupport' },
];

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const ClientDashboard = ({ navigation }) => {
  const [userData, setUserData] = useState();
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('clientdata');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUserData(parsedUser);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handlePress = (screen) => {
    navigation.navigate(screen);
  };

  const animatePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  };

  const animatePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPressIn={animatePressIn}
      onPressOut={animatePressOut}
      activeOpacity={0.9}
      onPress={() => handlePress(item.screen)}
      style={styles.gridItem}
    >
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Ionicons name={item.icon} size={36} color="#28a745" />
      </Animated.View>
      <Text style={styles.gridText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header2 />
      <Cmenu navigation={navigation} />

      <View style={styles.welcomeCard}>
      <Image
  source={{ uri: userData?.facepicture }}
  style={styles.profileImage}
/>
        <View style={styles.textWrapper}>
          <Text style={styles.greeting}>{getTimeGreeting()},</Text>
          <Text style={styles.nameText}>{userData?.firstname || 'Client'} 👋</Text>
        </View>
      </View>

      <FlatList
        data={menuItems}
        numColumns={2}
        columnWrapperStyle={styles.row}
        keyExtractor={(item) => item.title}
        renderItem={renderItem}
        contentContainerStyle={styles.gridContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f3f6',
  },
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  textWrapper: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 20,
    textAlign: 'center',
    color: '#222',
  },
  gridContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    textAlign: 'center',
  },
});

export { ClientDashboard };
