import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Animated,
  Platform,
} from 'react-native';
import MapView ,{PROVIDER_GOOGLE} from 'react-native-maps';
import { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { db } from '../../pages/firebase';
// import { collection, getDocs, updateDoc, doc ,onSnapshot} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Header2 } from '../../component/Header';
import { Cmenu } from '../../component/Menu';
import { FontAwesome } from '@expo/vector-icons';
import messaging from '@react-native-firebase/messaging';
import { where } from '@react-native-firebase/firestore';
// import sendTestNotification from '../../pages/server';


const CMappage = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [househelps, setHousehelps] = useState([]);
  const [requestData, setRequestData] = useState(null);
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobId, setJobId] = useState(null);
  const [currentJob, setCurrentJob] = useState(null);
  const bounceValue = useRef(new Animated.Value(1)).current;

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
        setJobId(storedJobId);

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission to access location was denied');
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);

        const househelpSnapshot = await db.collection('househelps').get();
        const helps = househelpSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('Househelps:', helps.length);
        setHousehelps(helps);

        const requestSnapshot = await db.collection('partimeRequest').get();
        requestSnapshot.forEach((doc) => {
          const data = { id: doc.id, ...doc.data() };
          if (data.jobid === parsedRequest.jobid || storedJobId === data.id) {
            setCurrentJob(data);
            setRequestData(data);
            // console.log('Current Job:', data);
          }
        });
      } catch (error) {
        console.error('Initialization error:', error);
        Alert.alert('Error', 'Something went wrong while initializing.');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (selectedHelper) {
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: 1.5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(bounceValue, {
          toValue: 1,
          friction: 2,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedHelper]);

  useEffect(() => {
    if (!jobId) return;
  
   const unsubscribe = db
  .collection('partimeRequest')
  .doc(jobId)
  .onSnapshot((documentSnapshot) => {
    if (documentSnapshot.exists) {
      const data = {
        id: documentSnapshot.id,
        ...documentSnapshot.data(),
      };

      setRequestData(data);
      setCurrentJob(data);
      // console.log('🔄 Live update:', data);
    }
  });
  
    return () => unsubscribe(); // clean up listener on unmount
  }, [jobId]);
  

  const handleSendPushNotification = async () => {

  

    for (let help of househelps) {
      if (help.pushToken) {
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: help.pushToken,
            sound: 'default',
            title: 'New Job Alert!',
            body: `A client in ${requestData.location.lga} needs help.`,
            data: { requestId: requestData.totalCost, jobId: requestData.jobid },
          }),
        });

      console.log('Househelp notified:', help.pushToken);
      }
    }

    // code to send notification to the selected client

    const notifyClient = async () => {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: requestData.clientData.pushToken,
        sound: 'default',
        title: 'New Job Alert!',
        body: `A client in ${requestData.location.lga} needs help.`,
        data: { requestId: requestData.totalCost, jobId: requestData.jobid },
      }),
    });
    console.log('Client notified:', requestData.clientData.pushToken);
  };

  notifyClient();
  handlefcmPushNotification();

   {
  
    Alert.alert('Notified', 'Nearby househelps have been alerted.');
    // Alert.alert('Waiting', 'Waiting for nearby househelps to accept the job offer.');
  };
  };

 
  const handlefcmPushNotification = async () => {
    console.log('Attempting to send FCM notification to nearby househelps...');
    console.log('Househelps available for notification:', househelps.length);
    console.log('Request Location:', requestData.clientData.lga);

    for (let help of househelps) {
      if (help.lga === requestData.clientData.lga && help.fcmtoken) {
        console.log(`Sending FCM notification to ${help.name} with token: ${help.fcmtoken}`);
        try {
          const response = await fetch('http://192.168.39.76:3000/sendFCMNotification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fcmToken: help.fcmtoken,
              title: 'New Job Alert!',
              body: `A client in ${requestData.location.lga} needs help.`,
            }),
          });
        } catch (error) {
          console.error('FCM Notification Error:', error);
        }
      }
    }
  };


 const handleConfirm = async () => {
  if (!selectedHelper || !requestData) return;

  try {
    await db
      .collection('partimeRequest')
      .doc(requestData.id)
      .update({
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

  if (loading || !location) {
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
      provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="You"
          description="Client Location"
          pinColor="green"
        />

        {househelps.map((helper, index) => {
          let loc;
          try {
            loc = typeof helper.location === 'string' ? JSON.parse(helper.location) : helper.location;
          } catch {
            console.error('Error parsing location:', helper);
            return null;
          }

          const latitude = parseFloat(loc.latitude);
          const longitude = parseFloat(loc.longitude);
          const rating = Math.round(helper.rating || 4);

          if (isNaN(latitude) || isNaN(longitude)) return null;

          const isSelected = selectedHelper?.househelpId === helper.id;

          return (
            <Marker
              key={index}
              coordinate={{ latitude, longitude }}

              title={helper.name || 'Househelp'}
              // calloutAnchor={{ x: 0.5, y: 0.5 }}
              //code for more info about the helper


              description={`Experience: ${helper.experience || 'N/A'} yrs  \n LGA: ${helper.lga || 'N/A'}  \n State: ${helper.state || 'N/A'} \n Employment Type: ${helper.employmentType || 'N/A'}`}

              
            >
              <Animated.View
                style={{
                  alignItems: 'center',
                  transform: [{ scale: isSelected ? bounceValue : 1 }],
                }}
              >
                {/* <Image
                  source={{ uri: helper.url }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    borderWidth: 3,
                    borderColor: isSelected ? '#007bff' : '#fff',
                  }}
                /> */}
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
              </Animated.View>
            </Marker>
          );
        })}
      </MapView>

      <View style={{ padding: 15 }}>
        {requestData.acceptedHelpers?.length > 0 && (
          <View style={{ marginBottom: 15 }}>
            <Text style={styles.sectionHeader}>List of Househelps that Accepted this Request</Text>
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

        <TouchableOpacity
          onPress={handleConfirm}
          style={[
            styles.confirmButton,
            !selectedHelper && { backgroundColor: '#ccc' },
          ]}
          disabled={!selectedHelper}
        >
          <Text style={styles.confirmButtonText}>Confirm Selected Househelp</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={ async ()=>{var notification = await handleSendPushNotification()
          console.log(notification.json())
        }} style={styles.alertButton}>
          <Text style={styles.alertButtonText}>Alert Nearby Househelps</Text>
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
