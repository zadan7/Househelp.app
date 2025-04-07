import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../pages/firebase';

import { Header2 } from '../../component/Header';
import { Cmenu } from '../../component/Menu';

const RequestConfirmation = ({ navigation, route }) => {
  const { clientId } = route.params; // Get clientId from navigation route
  const [job, setJob] = useState(null);
  const [selectedHelper, setSelectedHelper] = useState(null);

  useEffect(() => {
    const fetchClientJobs = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'partimeRequest'));
        const jobs = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(j => j.clientId === clientId && j.status === 'pending')
          .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

        if (jobs.length > 0) {
          setJob(jobs[0]);
        }
      } catch (error) {
        console.error('Error fetching part-time jobs:', error);
      }
    };

    fetchClientJobs();
  }, [clientId]);

  const handleConfirm = async () => {
    if (!selectedHelper || !job) {
      Alert.alert("Please select a househelp before confirming.");
      return;
    }

    try {
      const jobRef = doc(db, 'partimeRequest', job.id);
      await updateDoc(jobRef, {
        househelpName: selectedHelper,
        status: 'confirmed',
      });

      Alert.alert("Job Confirmed", `You selected ${selectedHelper}.`);
      navigation.navigate('arriving', { clientId }); // You can pass clientId forward if needed
    } catch (error) {
      console.error("Error confirming job:", error);
      Alert.alert("Error", "Failed to confirm job.");
    }
  };

  return (
    <View style={styles.container}>
      <Header2 />
      <Cmenu navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.header}>Request Confirmation</Text>

        {!job ? (
          <Text style={styles.noJobText}>No pending job found for this client.</Text>
        ) : (
          <View style={styles.jobCard}>
            <Text style={styles.jobTitle}>{job.description || 'Job Request'}</Text>
            <Text style={styles.jobInfo}>Location: {job.address}</Text>
            <Text style={styles.jobInfo}>Price: ${job.price}</Text>
            <Text style={styles.jobInfo}>Requested On: {new Date(job.createdAt?.seconds * 1000).toLocaleString()}</Text>
            <Text style={styles.subHeader}>Househelps Available:</Text>

            {job.acceptedBy && job.acceptedBy.length > 0 ? (
              job.acceptedBy.map((helper, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.helperButton,
                    selectedHelper === helper && styles.selectedHelper,
                  ]}
                  onPress={() => setSelectedHelper(helper)}
                >
                  <Text style={[
                    styles.helperText,
                    selectedHelper === helper && styles.selectedHelperText,
                  ]}>
                    {helper}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.waitingText}>Waiting for househelps to accept...</Text>
            )}

            <TouchableOpacity
              onPress={handleConfirm}
              style={[
                styles.confirmButton,
                !selectedHelper && { backgroundColor: '#ccc' },
              ]}
              disabled={!selectedHelper}
            >
              <Text style={styles.confirmButtonText}>Confirm & Continue</Text>
            </TouchableOpacity>
          </View>
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
  jobCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 15,
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
