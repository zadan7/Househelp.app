import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Animated, StyleSheet, ScrollView, Image,Button } from 'react-native';
// import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './../pages/firebase';
import { Header2 } from '../component/Header';
import { Ionicons } from '@expo/vector-icons';
import { Hmenu } from '../component/Menu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import {Notifications} from 'expo-notifications';
import { getExpoPushTokenAsync } from 'expo-notifications';
// import { Button } from 'react-native-web';


const gridItems = [
  { title: 'Current Job', icon: 'briefcase-outline', screen: 'HcurrentJob' },
  { title: 'Part-time', icon: 'time-outline', screen: 'hpartime' },
  { title: 'Full-time', icon: 'business-outline', screen: 'hfulltime' },
  { title: 'Weekly Jobs', icon: 'calendar-outline', screen: 'hweekly' },
  { title: 'Profile', icon: 'person-outline', screen: 'hprofile' },
  { title: 'Settings', icon: 'settings-outline', screen: 'hsettings' },
  { title: 'wallet', icon: 'wallet', screen: 'hwallet' },
  //  { title: 'Pending Jobs', icon: 'pending', screen: 'hpendingjobs' },


];

const HousehelpDashboard = ({ navigation }) => {
  const [jobRequests, setJobRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const [jobandclientsdata, setJobandClientdata] = useState([]);
  const menuAnimation = useState(new Animated.Value(-250))[0];
  const[househelp,setHousehelp]=useState({}) ;

  useEffect(() => {
 const fetchJobRequests = async () => {
  try {
    const querySnapshot = await db.collection('partimeRequest').get();
    const querySnapshot2 = await db.collection('clients').get();

    const jobs = querySnapshot.docs.map(doc => ({
      id2: doc.id,
      ...doc.data(),
    }));

    const clients = querySnapshot2.docs.map(doc => ({
      id2: doc.id,
      ...doc.data(),
    }));

    setClients(clients);

    // sort jobs (latest first)
    jobs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setJobRequests(jobs);

    // combine jobs with client data
    const merged = jobs.map(job => {
      const client = clients.find(c => c.id2 === job.clientId);
      return client ? { ...job, client } : job;
    });

    setJobandClientdata(merged);

  } catch (error) {
    console.error('Error fetching job requests: ', error);
  }
};

    fetchJobRequests();
  }, []);
  useEffect(() => {
    const fetchHousehelpdata = async () =>{
    const Househelp = await JSON.parse(AsyncStorage.getItem("househelpdata"))
    setHousehelp(Househelp) 
    }
    fetchHousehelpdata();
    
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
        <Text style={styles.header}>Welcome Back 👋{ househelp.name}</Text>

        {/* Grid Buttons Section */}
        <FlatList
          data={gridItems}
          keyExtractor={(item) => item.title}
          numColumns={2}
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

       
        {/* <Text style={styles.subHeader}>Example Jobs</Text> */}

      
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
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  gridItem: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    margin: 5,
    borderRadius: 12,
    width: '45%',
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