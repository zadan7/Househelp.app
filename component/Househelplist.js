import * as React from 'react';
// import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View, ScrollView, TextInput,Image,Linking } from 'react-native';
import { Header } from '../component/Header';
import { Footer } from '../component/Footer';
import { db } from '../pages/firebase'; // Ensure you've initialized Firebase properly
import { collection, getDocs } from 'firebase/firestore'; // Correct Firestore methods
import { useState, useEffect } from 'react';
 
function HousehelpList({ navigation,LGA }) {
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


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* <Header navigation={navigation} /> */}
      {/* <Text style={styles.title}>Househelp List</Text> */}
   
      
      <View style={styles.househelpContainer}>
        <Text style={styles.subtitle}>Househelps Data:</Text>
        {househelps.length > 0 ? (
          househelps.map((househelp, index) => (
            <View>
            <View key={index} style={styles.househelpItem}>
             
                {/* <HousehelpCard househelp={househelp}></HousehelpCard> */}
            </View>
            <View style={styles2.card}>
            <Image source={{ uri: househelp.url }} style={styles.imagePreview}></Image>

        <Image source={{ uri: househelp.url }} style={styles.image} />
        <View style={styles2.details}>
        <Image source={{ uri: househelp.url }} style={styles.image} />

          <Text style={styles2.name}>{househelp.name}</Text>
          <Text style={styles2.info}>📧 {househelp.email}</Text>
          <Pressable onPress={()=>{Linking.openURL(`tel:${househelp.phonenumber}`)}}>
          <Text style={styles2.info} >📞 {househelp.phonenumber}</Text>


          </Pressable>
          <Text style={styles2.info}>📍 {househelp.address}, {househelp.state}</Text>
          <Text style={styles2.info}>🛠️ {JSON.parse(househelp.selectedJobs)}</Text>
        </View>
      </View>
            
            </View>
          ))
        ) : (
          <Text>No data available</Text>
        )}
      </View>

      {/* <Footer /> */}
    </ScrollView>
  );
}

const HousehelpCard = ({ househelp }) => {
    return (
      <View style={styles.card}>
        <Image source={{ uri: househelp.url }} style={styles.image} />
        <View style={styles.details}>
          <Text style={styles.name}>{househelp.name}</Text>
          <Text style={styles.info}>📧 {househelp.email}</Text>
          <Text style={styles.info}>📞 {househelp.phonenumber}</Text>
          <Text style={styles.info}>📍 {househelp.address}, {househelp.state}</Text>
          <Text style={styles.info}>🛠️ {househelp.selectedJobs.replace(/\[|\]|"/g, "")}</Text>
        </View>
      </View>
    );
  };
  
  const styles2 = StyleSheet.create({
    card: {
      // flexDirection: "row",
      backgroundColor: "#fff",
      borderRadius: 10,
      padding: 10,
      marginVertical: 10,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      width:"80%",
      textAlign:"center"
    },
    image: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    details: {
      marginLeft: 10,
      flex: 1,
    },
    name: {
      fontSize: 18,
      fontWeight: "bold",
    },
    info: {
      fontSize: 14,
      color: "#555",
      paddingBottom:10,
    },
  });
  

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    height:"auto"
  },
  imagePreview: {
    width: "auto",
    height: 300,
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

export { HousehelpList };
