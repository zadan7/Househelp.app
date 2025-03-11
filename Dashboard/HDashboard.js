import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { collection, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from './../pages/firebase';
import { Header2 } from '../component/Header';
import { Menu } from '../component/menu';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HousehelpDashboard = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [jobRequests, setJobRequests] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const [userState, setUserState] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const email = await AsyncStorage.getItem('userEmail');
      const userDataJson = await AsyncStorage.getItem("User");
      
      if (email) setUserEmail(email);
      if (userDataJson) {
        const userData = JSON.parse(userDataJson);
        setUserState(userData.state);
        setUserLocation(JSON.parse(userData.location));
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userEmail && userState) {
      fetchJobRequests();
    }
  }, [userEmail, userState]);

  const fetchJobRequests = async () => {
    if (!userEmail || !userState || !userLocation) return;
  
    try {
      setRefreshing(true);
      const querySnapshot = await getDocs(collection(db, 'partimeRequest'));
      let jobs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      jobs.sort((a, b) => new Date(b.timestamp?.toMillis()) - new Date(a.timestamp?.toMillis()));
  
      const filteredJobs = jobs.filter(job => 
        !(job.rejectedBy?.includes(userEmail)) &&
        job.status !== 'Accepted' &&
        (job.state === userState || isNearby(job))
      );
  
      setJobRequests(filteredJobs);
    } catch (error) {
      console.error('Error fetching job requests:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  const isNearby = (job) => {
    if (!userLocation || !job.latitude || !job.longitude) return false;
    const jobLat = job.latitude;
    const jobLng = job.longitude;
    const userLat = userLocation.latitude;
    const userLng = userLocation.longitude;
    
    const distance = getDistance(userLat, userLng, jobLat, jobLng);
    return distance <= 10; // 10km radius check
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchJobRequests} colors={["#28a745"]} />}
    >
      <Header2 />
      <Menu />
      <View style={styles.content}>
        <Text style={styles.title}>Available Job Requests</Text>
        {jobRequests.length === 0 ? (
          <Text style={styles.noJobs}>No job requests available</Text>
        ) : (
          jobRequests.map((item, index) => (
            <View key={index} style={styles.jobCard}>
              <Text style={styles.jobHeader}>{item.name}</Text>
              <Text style={styles.jobAmount}>Total Pay: ₦{item.amount}</Text>
              <Text style={styles.jobText}>Apartment Type: {item.apartmenttype}</Text>
              <Text style={styles.jobText}>Location: {item.address}, {item.LGA}, {item.state}</Text>
              <Text style={styles.jobText}>Phone: {item.phone}</Text>
              <Text style={styles.jobSubHeader}>Chores</Text>
              {item.chores && typeof item.chores === "string" &&
                item.chores.replace(/[\[\]"]+/g, '')
                  .split(',')
                  .map((chore, index) => (
                    <Text key={index} style={styles.choreItem}>• {chore.trim()}</Text>
                  ))}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', alignItems: 'center', paddingVertical: 20 },
  content: { width: '90%', maxWidth: 500, backgroundColor: '#f8f9fa', padding: 20, borderRadius: 12, shadowColor: '#000', elevation: 4, marginVertical: 20 },
  title: { color: '#28a745', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  noJobs: { fontSize: 18, color: '#999', textAlign: 'center', fontStyle: 'italic', marginTop: 20 },
  jobCard: { width: '100%', backgroundColor: '#fff', padding: 15, borderRadius: 10, shadowColor: '#000', elevation: 2, marginVertical: 10 },
  jobHeader: { fontSize: 20, fontWeight: 'bold', color: '#28a745', marginBottom: 5 },
  jobAmount: { fontSize: 18, fontWeight: 'bold', color: '#007bff', marginBottom: 10 },
  jobText: { fontSize: 16, color: '#555', marginBottom: 5 },
  jobSubHeader: { fontSize: 18, fontWeight: 'bold', color: '#555', marginTop: 10 },
  choreItem: { fontSize: 16, color: '#333', marginVertical: 3 }
});

export { HousehelpDashboard };
