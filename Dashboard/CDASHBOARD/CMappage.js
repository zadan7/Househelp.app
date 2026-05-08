import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { db } from '../../pages/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Header2 } from '../../component/Header';
import { Cmenu } from '../../component/Menu';
import { FontAwesome } from '@expo/vector-icons';

const CMappage = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [househelps, setHousehelps] = useState([]);
  const [requestData, setRequestData] = useState(null);
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobId, setJobId] = useState(null);
  const bounceValue = useRef(new Animated.Value(1)).current;

  // 1. Initial Data & Location Loading
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);

        const request = await AsyncStorage.getItem('requestdata');
        const storedJobId = await AsyncStorage.getItem('jobId');

        if (!request) {
          Alert.alert('Error', 'No request data found.');
          return;
        }

        const parsedRequest = JSON.parse(request);
        setRequestData(parsedRequest);
        setJobId(storedJobId || parsedRequest.id);

        // Get Current Location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Location access is required for the map.');
          return;
        }

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation(loc.coords);

        // Fetch Househelps
        const househelpSnapshot = await db.collection('househelps').get();
        const helps = househelpSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHousehelps(helps);

      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // 2. Real-time Job Listener
  useEffect(() => {
    if (!jobId) return;

    const unsubscribe = db
      .collection('partimeRequest')
      .doc(jobId)
      .onSnapshot((docSnap) => {
        if (docSnap.exists) {
          setRequestData({ id: docSnap.id, ...docSnap.data() });
        }
      }, (err) => console.error("Snapshot error:", err));

    return () => unsubscribe();
  }, [jobId]);

  // 3. Selection Animation
  useEffect(() => {
    if (selectedHelper) {
      Animated.sequence([
        Animated.timing(bounceValue, { toValue: 1.5, duration: 200, useNativeDriver: true }),
        Animated.spring(bounceValue, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();
    }
  }, [selectedHelper]);

  // 4. Notification Logic
  const handleSendPushNotification = async () => {
    if (!requestData?.clientData) return Alert.alert("Error", "Missing request details");

    try {
      for (let help of househelps) {
        // Only notify those in the same LGA with a token
        if (help.lga === requestData.clientData.lga && help.fcmtoken) {
          await fetch('https://househelp-app-h28t.vercel.app/sendNotificationToUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: help.fcmtoken,
              title: `New Job in ${requestData.clientData.lga}`,
              body: `Job: ${requestData.chores?.map(c => c.chore).join(', ')} \nPay: ₦${requestData.totalCost}
             \n Client: ${requestData.clientData.name} Apartment Size:${requestData.clientData.apartmentsize}`,
            }),
          });
        }
      }
      Alert.alert('Sent', 'Nearby househelps have been notified.');
    } catch (e) {
      console.error("Notification failed", e);
    }
  };

  const handleConfirm = async () => {
    if (!selectedHelper || !requestData) return;

    try {
      await db.collection('partimeRequest').doc(requestData.id).update({
        househelpName: selectedHelper.househelpName,
        househelpId: selectedHelper.househelpId,
        househelpdata: selectedHelper.househelpdata,
        status: 'confirmed',
      });

      await AsyncStorage.setItem('jobId', requestData.id);
      navigation.navigate('arriving', { clientId: requestData.clientId });
    } catch (error) {
      Alert.alert('Error', 'Failed to confirm selection.');
    }
  };

  // CRITICAL: Safety Check for Undefined Location
  if (loading || !location || !location.latitude) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text style={{ marginTop: 10 }}>Setting up the map...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Header2 />
      <Cmenu navigation={navigation} />

      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* User Marker */}
        <Marker
          coordinate={{ latitude: location.latitude, longitude: location.longitude }}
          title="My Location"
          pinColor="green"
        />

        {/* Househelp Markers */}
        {househelps.map((helper, index) => {
          let helperLoc;
          try {
            if (!helper.location) return null;
            helperLoc = typeof helper.location === 'string' ? JSON.parse(helper.location) : helper.location;
            
            // Check if coordinates exist within the helper object
            if (!helperLoc?.latitude || !helperLoc?.longitude) return null;

            const lat = parseFloat(helperLoc.latitude);
            const lng = parseFloat(helperLoc.longitude);
            const isSelected = selectedHelper?.househelpId === helper.id;

            return (
              <Marker
                key={helper.id || index}
                coordinate={{ latitude: lat, longitude: lng }}
                title={helper.name}
                onPress={() => setSelectedHelper({
                    househelpId: helper.id,
                    househelpName: helper.name,
                    househelpdata: helper
                })}
              >
                <Animated.View style={{
                  transform: [{ scale: isSelected ? bounceValue : 1 }],
                  alignItems: 'center'
                }}>
                  <View style={styles.markerContainer}>
                    <FontAwesome name="user-circle" size={30} color={isSelected ? "#007bff" : "#555"} />
                    <View style={{ flexDirection: 'row' }}>
                      {[...Array(5)].map((_, i) => (
                        <FontAwesome 
                          key={i} 
                          name={i < (helper.rating || 4) ? 'star' : 'star-o'} 
                          size={10} 
                          color="#f1c40f" 
                        />
                      ))}
                    </View>
                  </View>
                </Animated.View>
              </Marker>
            );
          } catch (e) { return null; }
        })}
      </MapView>

      <View style={styles.bottomSheet}>
        {requestData?.acceptedHelpers?.length > 0 && (
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.sectionHeader}>Helpers who accepted:</Text>
            {requestData.acceptedHelpers.map((helper, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedHelper(helper)}
                style={[
                  styles.helperButton,
                  selectedHelper?.househelpId === helper.househelpId && styles.selectedHelper
                ]}
              >
                <Text style={[
                  styles.helperText,
                  selectedHelper?.househelpId === helper.househelpId && styles.selectedHelperText
                ]}>{helper.househelpName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          onPress={handleConfirm}
          disabled={!selectedHelper}
          style={[styles.confirmButton, !selectedHelper && { backgroundColor: '#ccc' }]}
        >
          <Text style={styles.confirmButtonText}>Confirm Selected Househelp</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSendPushNotification} style={styles.alertButton}>
          <Text style={styles.alertButtonText}>Alert Nearby Househelps</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  markerContainer: { alignItems: 'center', backgroundColor: 'white', padding: 5, borderRadius: 10, elevation: 3 },
  bottomSheet: { padding: 15, backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  helperButton: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, marginVertical: 4 },
  selectedHelper: { backgroundColor: '#007bff' },
  helperText: { fontSize: 15, color: '#333' },
  selectedHelperText: { color: 'white', fontWeight: 'bold' },
  confirmButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center' },
  confirmButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  alertButton: { padding: 15, alignItems: 'center', marginTop: 5 },
  alertButtonText: { color: '#007bff', fontWeight: '600' },
});

export { CMappage };