import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Alert, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import * as Notifications from 'expo-notifications';
import { Footer } from '../../component/Footer';

function CMapPage({ navigation }) {
  const [client, setClient] = useState(null);
  const [listOfHousehelps, setListOfHousehelps] = useState([]);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const value = await AsyncStorage.getItem('Client');
        if (value) {
          setClient(JSON.parse(value));
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
        Alert.alert('Error', 'Failed to fetch user details');
      }
    };

    const fetchHousehelps = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'househelps'));
        const househelpsList = querySnapshot.docs.map(doc => doc.data());
        setListOfHousehelps(househelpsList);
      } catch (error) {
        console.error('Error fetching househelps:', error);
      }
    };

    const getLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } catch (error) {
        console.error('Error fetching location:', error);
        setErrorMsg('Failed to fetch location');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchHousehelps();
    getLocation();
  }, []);

  const uploadDataToFirestore = async (collectionName, data) => {
    try {
      await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
      });
      console.log('Data uploaded successfully!');
    } catch (error) {
      console.error('Error uploading data to Firestore:', error);
    }
  };

  const postData = () => {
    if (!location) {
      Alert.alert('Location Error', 'Location data is missing.');
      return;
    }

    const data = {
      name: client?.name,
      phone: client?.phone,
      email: client?.email,
      chores: client?.chores,
      state: client?.state,
      LGA: client?.LGA,
      amount: client?.total,
      address: client?.address,
      apartmentType: client?.apartmentType,
      status: 'Pending',
      location,
    };

    uploadDataToFirestore('partimeRequest', data);
    navigation.navigate('cdashboard');
    sendPushNotification();
  };

  const sendPushNotification = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'househelps'));
      const nearbyHousehelps = querySnapshot.docs
        .map(doc => doc.data())
        .filter(househelp => househelp.LGA === client?.LGA && househelp.token);

      if (nearbyHousehelps.length === 0) {
        Alert.alert('No Nearby Househelps', 'No househelps found in your LGA.');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'New Househelp Request!',
          body: `A client in ${client?.LGA} needs a househelp. Check your app for details.`,
        },
        trigger: null,
      });

      Alert.alert('Alert Sent', 'Nearby househelps have been notified!');
    } catch (error) {
      console.error('Error sending notifications:', error);
      Alert.alert('Error', 'Failed to send notifications.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <MapView
          style={[styles.map, { width: Dimensions.get('window').width, height: Dimensions.get('window').height * 0.5 }]}
          region={region}
          showsUserLocation
          followsUserLocation
        >
          {location && (
            <Marker coordinate={location} title="Your Location" description="This is where you are" />
          )}

          {listOfHousehelps.map((element, index) => {
            let locationData;
            try {
              locationData = JSON.parse(element.location);
            } catch (error) {
              console.error(`Error parsing location for index ${index}:`, error);
              return null;
            }

            if (locationData?.latitude && locationData?.longitude) {
              return (
                <Marker
                  key={index}
                  coordinate={locationData}
                  title={element.name || 'Househelp'}
                  description={element.phoneNumber || 'No contact provided'}
                  pinColor="green"
                />
              );
            }
            return null;
          })}
        </MapView>

        <View style={styles.infoContainer}>
          {client && (
            <>
              <Text style={styles.infoText}>Name: {client.name}</Text>
              <Text style={styles.infoText}>Phone: {client.phone}</Text>
              <Text style={styles.infoText}>Address: {client.address}</Text>
              <Text style={styles.infoText}>Address: {client.address}</Text>
              <Text style={styles.infoText}>Apartment Type: {client.apartmentType}</Text>
              <Text style={styles.infoText}>Total Amount: ₦{client.total}</Text>  
              {/* <Text style={styles.infoText}>Chores: {client.chores.join(', ')}</Text> */}
              <Text style={styles.infoText}>State: {client.state}</Text>
              <Text style={styles.infoText}>LGA: {client.lga}</Text>
              <Text style={styles.infoText}>Location: {JSON.stringify(client.location)}</Text>

              <Pressable style={styles.button} onPress={postData}>
                <Text style={styles.buttonText}>Alert Nearby Househelps</Text>
              </Pressable>
            </>
          )}
        </View>

        <Footer />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center' },
  map: { width: '100%', height: '50%' },
  infoContainer: { padding: 20, alignItems: 'center' },
  infoText: { fontSize: 16, marginBottom: 10 },
  button: { backgroundColor: 'green', padding: 10, borderRadius: 5 },
  buttonText: { color: 'white', textAlign: 'center' },
});

export { CMapPage };
