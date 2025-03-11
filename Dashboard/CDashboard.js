import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, ScrollView, RefreshControl, StyleSheet 
} from 'react-native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './../pages/firebase';
import { Header2 } from '../component/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Menu } from '../component/menu';

const ClientDashboard = () => {
  const [refreshing, setRefreshing] = useState(false); 
  const [jobRequests, setJobRequests] = useState([]);

  const fetchJobRequests = async () => {
    try {
      setRefreshing(true);
      const phonenumber = await AsyncStorage.getItem("phone");
      const querySnapshot = await getDocs(collection(db, 'partimeRequest'));
      const jobs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const personalJobs = jobs.filter(job => job.phone === phonenumber);
      personalJobs.sort((a, b) => new Date(b.timestamp?.toMillis()) - new Date(a.timestamp?.toMillis()));
      setJobRequests(personalJobs);
    } catch (error) {
      console.error('Error fetching job requests:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobRequests();
  }, []);

  const deleteJob = async (jobId) => {
    try {
      await deleteDoc(doc(db, 'partimeRequest', jobId));
      setJobRequests(prevJobs => prevJobs.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Header2 />
      <Menu />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchJobRequests} colors={["#28a745"]} />}
      >
        <Text style={styles.header}>My Job Requests</Text>
        <FlatList
          data={jobRequests}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.jobCard}>
              <Text style={styles.jobTitle}>{item.name}</Text>
              <Text style={styles.jobAmount}>₦{item.amount}</Text>
              <Text style={styles.jobInfo}>📍 {item.LGA}, {item.state}</Text>
              <Text style={[styles.jobStatus, { color: item.status === 'Accepted' ? '#28a745' : '#ffcc00' }]}>
                {item.status}
              </Text>
              <Text style={styles.choreHeader}>Chores:</Text>
              {item.chores?.replace(/[\[\]"]+/g, '').split(',').map((chore, index) => (
                <Text key={index} style={styles.choreItem}>• {chore.trim()}</Text>
              ))}
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => deleteJob(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteButtonText}>Delete Job</Text>
              </TouchableOpacity>
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
    backgroundColor: '#f0f2f5', 
    paddingBottom: 20 
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginVertical: 20, 
    color: '#333' 
  },
  jobCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#28a745'
  },
  jobTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#28a745', 
    marginBottom: 5 
  },
  jobAmount: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#007bff', 
    marginBottom: 8 
  },
  jobInfo: { 
    fontSize: 14, 
    color: '#555', 
    marginBottom: 4 
  },
  jobStatus: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    marginBottom: 8 
  },
  choreHeader: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#333', 
    marginTop: 8, 
    marginBottom: 4 
  },
  choreItem: { 
    fontSize: 14, 
    color: '#333', 
    paddingVertical: 2 
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10
  },
  deleteButtonText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: 'bold' 
  }
});

export { ClientDashboard };
