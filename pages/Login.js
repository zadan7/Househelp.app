import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View, ScrollView, TextInput, Alert } from 'react-native';
import { Header } from '../component/Header';
import { Footer } from '../component/Footer';
import {db} from "./firebase";
import { Firestore } from 'firebase/firestore';
import { useState,useEffect } from 'react';
import { collection } from 'firebase/firestore';
import { getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Login({ navigation }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [househelps, setHousehelps] = React.useState([]);
  const [clients, setClients] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    const fetchHousehelps = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "househelps"));
        const househelpsArray = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(househelpsArray);
        setHousehelps(househelpsArray);
      } catch (error) {
        console.error("Error fetching househelps:", error);
      }
    };
  
    fetchHousehelps();
  }, []);
  
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "clients"));
        const clientsArray = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(clientsArray);
        setClients(clientsArray);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
  
    fetchClients();
  }, []);
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
  
    if (loading) return; // Prevent multiple logins
    setLoading(true);
  
    try {
      // Query Firestore for matching user
      const househelpSnapshot = await getDocs(collection(db, "househelps"));
      const clientSnapshot = await getDocs(collection(db, "clients"));
  
      const househelp = househelpSnapshot.docs.find(doc => doc.data().email === email && doc.data().password === password);
      const client = clientSnapshot.docs.find(doc => doc.data().email === email && doc.data().password === password);
  
      if (househelp && client) {
        Alert.alert(
          "Multiple Accounts Found",
          "You are registered as both a client and a househelp. Choose how you want to log in:",
          [
            {
              text: "Login as Client",
              onPress: () => {
                if (client.data().password === password) {
                  Alert.alert("Success", "Logged in as Client.");
                  var clientId = client.id;
                  var clientdata = client.data();
                  clientdata.id = clientId;
                  // AsyncStorage.setItem("clientId", clientId);
                  AsyncStorage.setItem("clientdata", JSON.stringify(clientdata));
                  navigation.navigate("cdashboard", { clientdata });  
                } else {
                  Alert.alert("Error", "Invalid password for Client account.");
                }
              },
            },
            {
              text: "Login as Househelp",
              onPress: () => {
                if (househelp.data().password === password) {
                  Alert.alert("Success", "Logged in as Househelp.");
                  var househelpId = househelp.id;
                  var househelpdata = househelp.data();
                  househelpdata.id = househelpId;
                  AsyncStorage.setItem("househelpId", househelpId);
                  AsyncStorage.setItem("househelpdata", JSON.stringify(househelpdata));
                  navigation.navigate("hdashboard");
                } else {
                  Alert.alert("Error", "Invalid password for Househelp account.");
                }
              },
            },
            // { text: "Cancel", style: "cancel" },
          ]
        );
        setLoading(false);
        return;
      }
  
      if (client && client.data().password === password) {
        Alert.alert("Success", "Login successful! Welcome Client.");
        var clientId = client.id;
        var clientdata = client.data();
        clientdata.id = clientId;
        AsyncStorage.setItem("clientId", clientId);
        AsyncStorage.setItem("clientdata", JSON.stringify(clientdata));
        navigation.navigate("cdashboard");
      } else if (househelp && househelp.data().password === password) {
        Alert.alert("Success", "Login successful! Welcome Househelp.");
        var househelpId = househelp.id;
        var househelpdata = househelp.data();
        househelpdata.id = househelpId;
        AsyncStorage.setItem("househelpId", househelpId); 
        AsyncStorage.setItem("househelpdata", JSON.stringify(househelpdata));
        navigation.navigate("hdashboard");
      } else {
        Alert.alert("Error", "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header navigation={navigation} />
      <Text style={styles.title}>Login</Text>
      
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
      </View>
      
      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    color: 'green',
    fontSize: 39,
    fontWeight: 'bold',
    marginVertical: 10,
    fontFamily:"serif"
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    padding:10,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: 'green',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export { Login };