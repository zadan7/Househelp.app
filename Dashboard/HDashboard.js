import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { collection, getDocs, updateDoc, doc, arrayUnion,getDoc } from 'firebase/firestore';
import { db } from './../pages/firebase';
import { Header2 } from '../component/Header';
import { Menu } from '../component/menu';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HousehelpDashboard = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [jobRequests, setJobRequests] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const [UserID, setUserID] = useState(null);
  const [User, setUser] = useState(null);


  useEffect(() => {
    const fetchEmail = async () => {
      const email = await AsyncStorage.getItem('userEmail');
      if (email) {
        setUserEmail(email);
      }
    };
    const fetchUser = async () => {
      var user = await AsyncStorage.getItem('User');
      if (user) {
        setUser(JSON.parse(user));
      }
    };
    fetchUser()
    fetchEmail();
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetchJobRequests();
    }
  }, [userEmail]);

  const fetchJobRequests = async () => {
    if (!userEmail) return; // Ensure userEmail is set before fetching

    try {
      setRefreshing(true);
      const querySnapshot = await getDocs(collection(db, 'partimeRequest'));
      const jobs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Ensure jobs are sorted by timestamp
      jobs.sort((a, b) => new Date(b.timestamp?.toMillis()) - new Date(a.timestamp?.toMillis()));

      // Filter jobs that are NOT rejected by the logged-in user
      const filteredJobs = jobs.filter(job => !(job.rejectedBy?.includes(userEmail)));
      setJobRequests(filteredJobs);
    } catch (error) {
      console.error('Error fetching job requests:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
  const fetchUserByEmail = async (email) => {
    try {
      const q = query(collection(db, "househelps"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        console.log("No user found with this email.");
        return null;
      }
  
      // Get the first matching document (assuming emails are unique)
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data(); 
  
      console.log("User found:", userData);
      return userData;
  
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };
  
  // Example Usage
  const acceptJob = async (jobId) => {
    try {
      if (!userEmail) {
        Alert.alert("Error", "User email not found.");
        return;
      }
  
      // Fetch househelp details from AsyncStorage
      const getUser = await AsyncStorage.getItem("User");
      setUser(JSON.parse(getUser));
      const userData = JSON.parse(getUser);
      const userID = await AsyncStorage.getItem("UserID");
  
      // Fetch current job details from Firestore
      const jobRef = doc(db, 'partimeRequest', jobId);
      const jobSnap = await getDoc(jobRef);
  
      if (!jobSnap.exists()) {
        Alert.alert("Error", "Job not found.");
        return;
      }
  
      const jobData = jobSnap.data();
  
      // Check if househelp has already accepted
      if (jobData.acceptedHousehelps?.includes(userID)) {
        Alert.alert("Error", "You have already accepted this job.");
        return;
      }
  
      // Append househelp details to the list of accepted househelps
      await updateDoc(jobRef, {
        acceptedHousehelps: arrayUnion({
          email: userEmail,
          name: userData.name,
          phone: userData.phonenumber,
          experience: userData.experience,
          househelpID: userID
        }),
      });
  
      // Update UI to remove the Accept button
      setJobRequests(prevJobs =>
        prevJobs.map(job =>
          job.id === jobId ? { ...job, acceptedHousehelps: [...(job.acceptedHousehelps || []), { househelpID: userID }] } : job
        )
      );
  
      Alert.alert("Job Accepted!", "You have successfully accepted the job.");
      AsyncStorage.setItem("AcceptedJob", JSON.stringify(jobId));
      navigation.navigate("startjob");
  
    } catch (error) {
      console.error("Error accepting job:", error);
      Alert.alert("Error", "Failed to accept job. Please try again.");
    }
  };
  
  

  const rejectJob = async (jobId) => {
    if (!userEmail) return;

    try {
      await updateDoc(doc(db, 'partimeRequest', jobId), {
        rejectedBy: arrayUnion(userEmail) // Add userEmail to rejectedBy array
      });

      // Remove the job from local state so it disappears from the UI
      setJobRequests(prevJobs => prevJobs.filter(job => job.id !== jobId));
      Alert.alert("Job Rejected!", "The job has been removed from your dashboard.");
    } catch (error) {
      console.error('Error rejecting job:', error);
    }
  };

  return (
    <View>

    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchJobRequests} colors={["#28a745"]} />}
    >
      
      <Header2 />
    <Menu></Menu>

      <View style={styles.content}>
        <Text style={styles.title}>Available Job Requests</Text>
        <Text style={styles.title}>{userEmail}</Text>
        {/* <Text style={styles.title}>{User.id}</Text> */}


        {jobRequests.length === 0 ? (
          <Text style={styles.noJobs}>No job requests available</Text>
        ) : (
          jobRequests.map((item, index) => (
            <View key={index} style={styles.jobCard}>
              <Text style={styles.jobHeader}>Client name:{item.name}</Text>
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
    {!(item.acceptedHousehelps?.some(h => h.househelpID === UserID)) && (
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
          ))
        )}
      </View>
    </ScrollView>
    </View>
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
  choreItem: { fontSize: 16, color: '#333', marginVertical: 3 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  acceptButton: { backgroundColor: '#28a745', paddingVertical: 12, borderRadius: 8, flex: 1, alignItems: 'center', marginRight: 5 },
  acceptButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  rejectButton: { backgroundColor: '#dc3545', paddingVertical: 12, borderRadius: 8, flex: 1, alignItems: 'center', marginLeft: 5 },
  rejectButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
  // rejectButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }

});

export { HousehelpDashboard };
