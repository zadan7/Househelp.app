import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Pressable, ActivityIndicator
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { db } from '../../pages/firebase';
import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';

const CcompletedJobs = ({ navigation }) => {
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchCompletedJobs = async () => {
      try {
        const clientData = await AsyncStorage.getItem('clientdata');
        const parsedClient = JSON.parse(clientData);
        const clientId = parsedClient?.id;

        const snapshot = await getDocs(collection(db, 'partimeRequest'));
        const jobs = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(job => job.status === 'completed' && job.clientId === clientId);

        setCompletedJobs(jobs);
      } catch (error) {
        console.error('Error fetching completed jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedJobs();
  }, []);

  const openModal = (job) => {
    setSelectedJob(job);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedJob(null);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header2 />
        <Cmenu navigation={navigation} />
        <ActivityIndicator size="large" color="#28a745" style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header2 />
      <Cmenu navigation={navigation} />

      <ScrollView>
        <Text style={styles.header}>Completed Jobs</Text>

        {completedJobs.length === 0 ? (
          <Text style={styles.noJobs}>No completed jobs yet.</Text>
        ) : (
          completedJobs.map(job => (
            <View key={job.id} style={styles.jobCard}>
              <Text style={styles.jobTitle}>{job.househelpName || 'Househelp'}</Text>
              <Text style={styles.jobAmount}>₦{job.totalCost}</Text>
              <Text style={styles.jobInfo}>Location: {job.location?.lga}</Text>

              <TouchableOpacity onPress={() => openModal(job)} style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Job Details</Text>

              {selectedJob && (
                <>
                  <Text style={styles.modalInfo}><Text style={styles.label}>Househelp:</Text> {selectedJob.househelpName}</Text>
                  <Text style={styles.modalInfo}><Text style={styles.label}>Phone:</Text> {selectedJob.phone}</Text>
                  <Text style={styles.modalInfo}><Text style={styles.label}>Apartment:</Text> {selectedJob.apartmentType}</Text>
                  <Text style={styles.modalInfo}><Text style={styles.label}>Location:</Text> {selectedJob.location?.lga}</Text>
                  <Text style={styles.modalInfo}><Text style={styles.label}>Cost:</Text> ₦{selectedJob.totalCost}</Text>
                  <Text style={styles.modalInfo}><Text style={styles.label}>Chores:</Text></Text>
                  {selectedJob.chores?.map((chore, index) => (
                    <Text key={index} style={styles.choreItem}>• {chore.chore} – ₦{chore.price}</Text>
                  ))}
                </>
              )}

              <Pressable onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#343a40',
  },
  noJobs: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#6c757d',
  },
  jobCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2f855a',
    marginBottom: 4,
  },
  jobAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1d4ed8',
    marginBottom: 6,
  },
  jobInfo: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 5,
  },
  viewButton: {
    marginTop: 10,
    backgroundColor: '#55aa55',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 15,
  },
  modalInfo: {
    fontSize: 16,
    color: '#444',
    marginBottom: 6,
  },
  label: {
    fontWeight: '600',
    color: '#1f2937',
  },
  choreItem: {
    fontSize: 15,
    color: '#2f2f2f',
    marginLeft: 10,
    marginBottom: 4,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#e53e3e',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export { CcompletedJobs };
