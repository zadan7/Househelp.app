import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await AsyncStorage.getItem('clientdata');
        if (data) {
          setUser(JSON.parse(data)); // Parse the stored data to an object
        }
      } catch (error) {
        console.error('Error fetching client data: ', error);
      }
    };
    fetchData();
  }, []);

  if (!user) {
    return (
      <View style={styles.container}>
        <Header2 />
        <Cmenu navigation={navigation} />
        <Text style={styles.header}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header2 />
      {/* Floating Menu */}
      <Cmenu navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <Text style={styles.header}>Profile</Text>

        <View style={styles.profileContainer}>
          <View style={styles.profileHeader}>
            <Image source={{ uri: user.facepicture }} style={styles.profilePic} />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.email}>{user.email}</Text>
              <Text style={styles.phone}>{user.phone}</Text>
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.sectionHeader}>Personal Details</Text>

            <View style={styles.detailsRow}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.detail}>{user.address}</Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.label}>Apartment Type:</Text>
              <Text style={styles.detail}>{user.apartmentType}</Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.label}>LGA:</Text>
              <Text style={styles.detail}>{user.lga}</Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.label}>State:</Text>
              <Text style={styles.detail}>{user.state}</Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.label}>Location:</Text>
              {/* <Text style={styles.detail}>
                Lat: {user.location.latitude}, Lon: {user.location.longitude}
              </Text> */}
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.label}>Account Created:</Text>
              <Text style={styles.detail}>{new Date(user.createdAt).toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.imageSection}>
            <Text style={styles.sectionHeader}>Images</Text>

            <View style={styles.imageRow}>
              <Text style={styles.imageLabel}>Apartment Inside:</Text>
              <Image source={{ uri: user.insideview }} style={styles.image} />
            </View>

            <View style={styles.imageRow}>
              <Text style={styles.imageLabel}>House Front:</Text>
              <Image source={{ uri: user.frontview }} style={styles.image} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f3f5',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#495057',
  },
  scrollViewContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  profileContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
    borderWidth: 3,
    borderColor: '#007bff',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 5,
  },
  phone: {
    fontSize: 16,
    color: '#6c757d',
  },
  detailsContainer: {
    marginTop: 20,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 15,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
    width: 120,
  },
  detail: {
    fontSize: 16,
    color: '#495057',
    flex: 1,
  },
  imageSection: {
    marginTop: 30,
  },
  imageRow: {
    marginBottom: 20,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#dcdfe1',
  },
});

export { Profile };
