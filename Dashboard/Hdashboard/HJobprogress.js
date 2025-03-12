import * as React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { Header } from '../../component/Header';
import { Footer } from '../../component/Footer';
import { db } from '../../pages/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

function HJobProgress({ navigation }) {
  const [jobdata, setJobData] = useState(null);
  const [chores, setChores] = useState([]);
  const [completedChores, setCompletedChores] = useState({});

  async function getData() {
    try {
      const currentData = await AsyncStorage.getItem("AcceptedJob");

      if (!currentData) {
        console.error("Error: No job ID found in AsyncStorage");
        return;
      }

      const jobId = currentData.startsWith('"') ? JSON.parse(currentData) : currentData;
      const jobRef = doc(db, 'partimeRequest', jobId);
      const jobSnap = await getDoc(jobRef);

      if (!jobSnap.exists()) {
        console.error("No job found in Firestore for ID:", jobId);
        return;
      }

      const data = jobSnap.data();
      setJobData(data);

      if (data.chores) {
        try {
          const parsedChores = JSON.parse(data.chores.replace(/'/g, '"')).map((chore) => {
            const parts = chore.split(':');
            return { task: parts[0].trim(), price: parts[1].split(',')[0].trim() };
          });
          setChores(parsedChores);

          // Load existing completion status if available in Firestore
          const initialCompletedState = data.completedChores || {};
          setCompletedChores(initialCompletedState);
        } catch (error) {
          console.error("Error parsing chores:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching job data:", error);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  const handleChorePress = async (task) => {
    Alert.alert(
      "Confirm Completion",
      `Has the client confirmed that "${task}" is completed?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes, Confirm",
          onPress: async () => {
            const updatedChores = { ...completedChores, [task]: true };
            setCompletedChores(updatedChores);

            // Update Firestore to reflect chore completion
            if (jobdata) {
              try {
                const jobRef = doc(db, 'partimeRequest', jobdata.id);
                await updateDoc(jobRef, { completedChores: updatedChores });
              } catch (error) {
                console.error("Error updating Firestore:", error);
              }
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header navigation={navigation} />

      <View style={styles.content}>
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
                <Pressable 
                  key={index} 
                  style={[
                    styles.choreButton, 
                    completedChores[chore.task] ? styles.choreCompleted : styles.chorePending
                  ]}
                  onPress={() => handleChorePress(chore.task)}
                >
                  <Text style={styles.choreText}>
                    {chore.task} - ₦{chore.price}
                  </Text>
                </Pressable>
              ))
            ) : (
              <Text style={styles.noChores}>No chores available</Text>
            )}
          </View>
        )}
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
  choreButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
    width: '100%',
  },
  choreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  choreCompleted: {
    backgroundColor: '#28a745',
  },
  chorePending: {
    backgroundColor: '#f8d210',
  },
  noChores: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
});

export { HJobProgress };
