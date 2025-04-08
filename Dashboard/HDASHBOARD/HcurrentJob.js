import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../pages/firebase';

import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';

const HcurrentJob = ({ navigation }) => {
  const [confirmedJobs, setConfirmedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [househelpId, setHousehelpId] = useState('');

  useEffect(() => {
    const fetchHousehelp = async () => {
      const user = await AsyncStorage.getItem('househelpdata');
      if (user) {
        const parsed = JSON.parse(user);
        setHousehelpId(parsed.id);
      }
    };

    fetchHousehelp();

    const unsubscribe = onSnapshot(collection(db, 'partimeRequest'), (snapshot) => {
      const allJobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filteredJobs = allJobs.filter(
        job => job.status === 'confirmed' && job.househelpId === househelpId
      );
      setConfirmedJobs(filteredJobs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [househelpId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text>Loading confirmed jobs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header2 />
      <Cmenu navigation={navigation} />

      <ScrollView>
        <Text style={styles.header}>Ongoing Jobs</Text>

        {confirmedJobs.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>No confirmed jobs yet.</Text>
        ) : (
          confirmedJobs.map((job) => (
            <View key={job.id} style={styles.jobCard}>
              <Text style={styles.jobTitle}>Client: {job.clientName}</Text>
              <Text style={styles.jobInfo}>Phone: {job.phone}</Text>
              <Text style={styles.jobInfo}>Address: {job.address}</Text>
              <Text style={styles.jobInfo}>Apartment: {job.apartmentType}</Text>

              <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Chores:</Text>
              {job.chores.map((chore, index) => (
                <Text key={index} style={styles.choreItem}>
                  • {chore.chore} - ₦{Number(chore.price).toLocaleString()} {chore.completed ? '✅' : ''}
                </Text>
              ))}
            </View>
          ))
        )}
      </ScrollView>
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
  jobTitle: { fontSize: 20, fontWeight: 'bold', color: '#28a745' },
  jobInfo: { fontSize: 16, color: '#555', marginBottom: 5 },
  choreItem: { fontSize: 16, color: '#333', marginLeft: 10 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export { HcurrentJob };
