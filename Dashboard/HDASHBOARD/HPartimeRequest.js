import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Vibration, Pressable } from 'react-native';
import { collection, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Hmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import { arrayUnion } from 'firebase/firestore';

const HPartimeRequest = ({ navigation }) => {
  const [jobRequests, setJobRequests] = useState([]);
  const [househelpName, setHousehelpName] = useState('');
  const [househelpId, setHousehelpId] = useState('');
  const [househelpdata, setHousehelpdata] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHousehelpName = async () => {
      try {
        const user = await AsyncStorage.getItem('househelpdata');
        if (user) {
          const parsedUser = JSON.parse(user);
          setHousehelpId(parsedUser.id);
          setHousehelpdata(parsedUser);
          setHousehelpName(parsedUser.name);
        } else {
          Alert.alert('Error', 'Househelp data not found.');
        }
      } catch (error) {
        console.error("Error fetching househelp data:", error);
        Alert.alert('Error', 'Failed to fetch househelp data.');
      }
    };

    fetchHousehelpName();

    const unsubscribe = onSnapshot(collection(db, 'partimeRequest'), snapshot => {
      const jobs = snapshot.docs.map(doc => ({
        id2: doc.id,
        ...doc.data(),
      }));

      const pendingJobs = jobs.filter(job =>
        job.status !== 'confirmed' &&
        !(job.acceptedHelpers || []).some(helper => helper.househelpId === househelpId)
      );
      Vibration.vibrate(1000);
      setJobRequests(pendingJobs);
    });

    return () => unsubscribe();
  }, [househelpId]);

  const handleAcceptJob = async (jobId) => {
    if (!househelpName) {
      Alert.alert('Error', 'Househelp name is not set.');
      return;
    }

    setIsLoading(true);

    try {
      const jobRef = doc(db, 'partimeRequest', jobId);
      await updateDoc(jobRef, {
        status: 'accepted',
        acceptedHelpers: arrayUnion({ househelpId, househelpName, househelpdata })
      });

      Alert.alert('Success', 'Job has been accepted!');
      navigation.navigate('awaitingconfirmation', { jobId });
    } catch (error) {
      console.log('Failed to accept job:', error);
      Alert.alert('Error', 'Failed to accept the job.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header2 />
      <Hmenu navigation={navigation} />

      <ScrollView>
        <Text style={styles.header}>Available  sssss Jobs</Text>
        {jobRequests.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>No job requests available.</Text>
        ) : (
          jobRequests.map((job) => (
            <Pressable onPress={() => {}}>
            <View key={job.id2} style={styles.jobCard}>
              <Text style={styles.jobTitle}>{job.clientName}</Text>
              <Text style={styles.jobAmount}>₦{job.totalCost}</Text>
              <Text style={styles.jobInfo}>Apartment: {job.apartmentType}</Text>
              <Text style={styles.jobInfo}>Address: {job.address}</Text>
              <Text style={styles.jobInfo}>Phone: {job.phone}</Text>

              <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Chores:</Text>
              {job.chores.map((chore, index) => (
                <Text key={index} style={styles.choreItem}>• {chore.chore}</Text>
              ))}

              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptJob(job.id2)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Text style={styles.acceptButtonText}>Processing...</Text>
                ) : (
                  <Text style={styles.acceptButtonText}>Accept Job</Text>
                )}
              </TouchableOpacity>
            </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#343a40',
  },
  jobCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 5,
  },
  jobAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
  },
  jobInfo: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  choreItem: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  acceptButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export { HPartimeRequest };
