import * as React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, TextInput, Alert } from 'react-native';
import { Header } from '../component/Header';
import { Footer } from '../component/Footer';
import { db } from "./firebase";
import { collection, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Login({ navigation }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [househelpsList, setHousehelps] = useState([]);
  const [clientsList, setClient] = useState([]);

useEffect(() => {}, []); // ✅ Run once when component mounts
  useEffect(() => {
    AsyncStorage.clear(); // Clear all stored data
    const fetchHousehelps = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'househelps'));
        const househelps = querySnapshot.docs.map(doc => {
          const data = doc.data();
          data.id = doc.id; // Add the document ID to the data object
          return data;
        });
        setHousehelps(househelps);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    
     const fetchClients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'clients'));
        var clients = querySnapshot.docs.map(doc => {
          const data = doc.data();
          data.id = doc.id; // Add the document ID to the data object
          return data;
        });
        setClient(clients);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    

    fetchHousehelps();
    fetchClients();
  }, []); // ✅ Run once when component mounts

  const handleLogin = async () => {
    console.log('Email:', email);
    console.log('Password:', password);
  
    const foundUser = househelpsList.find(item => item.email === email && item.password === password);
    const foundClient = clientsList.find(item => item.email === email && item.password === password);
  
    if (foundUser && foundClient) {
      console.log("User has both househelp and client accounts.");
      Alert.alert(
        "Multiple Accounts Found",
        "Do you want to log in as a Househelp or Client?",
        [
          {
            text: "Househelp",
            onPress: async () => {
              console.log("✅ Logged in as Househelp!");
              await AsyncStorage.setItem("User", JSON.stringify(foundUser));
              await AsyncStorage.setItem("UserID", foundUser.id);
              await AsyncStorage.setItem("userEmail", email);
              navigation.navigate("hdashboard");
            },
          },
          {
            text: "Client",
            onPress: async () => {
              console.log("✅ Logged in as Client!");
              await AsyncStorage.setItem("Client", JSON.stringify(foundClient));
              await AsyncStorage.setItem("ClientID", foundClient.id);
              await AsyncStorage.setItem("userEmail", email);
              navigation.navigate("cdashboard");
            },
          },
          // { text: "Cancel", style: "cancel" },
        ]
      );
  
      // Store both roles temporarily
      await AsyncStorage.setItem("User", JSON.stringify(foundUser));
      await AsyncStorage.setItem("Client", JSON.stringify(foundClient));
  
      navigation.navigate("choose"); // Navigate to role selection screen
      return;
    }
  
    if (foundUser) {
      console.log("✅ Logged in as Househelp!", foundUser);
      await AsyncStorage.setItem("User", JSON.stringify(foundUser));
      await AsyncStorage.setItem("UserID", foundUser.id);
      await AsyncStorage.setItem("userEmail", email);
  
      navigation.navigate("hdashboard");
      return;
    }
  
    if (foundClient) {
      console.log("✅ Logged in as Client!", foundClient);
      await AsyncStorage.setItem("Client", JSON.stringify(foundClient));
      await AsyncStorage.setItem("ClientID", foundClient.id);
      await AsyncStorage.setItem("userEmail", email);
  
      navigation.navigate("cdashboard");
      return;
    }
  
    // If no matching user found, show one error message
    console.log("❌ Wrong email or password.");
    Alert.alert("Login Failed", "Invalid email or password. Please try again.");
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
    fontFamily: "serif"
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    padding: 10,
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
