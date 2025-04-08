import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { collection, getDocs, doc, updateDoc, onSnapshot      } from 'firebase/firestore';
import { db } from '../../pages/firebase';

import { Header2 } from '../../component/Header';
import { Cmenu } from '../../component/Menu';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RequestConfirmation = ({ navigation, route }) => {

  const [clientId,setClientId]   =  useState(route.params);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [selectedHelpers, setSelectedHelpers] = useState({});  
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchClientId = async () => {
      const user = await AsyncStorage.getItem('clientdata');
      const parsedUser = JSON.parse(user);
      setClientId(parsedUser.id); // Ensure clientId is set before fetching data
    };
  
    // First, fetch the clientId, then start the snapshot listener
    fetchClientId();
  }, []); // Runs only once when the component mounts
  
  useEffect(() => {
    if (!clientId) return; // Don't start the listener until clientId is set
  
    const unsubscribe = onSnapshot(collection(db, 'partimeRequest'), snapshot => {
      const jobs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(job => job.clientId === clientId );
  
      setPendingJobs(jobs);
      setLoading(false);
    });
  
    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, [clientId]); // Re-run this effect whenever clientId changes
  
  const handleConfirm = async (jobId) => {
    const selectedHelper = selectedHelpers[jobId];
    if (!selectedHelper) {
      Alert.alert("Please select a househelp before confirming.");
      return;
    }

    try {
      const jobRef = doc(db, 'partimeRequest', jobId);
      await updateDoc(jobRef, {
        househelpName: selectedHelper,
        status: 'confirmed',
      });

      Alert.alert("Job Confirmed", `You selected ${selectedHelper}.`);
      navigation.navigate('arriving', { clientId });
    } catch (error) {
      console.error("Error confirming job:", error);
      Alert.alert("Error", "Failed to confirm job.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header2 />
      <Cmenu navigation={navigation} />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.header}>Confirm Your Job Requests</Text>

        {pendingJobs.length === 0 ? (
          <Text style={styles.noJobText}>No pending jobs found.</Text>
        ) : (
          pendingJobs.map((job) => (
            <View key={job.id} style={styles.jobCard}>
              <Text style={styles.jobTitle}>{job.clientName}'s Job Request</Text>
              <Text style={styles.jobInfo}>Location: {job.address}</Text>
              <Text style={styles.jobInfo}>Apartment Type: {job.apartmentType}</Text>
              <Text style={styles.jobInfo}>Price: ₦{job.totalCost}</Text>
              <Text style={styles.jobInfo}>Requested On: {new Date(job.createdAt?.seconds * 1000).toLocaleString()}</Text>

              <Text style={styles.subHeader}>Chores:</Text>
              {job.chores.map((chore, index) => (
                <Text key={index} style={styles.choreItem}>- {chore.chore} (₦{chore.price})</Text>
              ))}

              <Text style={styles.subHeader}>Available Househelps:</Text>
              {job.acceptedBy ? (
                <TouchableOpacity
                  style={[
                    styles.helperButton,
                    selectedHelpers[job.id] === job.acceptedBy && styles.selectedHelper,
                  ]}
                  onPress={() => setSelectedHelpers((prev) => ({ ...prev, [job.id]: job.acceptedBy }))}
                >
                  <Text
                    style={[
                      styles.helperText,
                      selectedHelpers[job.id] === job.acceptedBy && styles.selectedHelperText,
                    ]}
                  >
                    {job.acceptedBy}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.waitingText}>Waiting for househelps to accept...</Text>
              )}

              <TouchableOpacity
                onPress={() => handleConfirm(job.id)}
                style={[
                  styles.confirmButton,
                  !selectedHelpers[job.id] && { backgroundColor: '#ccc' },
                ]}
                disabled={!selectedHelpers[job.id]}
              >
                <Text style={styles.confirmButtonText}>Confirm & Continue</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollView: { paddingBottom: 30 },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#343a40',
  },
  noJobText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#777',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  jobCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 10,
  },
  jobInfo: {
    fontSize: 16,
    color: '#444',
    marginBottom: 5,
  },
  subHeader: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  choreItem: {
    fontSize: 15,
    marginLeft: 10,
    color: '#555',
  },
  helperButton: {
    backgroundColor: '#e9ecef',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  selectedHelper: {
    backgroundColor: '#007bff',
  },
  helperText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedHelperText: {
    color: '#fff',
  },
  waitingText: {
    marginTop: 10,
    color: '#888',
    fontStyle: 'italic',
  },
  confirmButton: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export { RequestConfirmation };
