import * as React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { Header } from '../../../component/Header';
import { Footer } from '../../../component/Footer';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


function MapPage({ navigation }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('');
  const [LGA, setLga] = useState('');

  useEffect(() => {
    // Fetch all secure storage values at once
    const fetchData = async () => {
      try {
        const [name, phone, address, email, state, LGA] = await Promise.all([
          AsyncStorage.getItem("name"),
          AsyncStorage.getItem ("phone"),
          AsyncStorage.getItem("address"),
          AsyncStorage.getItem("email"),
          AsyncStorage.getItem("state"),
          AsyncStorage.getItem("lga")
        ]);

        setName(name);
        setPhone(phone);
        setAddress(address);
        setEmail(email);
        setState(state);
        setLga(LGA);

        // Optionally log the fetched values to verify
        console.log("Fetched data: ", { name, phone, address, email, state, LGA });
      } catch (error) {
        console.error("Error fetching data from SecureStore: ", error);
      }
    };

    fetchData();
  }, []);  // Empty dependency array ensures this runs only once after the initial render

  return (
    <ScrollView>
      <ScrollView>
        <View style={styles.container}>
          <Header navigation={navigation} />

          {/* Displaying the name */}
          <Text style={{ color: "green", fontWeight: "bold" }}>{name}</Text>

          <View style={styles.buttonContainer}>
            {/* You can use MapView here if needed */}
            <View>
              {/* <MapView style={styles.map} /> */}
            </View>
          </View>

          <Footer />
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    height: "auto",
    fontFamily: 'Roboto',
    marginBottom: 50,
    paddingBottom: 50,
  },

  map: {
    width: '100%',
    height: '100%',
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
    paddingBottom: "auto",
    // backgroundColor:"green"
  },
  Pressable: {
    marginBottom: 20,
    marginTop: 20,
    width: '100%',
    borderRadius: 20,
    backgroundColor: "green",
    color: "white",
    padding: "10",
  },
  btntext: {
    color: "white",
  }
});

export { MapPage };
