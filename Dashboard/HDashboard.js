import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Animated, StyleSheet, ScrollView, Image } from 'react-native';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './../pages/firebase';
import { Header2 } from '../component/Header';
import { Ionicons } from '@expo/vector-icons';
import { Hmenu } from '../component/Menu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import {Notifications} from 'expo-notifications';
import { getExpoPushTokenAsync } from 'expo-notifications';


const gridItems = [
  { title: 'Current Job', icon: 'briefcase-outline', screen: 'HcurrentJob' },
  { title: 'Part-time', icon: 'time-outline', screen: 'hpartime' },
  { title: 'Full-time', icon: 'business-outline', screen: 'hfulltime' },
  { title: 'Weekly Jobs', icon: 'calendar-outline', screen: 'hweekly' },
  { title: 'Profile', icon: 'person-outline', screen: 'hprofile' },
  { title: 'Settings', icon: 'settings-outline', screen: 'hsettings' },
];

const HousehelpDashboard = ({ navigation }) => {
  const [jobRequests, setJobRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const [jobandclientsdata, setJobandClientdata] = useState([]);
  const menuAnimation = useState(new Animated.Value(-250))[0];

  useEffect(() => {
    const fetchJobRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'partimeRequest'));
        const querySnapshot2 = await getDocs(collection(db, 'clients'));

        const jobs = querySnapshot.docs.map(doc => ({ id2: doc.id, ...doc.data() }));
        const clients = querySnapshot2.docs.map(doc => ({ id2: doc.id, ...doc.data() }));
        setClients(clients);

        jobs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setJobRequests(jobs);

        jobs.forEach((job) => {
          const client = clients.find(client => client.id2 === job.clientId);
          if (client) {
            setJobandClientdata(prevData => [...prevData, { ...job, client }]);
          }
        });
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

  return (
    <View style={styles.container}>
      <Header2 />
      <Hmenu navigation={navigation} />

      <ScrollView>
        <Text style={styles.header}>Welcome Back 👋</Text>

        {/* Grid Buttons Section */}
        <FlatList
          data={gridItems}
          keyExtractor={(item) => item.title}
          numColumns={3}
          columnWrapperStyle={{ justifyContent: 'space-around' }}
          scrollEnabled={false}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate(item.screen)}>
              <Ionicons name={item.icon} size={30} color="#28a745" />
              <Text style={styles.gridText}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />

        <Text style={styles.subHeader}>Example Jobs</Text>

        <FlatList
          data={jobandclientsdata}
          keyExtractor={item => item.id2}
          renderItem={({ item }) => (
            <View style={styles.jobCard}>
              <Image source={{ uri: item.client?.facepicture }} style={styles.avatar} />
              <Text style={styles.jobTitle}>{item.clientName}</Text>
              <Text style={styles.jobAmount}>Amount: ₦{item.totalCost}</Text>
              <Text style={styles.jobInfo}>Apartment: {item.apartmentType}</Text>
              <Text style={styles.jobInfo}>LGA: {item.client?.lga}</Text>
              <Text style={styles.jobInfo}>Phone: {item.phone}</Text>
              <Text style={styles.jobInfo}>State: {item.state}</Text>
              <Text style={styles.jobInfo}>Address: {item.client?.address}</Text>
              <Text style={styles.jobInfo}>Chores:</Text>
              {item.chores?.map((chore, index) => (
                <Text key={index} style={styles.choreItem}>
                  - {chore.chore}: ₦{chore.price}
                </Text>
              ))}
              {/* {item.status !== 'Accepted' && (
                <TouchableOpacity style={styles.acceptButton} onPress={() => acceptJob(item.id)}>
                  <Text style={styles.acceptButtonText}>Accept Job</Text>
                </TouchableOpacity>
              )} */}
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
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginLeft: 20,
    color: '#333',
  },
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 10,
    marginLeft: 20,
    color: '#555',
  },
  grid: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  gridItem: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    margin: 5,
    borderRadius: 12,
    width: 100,
    height: 100,
    elevation: 2,
  },
  gridText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
  },
  jobCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    elevation: 2,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 10,
  },
  jobAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
  },
  jobInfo: {
    fontSize: 15,
    color: '#444',
    marginBottom: 3,
  },
  choreItem: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
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

export { HousehelpDashboard };