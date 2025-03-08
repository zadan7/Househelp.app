import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Animated, StyleSheet, ScrollView } from 'react-native';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './../pages/firebase';
import { Header2 } from '../component/Header';

const HousehelpDashboard = () => {
  const [jobRequests, setJobRequests] = useState([
    { id: 'dummy1', title: 'Clean Living Room', description: 'Sweep and mop the floor.', status: 'Pending', amount: '$20', client: 'John Doe', househelp: 'Jane Smith' }
  ]);
  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnimation = useState(new Animated.Value(-300))[0];

  useEffect(() => {
    const fetchJobRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'jobRequests'));
        const jobs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobRequests(prevJobs => [...prevJobs, ...jobs]);
      } catch (error) {
        console.error('Error fetching job requests: ', error);
      }
    };
    fetchJobRequests();
  }, []);

  const acceptJob = async (jobId) => {
    try {
      await updateDoc(doc(db, 'jobRequests', jobId), { status: 'Accepted' });
      setJobRequests(prevJobs => prevJobs.map(job => job.id === jobId ? { ...job, status: 'Accepted' } : job));
    } catch (error) {
      console.error('Error accepting job: ', error);
    }
  };
  const rejectJob = async (jobId) => {
    try {
      await updateDoc(doc(db, 'jobRequests', jobId), { status: 'Rejected' });
      setJobRequests(prevJobs => prevJobs.map(job => job.id === jobId ? { ...job, status: 'Rejected' } : job));
    } catch (error) {
      console.error('Error rejecting job: ', error);
    }
  };
  const toggleMenu = () => {
    Animated.timing(menuAnimation, {
      toValue: menuVisible ? -300 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setMenuVisible(!menuVisible);
  };

  return (
    <View style={styles.container}>
        <View>
        <Header2 />

        </View>
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Text style={styles.menuText}>☰ Menu</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.menu, { left: menuAnimation }]}> 
        <TouchableOpacity onPress={toggleMenu}><Text style={styles.closeMenu}>×</Text></TouchableOpacity>
        <TouchableOpacity><Text style={styles.menuItem}>Dashboard</Text></TouchableOpacity>
        <TouchableOpacity><Text style={styles.menuItem}>Profile</Text></TouchableOpacity>
        <TouchableOpacity><Text style={styles.menuItem}>Settings</Text></TouchableOpacity>
        <TouchableOpacity><Text style={styles.menuItem}>Logout</Text></TouchableOpacity>
      </Animated.View>

      <ScrollView>
        <Text style={styles.header}>Househelp Dashboard</Text>
        <FlatList
          data={jobRequests}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.jobCard}>
              <Text style={styles.jobTitle}>{item.title}</Text>
              <Text style={styles.jobDescription}>{item.description}</Text>
              <Text style={styles.jobInfo}>Client: {item.client}</Text>
              <Text style={styles.jobInfo}>Househelp: {item.househelp}</Text>
              <Text style={styles.jobInfo}>Amount: {item.amount}</Text>
              <Text style={styles.jobStatus}>Status: {item.status}</Text>
              {item.status !== 'Accepted' && (
                <TouchableOpacity style={styles.acceptButton} onPress={() => acceptJob(item.id)}>
                  <Text style={styles.acceptButtonText}>Accept Job</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />

<FlatList
          data={jobRequests}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.jobCard}>
              <Text style={styles.jobTitle}>{item.title}</Text>
              <Text style={styles.jobDescription}>{item.description}</Text>
              <Text style={styles.jobInfo}>Client: {item.client}</Text>
              <Text style={styles.jobInfo}>Househelp: {item.househelp}</Text>
              <Text style={styles.jobInfo}>Amount: {item.amount}</Text>
              <Text style={styles.jobStatus}>Status: {item.status}</Text>
              {item.status === 'Pending' && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.acceptButton} onPress={() => acceptJob(item.id)}>
                    <Text style={styles.acceptButtonText}>Accept Job</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectButton} onPress={() => rejectJob(item.id)}>
                    <Text style={styles.rejectButtonText}>Reject Job</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />

<FlatList
          data={jobRequests}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.jobCard}>
              <Text style={styles.jobTitle}>{item.title}</Text>
              <Text style={styles.jobDescription}>{item.description}</Text>
              <Text style={styles.jobInfo}>Client: {item.client}</Text>
              <Text style={styles.jobInfo}>Househelp: {item.househelp}</Text>
              <Text style={styles.jobInfo}>Amount: {item.amount}</Text>
              <Text style={styles.jobStatus}>Status: {item.status}</Text>
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
    backgroundColor: '#f4f4f4',
    // padding: 20,
  },
  menuButton: {
    padding: 10,
    margin:10,
    backgroundColor: '#005f03',
    borderRadius: 5,
    alignSelf: 'center',
    position:"",
    right:3,
    textAlign:"right"
  },
  menuText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  menu: {
    position: 'absolute',
    top: 30,
    left:-300,
    width: 300,
    height: '100%',
    backgroundColor: 'green',
    padding: 20,
    // margin:20
    zIndex:1
  },
  closeMenu: {
    color: '#fff',
    fontSize: 24,
    textAlign: 'right',
    marginBottom: 20,
    padding:20
  },
  menuItem: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  jobCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
    
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  jobDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  jobInfo: {
    fontSize: 16,
    color: '#777',
    marginBottom: 5,
  },
  jobStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
  },
  acceptButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width:"40%",
    // display:"flex",

  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    // flex: 1,
    width:"40%",
    marginLeft: 5,
    alignItems: 'center',
    margin:5,
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export { HousehelpDashboard };

