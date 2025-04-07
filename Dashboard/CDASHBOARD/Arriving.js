import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../pages/firebase';

import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';

const Arriving = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);

  // Fetch jobs with status "confirmed"
  useEffect(() => {
    const fetchConfirmedJobs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'chores'));
        const confirmedJobs = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(job => job.status === 'confirmed');
        setJobs(confirmedJobs);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    };

    fetchConfirmedJobs();
  }, []);

  const handleStartJob = async (jobId) => {
    try {
      const jobRef = doc(db, 'chores', jobId);
      await updateDoc(jobRef, {
        status: 'in-progress',
        startedAt: new Date(),
      });
      Alert.alert("Success", "Job started successfully!");
      // Update UI
      setJobs(prev => prev.map(job => job.id === jobId ? { ...job, status: 'in-progress' } : job));
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
        <Text style={styles.header}>Arriving Househelps</Text>

        {jobs.length === 0 ? (
          <Text style={styles.noJobText}>No confirmed jobs yet.</Text>
        ) : (
          jobs.map(job => (
            <View key={job.id} style={styles.jobCard}>
              <Text style={styles.jobTitle}>{job.description}</Text>
              <Text style={styles.jobInfo}>Price: ${job.price}</Text>
              <Text style={styles.jobInfo}>Status: {job.status}</Text>
              <Text style={styles.jobInfo}>Assigned To: {job.househelpName || 'Pending assignment'}</Text>

              {job.status === 'confirmed' && (
                <TouchableOpacity
                  onPress={() => handleStartJob(job.id)}
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
});

export { Arriving };
