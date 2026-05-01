import * as React from 'react';
import { StyleSheet, Text, View, Dimensions, Alert, ActivityIndicator, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs } from 'firebase/firestore'; // ✅ Correct Firestore imports
import { db } from './../../firebase'; // ✅ Ensure the correct import path
import { addDoc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';

import * as Notifications from 'expo-notifications';
import { Footer } from '../../../component/Footer';
import { ScrollView } from 'react-native';

// Function to send push notifications to nearby househelps



function MapPage2({ navigation }) {

 
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('');
  const [LGA, setLga] = useState('');
  const [Chores, setchores] = useState('');
  const [Total, settotal] = useState('');


  const [apartmenttype, setselectedApartment] = useState('');

  const [listofhousehelps, setlistofhousehelps]= useState([])

  
  const [location, setLocation] = useState(null); // To store user's location
  const [errorMsg, setErrorMsg] = useState(null); // To store any error message
  const [loading, setLoading] = useState(true); // Loading state for location
  const uploadDataToFirestore = async (collectionName, data) => {
    try {
      await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
      });
      console.log("Data uploaded successfully!");
    } catch (error) {
      console.error("Error uploading data to Firestore:", error);
    }
  };
  
  const postData=()=>{
var data ={
  name:name,
  phone:phone,
  email:email,
  chores:Chores,
  state:state,
  LGA:LGA,
  amount :Total,
  address:address,
  apartmenttype:apartmenttype
}
// uploadDataToFirestore("partimeRequest",data)
// navigation.navigate("mappage")
// navigation.navigate("hdashboard")
sendPushNotification()

  }
  const sendPushNotification = async () => {
    try {
      // Fetch househelps from Firestore who match the user's LGA
      const querySnapshot = await getDocs(collection(db, 'househelps'));
      const nearbyHousehelps = querySnapshot.docs
        .map(doc => doc.data())
        .filter(househelp => househelp.lga === LGA && househelp.token); // ✅ Match LGA & check push token
  
      if (nearbyHousehelps.length === 0) {
        Alert.alert("No Nearby Househelps", "No househelps found in your LGA.");
        return;
      }
  
      // Send push notifications
     
  
      Alert.alert("Alert Sent", "Nearby househelps have been notified!");
  
    } catch (error) {
      console.error("Error sending notifications:", error);
      Alert.alert("Error", "Failed to send notifications.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [name, phone, address, email, state, LGA,Apartment,chores,total] = await Promise.all([
          AsyncStorage.getItem("name"),
          AsyncStorage.getItem("phone"),
          AsyncStorage.getItem("address"),
          AsyncStorage.getItem("email"),
          AsyncStorage.getItem("state"),
          AsyncStorage.getItem("lga"),
          AsyncStorage.getItem("apartmenttype"),
          AsyncStorage.getItem("chores"),

          AsyncStorage.getItem("total")


        ]);

        setName(name);
        setPhone(phone);
        setAddress(address);
        setEmail(email);
        setState(state);
        setLga(LGA);
        setselectedApartment(Apartment)
        setchores(chores)
        settotal(Number(total))
      } catch (error) {
        console.error("Error fetching data from SecureStore: ", error);
        Alert.alert('Error', 'Failed to fetch user details');
      }
    };

    const fetchHousehelps = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'househelps')); // Get all docs in 'househelps'
        const househelpsList = querySnapshot.docs.map(doc => doc.data()); // Extract data from documents
        setlistofhousehelps(househelpsList); 
        // Set the data into state
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchData();
    fetchHousehelps();
    
    // Get the user's current location
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      setLoading(false); // Stop loading once location is available
    })();
  }, []); // Only run once when the component mounts

  const { width, height } = Dimensions.get('window');

  if (errorMsg) {
    Alert.alert('Location Error', errorMsg);
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <Text>Unable to retrieve your location. Please try again later.</Text>
      </View>
    );
  }

  // Second marker's location (example: set to a fixed place)
  const secondMarker = {
    latitude: 37.7749, // Example: San Francisco latitude
    longitude: -122.4194, // Example: San Francisco longitude
  };

  const initialRegion = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <ScrollView>
    <View style={styles.container}>
      <MapView
        style={[styles.map, { width, height: height * 0.5 }]} // Set map height to 50% of screen
        initialRegion={initialRegion}
        region={initialRegion}
        showsUserLocation={true}  // Show the user's location as a blue dot
        followsUserLocation={true}  // Follow the user's location
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="Your Location"
          description="This is where you are"
        />
        <Marker
          coordinate={secondMarker}
          title="Second Marker"
          description="This is another marker"
        />

       
{listofhousehelps.map((element, index) => {
  let locationData;

  try {
    locationData = JSON.parse(element.location); // Convert string to object
  } catch (error) {
    console.error(`Error parsing location for index ${index}:`, error);
    return null; // Skip rendering if parsing fails
  }

  // Ensure locationData contains valid latitude & longitude
  if (
    locationData &&
    typeof locationData.latitude === "number" &&
    typeof locationData.longitude === "number"
  ) {
    return (
      <Marker
        key={index}
        coordinate={{
          latitude: locationData.latitude,
          longitude: locationData.longitude
        }}
        title={element.name || "Househelp"}
        description={element.phonenumber || "No contact provided"}
        pinColor='green'
      />
    );
  } else {
    console.warn(`Invalid location data at index ${index}:`, element);
    return null;
  }
})}



      
      </MapView>

      {/* You can add other content below the map */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Name: {name}</Text>
        <Text style={styles.infoText}>Phone: {phone}</Text>
        <Text style={styles.infoText}>Address: {address}</Text>
        <Text style={styles.infoText}>Email: {email}</Text>
        <Text style={styles.infoText}>State: {state}</Text>
        <Text style={styles.infoText}>LGA: {LGA}</Text>
        <Text style={styles.infoText}>Apartment: {apartmenttype}</Text>
        <Text style={styles.infoText}>
          Selected Chores: {JSON.parse(Chores)}
          Selected Chores: {JSON.parse(Chores).map(chore => chore.chore).join('')}
          </Text>
        <Text style={styles.infoText}>Transport: {1500}</Text>

        <Text style={styles.infoText}>Total Cost: {Total+1500}</Text>

        <Pressable style={styles.inactiveButtonStyle} onPress={postData}>
          <Text style={{color:"white"}}>Alert Nearby Househelps</Text>
        </Pressable>
        <View style={{paddingBottom:"100"}}>
              <Text> </Text>
        </View>

      </View>
      <Footer ></Footer>
    </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    height: "auto",
    fontFamily: 'Roboto',
    paddingBottom: 50,
  },

  map: {
    width: '100%',
    height: '50%', // Make the map take up 50% of the screen height
  },

  infoContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },

  buttonContainer: {
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: 'green',
    borderRadius: 10,
    padding: 20,
    marginBottom: 100,
  },
  Pressable: {
    marginBottom: 20,
    marginTop: 20,
    width: '100%',
    borderRadius: 20,
  },
  inactiveButtonStyle: {
    backgroundColor: 'green',
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 15,
    textAlign: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'green',
  },
});

export { MapPage2 };
 