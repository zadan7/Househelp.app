import * as React from 'react';
// import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View, ScrollView, TextInput,Image } from 'react-native';
import { Header } from '../component/Header';
import { Footer } from '../component/Footer';
import { db } from './firebase'; // Ensure you've initialized Firebase properly
import { collection, getDocs } from 'firebase/firestore'; // Correct Firestore methods
import { useState, useEffect } from 'react';
import { HousehelpList } from '../Dashboard/CDASHBOARD/Househelplist';
 
function Login2({ navigation }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [househelps, setHousehelps] = React.useState([]);

  // Fetch househelps data from Firestore
  useEffect(() => {
    const fetchHousehelps = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'househelps')); // Get all docs in 'househelps'
        const househelpsList = querySnapshot.docs.map(doc => doc.data()); // Extract data from documents
        setHousehelps(househelpsList); // Set the data into state
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    fetchHousehelps(); // Call the fetch function
  }, []);

  // Handle login logic
  const handleLogin = () => {
    console.log('Email:', email);
    console.log('Password:', password);
    househelps.forEach(item=>{
      if(item.password === password && item.email==email){
        console.log("logged in")
      }else{
        console.log("wrong email or password detected",item.password+"  "+item.email)
      }
    })
    // Add authentication logic here
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
      <View>
        <HousehelpList></HousehelpList>
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
  imagePreview: {
    width: 150,
    height: 150,
    marginTop: 10,
    borderRadius: 10,
  },
  title: {
    color: 'green',
    fontSize: 39,
    fontWeight: 'bold',
    marginVertical: 10,
    fontFamily: 'serif',
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
  househelpContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    width: '100%',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'green',
  },
  househelpItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export { Login2 };
