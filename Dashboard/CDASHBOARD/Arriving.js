import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../pages/firebase';

import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Arriving = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);

  // Fetch jobs with status "confirmed"
  useEffect(() => {
    const fetchConfirmedJobs = async () => {
      try {
       
        const storedJobId = await AsyncStorage.getItem('jobId');
        console.log("storedJobId",storedJobId)
        const querySnapshot = await getDocs(collection(db, 'partimeRequest'));
        const confirmedJobs = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(job => job.status === 'confirmed' && job.id === storedJobId);
        setJobs(confirmedJobs);
        console.log(confirmedJobs);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    };

    fetchConfirmedJobs();
  }, []);

  const handleStartJob = async (jobId, job) => {
    try {
      const jobRef = doc(db, 'partimeRequest', jobId);
      await updateDoc(jobRef, {
        status: 'in-progress',
        startedAt: new Date(),
      });
      Alert.alert("Success", "Job started successfully!");
      setJobs(prev => prev.map(job => job.id === jobId ? { ...job, status: 'in-progress' } : job));
      console.log("Job started successfully:", job);
      AsyncStorage.setItem('jobId', jobId);
      navigation.navigate('cstartjob', { job });
    } catch (err) {
      console.error('Failed to start job:', err);
      Alert.alert("Error", "Could not start the job. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Header2 />
      <Cmenu navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.header}>Awaiting Househelps Arrival</Text>

        {jobs.length === 0 ? (
          <Text style={styles.noJobText}>No confirmed jobs yet.</Text>
        ) : (
          jobs.map(job => (
            <View key={job.id} style={styles.jobCard}>
              <Text style={styles.jobTitle}>Househelp: {job.househelpName}</Text>
              <Text style={styles.jobInfo}>Job ID: {job.jobid}</Text>
              <Text style={styles.jobInfo}>Client: {job.clientName}</Text>
              <Text style={styles.jobInfo}>Client Email: {job.clientEmail}</Text>
              <Text style={styles.jobInfo}>Phone: {job.phone}</Text>
              <Text style={styles.jobInfo}>Request Type: {job.requestType}</Text>
              <Text style={styles.jobInfo}>Apartment: {job.apartmentType}</Text>
              <Text style={styles.jobInfo}>Address: {job.address}</Text>
              <Text style={styles.jobInfo}>Status: {job.status}</Text>
              <Text style={styles.jobInfo}>Total Cost: ₦{job.totalCost}</Text>

              <Text style={styles.sectionTitle}>Chores:</Text>
              {job.chores && job.chores.map((chore, index) => (
                <Text key={index} style={styles.choreItem}>• {chore.chore} {chore.price}</Text>
              ))}

              {job.househelpdata && (
                <>
                  <Text style={styles.sectionTitle}>Househelp Profile:</Text>
                  {job.househelpdata.url && (
                    <Image
                      source={{ uri: job.househelpdata.url }}
                      style={styles.profileImage}
                    />
                  )}
                  <Text style={styles.jobInfo}>Email: {job.househelpdata.email}</Text>
                  <Text style={styles.jobInfo}>Phone: {job.househelpdata.phonenumber}</Text>
                  <Text style={styles.jobInfo}>Location: {job.househelpdata.address}</Text>
                  <Text style={styles.jobInfo}>Experience: {job.househelpdata.experience} years</Text>
                  <Text style={styles.jobInfo}>Gender: {job.househelpdata.gender}</Text>
                </>
              )}

              {job.status === 'confirmed' && (
                <TouchableOpacity
                  onPress={() => handleStartJob(job.id,job)}
                  style={styles.startButton}
                >
                  <Text style={styles.startButtonText}>Start Job</Text>
                </TouchableOpacity>
              )}
              {job.status === 'in-progress' && (
                <Text style={styles.inProgress}>Job in Progress</Text>
              )}
            </View>
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
  scrollView: {
    paddingBottom: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#343a40',
  },
  noJobText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 30,
  },
  jobCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 8,
  },
  jobInfo: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    color: '#333',
  },
  choreItem: {
    fontSize: 15,
    color: '#555',
    marginLeft: 10,
  },
  startButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  inProgress: {
    marginTop: 10,
    color: '#ffc107',
    fontWeight: '600',
    fontSize: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginVertical: 10,
  },
});

export { Arriving };
