import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../pages/firebase';

import { Header2 } from '../../component/Header';
import { Cmenu } from '../../component/Menu';

const RequestConfirmation = ({ navigation, route }) => {
  const { clientId } = route.params;
  const [pendingJobs, setPendingJobs] = useState([]);
  const [selectedHelpers, setSelectedHelpers] = useState({});
  const [loading, setLoading] = useState(true); // To track loading state

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(db, 'partimeRequest'));
        const jobs = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(j => j.clientId === clientId && j.status === 'pending');

        setPendingJobs(jobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        Alert.alert('Error', 'Failed to fetch jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [clientId]);

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
              {job.acceptedBy && job.acceptedBy.length > 0 ? (
                job.acceptedBy.map((helper, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.helperButton,
                      selectedHelpers[job.id] === helper && styles.selectedHelper,
                    ]}
                    onPress={() =>
                      setSelectedHelpers((prev) => ({ ...prev, [job.id]: helper }))
                    }
                  >
                    <Text
                      style={[
                        styles.helperText,
                        selectedHelpers[job.id] === helper && styles.selectedHelperText,
                      ]}
                    >
                      {helper}
                    </Text>
                  </TouchableOpacity>
                ))
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
