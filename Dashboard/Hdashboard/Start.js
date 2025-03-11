import * as React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { Header } from '../../component/Header';
import { Footer } from '../../component/Footer';
import { db } from '../../pages/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

function StartJob({ navigation }) {
  const [jobdata, setJobData] = useState(null);
  const [chores, setChores] = useState([]);

  async function getData() {
    try {
      const currentData = await AsyncStorage.getItem("AcceptedJob");
      if (currentData) {
        const parsedData = JSON.parse(currentData);
        setJobData(parsedData);

        // Extract and format chores
        if (parsedData.chores) {
          const parsedChores = JSON.parse(parsedData.chores.replace(/'/g, '"')).map((chore) => {
            const parts = chore.split(':');
            return { task: parts[0].trim(), price: parts[1].split(',')[0].trim() };
          });
          setChores(parsedChores);
        }
      }
    } catch (error) {
      console.error("Error fetching job data:", error);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  const handleStart = () => {
    console.log("Job Data:", jobdata);
    console.log("Chores:", chores);
    Alert.alert("Job started successfully!");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header navigation={navigation} />
      
      <View style={styles.content}>
        <Text style={styles.title}>Confirm Your Arrival</Text>
        <Text style={styles.subtitle}>Once you have arrived at the client's destination, click the button below to start the job.</Text>

        {jobdata && (
          <View style={styles.jobDetails}>
            <Text style={styles.jobHeader}>Job Details</Text>
            <Text style={styles.jobText}><Text style={styles.bold}>Client:</Text> {jobdata.name}</Text>
            <Text style={styles.jobText}><Text style={styles.bold}>Location:</Text> {jobdata.address}, {jobdata.LGA}, {jobdata.state}</Text>
            <Text style={styles.jobText}><Text style={styles.bold}>Apartment Type:</Text> {jobdata.apartmenttype}</Text>
            <Text style={styles.jobText}><Text style={styles.bold}>Total Amount:</Text> ₦{jobdata.amount}</Text>

            <Text style={styles.jobHeader}>Chores</Text>
            {chores.length > 0 ? (
              chores.map((chore, index) => (
                <Text key={index} style={styles.choreItem}>
                  • {chore.task} - <Text style={styles.price}>₦{chore.price}</Text>
                </Text>
              ))
            ) : (
              <Text style={styles.noChores}>No chores available</Text>
            )}
          </View>
        )}

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
  jobDetails: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  jobHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 10,
  },
  jobText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
  choreItem: {
    fontSize: 16,
    color: '#333',
    marginVertical: 5,
  },
  noChores: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  price: {
    color: '#007bff',
    fontWeight: 'bold',
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
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export { StartJob };
