import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header2 } from '../component/Header';
import { Cmenu } from '../component/Menu';
import AsyncStorage from '@react-native-async-storage/async-storage';

const menuItems = [
  { title: 'Profile', icon: 'person-circle-outline', screen: 'cprofile' },
  { title: 'Make Request', icon: 'create-outline', screen: 'cmakerequest' },
  { title: 'Request fulltime live-in ', icon: 'create-outline', screen: 'cfulltime' },

  // { title: 'Househelp List', icon: 'people-outline', screen: 'cHousehelplist' },
  { title: 'Pending Jobs', icon: 'hourglass-outline', screen: 'requestconfirmation' },
  { title: 'Job History', icon: 'document-text-outline', screen: 'ccompletedjobs' },
  { title: 'Favorites', icon: 'heart-outline', screen: 'FavoriteHelpers' },
  { title: 'Refer & Earn', icon: 'gift-outline', screen: 'referandearn' },
  { title: 'Settings', icon: 'settings-outline', screen: 'csettings' },
  { title: 'Balances', icon: 'wallet-outline', screen: 'ClientBalances' },
  { title: 'Arriving', icon: 'car-outline', screen: 'arriving' },
  { title: 'Help Center', icon: 'help-circle-outline', screen: 'ClientSupport' },
];

const ClientDashboard = ({ navigation, route }) => {
  // const { user } = route.params;
  const [userData, setUserData] = React.useState();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('clientdata');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log('User Data:', parsedUser);
          setUserData(parsedUser);
        } else {
          console.log('No user data found');
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

  return (
    <View style={styles.container}>
      <Header2 />
      <Cmenu navigation={navigation} />
      <Text style={styles.title}>
        Welcome, {userData?.firstname ? userData.firstname : 'Client'} 👋
      </Text>

      <FlatList
        data={menuItems}
        numColumns={2}
        columnWrapperStyle={styles.row}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.gridItem}
            activeOpacity={0.85}
            onPress={() => handlePress(item.screen)}
          >
            <Ionicons name={item.icon} size={38} color="#28a745" />
            <Text style={styles.gridText}>{item.title}</Text>
          </TouchableOpacity>
        )}
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 25,
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
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    padding: 18,
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
