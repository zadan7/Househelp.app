import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { db } from '../../pages/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Header2 } from '../../component/Header';
import { Cmenu } from '../../component/Menu';
import { FontAwesome } from '@expo/vector-icons';

const CMappage = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [househelps, setHousehelps] = useState([]);
  const [requestData, setRequestData] = useState(null);
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHousehelps = async () => {
    if (!requestData?.clientData.lga) return;

    const q = query(collection(db, 'househelps'), where('lga', '==', requestData.clientData.lga));
    const querySnapshot = await getDocs(q);
    const helps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setHousehelps(helps);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const request = await AsyncStorage.getItem('requestdata');
      if (request) {
        setRequestData(JSON.parse(request));
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (requestData?.clientData?.lga) {
      fetchHousehelps();
    }
  }, [requestData]);

  const handleSendPushNotification = async () => {
    for (let help of househelps) {
      if (help.token) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'New Job Alert!',
            body: `A client in ${requestData.location.lga} needs help.`,
            data: { requestId: requestData.id },
          },
          trigger: null,
        });
      }
    }
    Alert.alert('Notified', 'Nearby househelps have been alerted.');
  };

  const handleConfirm = async () => {
    if (!selectedHelper || !requestData) return;

    try {
      const jobRef = doc(db, 'partimeRequest', requestData.id);
      await updateDoc(jobRef, {
        househelpName: selectedHelper.househelpName,
        househelpId: selectedHelper.househelpId,
        househelpdata: selectedHelper.househelpdata,
        status: 'confirmed',
      });

      Alert.alert('Success', `You confirmed ${selectedHelper.househelpName}`);
      await AsyncStorage.setItem('jobId', requestData.id);
      navigation.navigate('arriving', { clientId: requestData.clientId });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to confirm househelp.');
    }
  };

  if (loading || !location || !requestData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Header2 />
      <Cmenu navigation={navigation} />

      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Client Marker */}
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="You"
          description="Client Location"
          pinColor="green"
        />

        {/* Househelp Markers with Image and Star Rating */}
        {househelps.map((helper, index) => {
          let loc;
          try {
            loc = typeof helper.location === 'string' ? JSON.parse(helper.location) : helper.location;
          } catch {
            return null;
          }

          const latitude = parseFloat(loc.latitude);
          const longitude = parseFloat(loc.longitude);
          const rating = Math.round(helper.rating || 4); // default to 4 stars

          if (isNaN(latitude) || isNaN(longitude)) return null;

          return (
            <Marker
              key={index}
              coordinate={{ latitude, longitude }}
              title={helper.name || 'Househelp'}
              description={`Experience: ${helper.experience || 'N/A'} yrs`}
            >
              <View style={{ alignItems: 'center' }}>
                <Image
                  source={{ uri: helper.url }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    borderWidth: 2,
                    borderColor: '#fff',
                  }}
                />
                <View style={{ flexDirection: 'row', marginTop: 2 }}>
                  {[...Array(5)].map((_, i) => (
                    <FontAwesome
                      key={i}
                      name={i < rating ? 'star' : 'star-o'}
                      size={12}
                      color="#f1c40f"
                    />
                  ))}
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>

      <View style={{ padding: 15 }}>
        {/* Accepted Helpers */}
        {requestData.acceptedHelpers?.length > 0 && (
          <View style={{ marginBottom: 15 }}>
            <Text style={styles.sectionHeader}>Accepted Househelps</Text>
            {requestData.acceptedHelpers.map((helper, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.helperButton,
                  selectedHelper?.househelpId === helper.househelpId && styles.selectedHelper,
                ]}
                onPress={() => setSelectedHelper(helper)}
              >
                <Text
                  style={[
                    styles.helperText,
                    selectedHelper?.househelpId === helper.househelpId && styles.selectedHelperText,
                  ]}
                >
                  {helper.househelpName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Buttons */}
        <TouchableOpacity onPress={handleSendPushNotification} style={styles.alertButton}>
          <Text style={styles.alertButtonText}>Alert Nearby Househelps</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={fetchHousehelps} style={styles.alertButton}>
          <Text style={styles.alertButtonText}>Fetch Nearby Househelps</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleConfirm}
          style={[styles.confirmButton, !selectedHelper && { backgroundColor: '#ccc' }]}
          disabled={!selectedHelper}
        >
          <Text style={styles.confirmButtonText}>Confirm Selected Househelp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  helperButton: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  selectedHelper: {
    backgroundColor: '#007bff',
  },
  helperText: {
    fontSize: 16,
    color: '#000',
  },
  selectedHelperText: {
    color: '#fff',
  },
  alertButton: {
    backgroundColor: '#ffc107',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  alertButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export { CMappage };
