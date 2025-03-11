import * as React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { Header2, Header } from '../../component/Header';
import { Footer } from '../../component/Footer';
import { db } from '../../pages/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
 
function Arrived({ navigation }) {
  const [househelpsList, setHousehelps] = useState([]);
  const [jobdata, setjobdata] = useState([]);

  async function getdata()  {
    currentdata= await AsyncStorage.getItem("AcceptedJob")
    setjobdata(currentdata)
  }

  const fetchJobRequests = async () => {
    try {
      const phonenumber = await AsyncStorage.getItem("phone");
      const querySnapshot = await getDocs(collection(db, 'partimeRequest'));
      const jobs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const PersonalJobs = jobs.filter(jobdata => jobdata.phone === phonenumber);
      
      PersonalJobs.sort((a, b) => new Date(b.timestamp?.toMillis()) - new Date(a.timestamp?.toMillis()));
      
      setHousehelps(PersonalJobs);
    } catch (error) {
      console.error('Error fetching job requests: ', error);
    }
  };

  useEffect(() => {
    fetchJobRequests();
    getdata()
  }, []);

  const handleStart = () => {
    // Alert.alert("You have not arrived at the location yet");
    console.log(jobdata)
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header navigation={navigation} />
      
      <View style={styles.content}>
        <Text style={styles.title}>Confirm Your Arrival</Text>
        <Text style={styles.subtitle}>Once you have arrived at the client's destination, click the button below to start the job.</Text>
        
        <Pressable style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Start Job</Text>
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
    paddingVertical: 20,
  },
  content: {
    width: '90%',
    maxWidth: 500,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginVertical: 20,
  },
  title: {
    color: '#28a745',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#555',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export { Arrived };
