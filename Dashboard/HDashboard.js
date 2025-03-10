import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Animated, StyleSheet, ScrollView } from 'react-native';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './../pages/firebase';
import { Header2 } from '../component/Header';
import { Ionicons } from '@expo/vector-icons';

const HousehelpDashboard = () => {
  const [jobRequests, setJobRequests] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnimation = useState(new Animated.Value(-250))[0];

  useEffect(() => {
    const fetchJobRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'partimeRequest'));
        const jobs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        jobs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setJobRequests(jobs);
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

  const toggleMenu = () => {
    Animated.timing(menuAnimation, {
      toValue: menuVisible ? -250 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setMenuVisible(!menuVisible);
  };

  return (
    <View style={styles.container}>
      <Header2 />
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Ionicons name="menu" size={40} color="white" />
        <Text style={{color:"white"}}>MENU</Text>
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
              <Text style={styles.jobTitle}>{item.name}</Text>
              <Text style={styles.jobAmount}>Amount: N {item.amount}</Text>
              <Text style={styles.jobInfo}>Apartment size: {item.apartmenttype}</Text>
              <Text style={styles.jobInfo}>LGA: {item.LGA}</Text>
              <Text style={styles.jobInfo}>Phone: {item.phone}</Text>
              <Text style={styles.jobInfo}>State: {item.state}</Text>
              <Text style={styles.jobInfo}>Address: {item.address}</Text>
              <Text style={styles.jobInfo}>List of chores:</Text>
              {item.chores && typeof item.chores === "string" &&
                item.chores.replace(/[\[\]"]+/g, '')
                  .split(',')
                  .map((chore, index) => {
                    const parts = chore.trim().split(':');
                    if (parts.length >= 2) {
                      const choreName = parts[0].trim();
                      const chorePrice = parts[1].trim().split(',')[0];
                      return (
                        <Text key={index} style={styles.choreItem}>
                          {choreName}: {chorePrice}
                        </Text>
                      );
                    }
                  })}
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
  menuButton: {
    padding: 10,
    backgroundColor: '#28a745',
    borderRadius: 50,
    position: 'absolute',
    bottom: "10%",
    right: "10%",
    zIndex: 10,
    width:"auto"
  },
  menu: {
    position: 'absolute',
    top: 0,
    left: -250,
    width: 250,
    height: '100%',
    backgroundColor: '#343a40',
    padding: 20,
    zIndex: 1,
  },
  closeMenu: {
    color: '#fff',
    fontSize: 24,
    textAlign: 'right',
    marginBottom: 20,
  },
  menuItem: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
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
  }
});

export { HousehelpDashboard };
