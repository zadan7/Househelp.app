import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './../pages/firebase';
import { Header2 } from '../component/Header';
// import { Cmenu } from '../component/Menu';
import { Cmenu } from '../component/Menu';
import { AsyncStorage } from '@react-native-async-storage/async-storage';

const ClientDashboard = ({navigation}) => {
  const [jobRequests, setJobRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientdata, setClientdata] = useState({});


  useEffect(() => {
    const fetchJobRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'partimeRequest'));
        const jobs = querySnapshot.docs.map(doc => ({
          id: doc.id, 
          ...doc.data()
        }));
        jobs.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());
        setJobRequests(jobs);
      } catch (error) {
        console.error('Error fetching job requests: ', error);
      }
    };

    const fetchClientData = async () => {
      try { 
        var cdata = await AsyncStorage.getItem('clientdata');
        if (cdata) {  setClientdata(JSON.parse(cdata)); }
      } catch (error) {
        console.log('Error fetching client data: ', error);
      }
    };
    fetchClientData();  
    fetchJobRequests();
  }, []);
 

  const acceptJob = async (jobId) => {
    try {
      await updateDoc(doc(db, 'partimeRequest', jobId), { status: 'Accepted' });
      setJobRequests(prevJobs => prevJobs.map(job => 
        job.id === jobId ? { ...job, status: 'Accepted' } : job
      ));
    } catch (error) {
      console.error('Error accepting job: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Header2 />
      
      {/* Floating Menu */}
      <Cmenu  navigation={navigation}/>

      <ScrollView>
        <Text style={styles.header}>Client Dashboard</Text>
        <FlatList
          data={jobRequests}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.jobCard}>
              <Text style={styles.jobTitle}>{item.name}</Text>
              <Text style={styles.jobAmount}>Amount: N {item.amount}</Text>
              <Text style={styles.jobInfo}>Apartment size: {item.apartmenttype}</Text>
              <Text style={styles.jobInfo}>LGA: {item.LGA}</Text>
              <Text style={styles.jobInfo}>Phone: {item.phone}</Text>
              <Text style={styles.jobInfo}>State: {item.state}</Text>
              <Text style={styles.jobInfo}>Address: {item.address}</Text>
              <Text style={styles.jobInfo}>List of chores:</Text>
              {Array.isArray(item.chores) ? (
                item.chores.map((chore, index) => (
                  <Text key={index} style={styles.choreItem}>{chore}</Text>
                ))
              ) : (
                item.chores && typeof item.chores === "string" &&
                item.chores.replace(/[\[\]"]+/g, '').split(',').map((chore, index) => {
                  const parts = chore.trim().split(':');
                  if (parts.length >= 2) {
                    return (
                      <Text key={index} style={styles.choreItem}>
                        {parts[0].trim()}: {parts[1].trim()}
                      </Text>
                    );
                  }
                })
              )}
              {item.status !== 'Accepted' && (
                <TouchableOpacity style={styles.acceptButton} onPress={() => acceptJob(item.id)}>
                  <Text style={styles.acceptButtonText}>Accept Job</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
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
    marginTop: 10,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export { ClientDashboard };
