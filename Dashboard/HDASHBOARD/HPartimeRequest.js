import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Vibration, Pressable, RefreshControl } from 'react-native';
// import { collection, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Hmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import { arrayUnion } from 'firebase/firestore';
import firestore from '@react-native-firebase/firestore';

const HPartimeRequest = ({ navigation }) => {
  const [jobRequests, setJobRequests] = useState([]);
  const [househelpName, setHousehelpName] = useState('');
  const [househelpId, setHousehelpId] = useState('');
  const [househelpdata, setHousehelpdata] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

// --- 1. HOOK: LIFECYCLE RUNS AUTOMATICALLY ON SCREEN MOUNT ---
useEffect(() => {
  let unsubscribe = null;

  const initializeJobListener = async () => {
    try {
      // Await disk memory resolution completely first to avoid race conditions
      const user = await AsyncStorage.getItem('househelpdata');
      if (!user) {
        Alert.alert('Error', 'Househelp data not found.');
        return;
      }

      const parsedUser = JSON.parse(user);
      const currentHelperId = parsedUser.id;

      // Set global component states safely
      setHousehelpId(currentHelperId);
      setHousehelpdata(parsedUser);
      setHousehelpName(parsedUser.name);

      if (!currentHelperId) {
        console.warn("Resolved user object is missing an ID parameter.");
        return;
      }

      // Attach the snapshot listener only after the ID is guaranteed to exist
      unsubscribe = db.collection('partimeRequest').onSnapshot(
        (snapshot) => {
          const jobs = snapshot.docs.map((doc) => ({
            id2: doc.id,
            ...doc.data(),
          }));

          // Robust filtering against missing or empty database properties
          const pendingJobs = jobs.filter((job) => {
            const isCompleted = job.isjobcompleted === true;
            const isAccepted = job.status === 'accepted';

            const alreadyApplied = (job.acceptedHelpers || []).some(
              (helper) => helper && helper.househelpId === currentHelperId
            );

            return !isCompleted && !isAccepted && !alreadyApplied;
          });

          // Safe Sorting supporting both raw timestamp numbers or Firestore timestamp objects
          pendingJobs.sort((a, b) => {
            const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : Number(a.createdAt || 0);
            const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : Number(b.createdAt || 0);
            return timeB - timeA;
          });

          setJobRequests(pendingJobs);
          
          if (pendingJobs.length > 0) {
            Vibration.vibrate(500);
          }
        },
        (error) => {
          console.error("Live feed subscription crash: ", error);
        }
      );

    } catch (error) {
      console.error("Error setting up feed parameters:", error);
      Alert.alert('Error', 'Failed to fetch layout updates.');
    }
  };

  initializeJobListener();

  // Cleanup active background listener stream automatically when leaving the screen
  return () => {
    if (unsubscribe) unsubscribe();
  };
}, []); // Empty dependency array prevents infinite re-render loops


// --- 2. FUNCTION: TRIGGERED ONLY WHEN PROVIDER CLICKS "ACCEPT JOB" ---
const handleAcceptJob = async (jobId) => {
  if (!househelpName) {
    Alert.alert('Error', 'Househelp name is not set.');
    return;
  }

  setIsLoading(true);

  try {
    // Corrected to use your standard app database package tracking syntax
    await db
      .collection('partimeRequest')
      .doc(jobId)
      .update({
        status: 'accepted',
        acceptedHelpers: firestore.FieldValue.arrayUnion({
          househelpId: househelpId,
          househelpName: househelpName,
          househelpdata: househelpdata,
        }),
      });

    Alert.alert('Success', 'Job has been accepted!');
    navigation.navigate('awaitingconfirmation', { jobId });

  } catch (error) {
    console.error('Failed to accept job:', error);
    Alert.alert('Error', 'Failed to accept the job.');
  } finally {
    setIsLoading(false);
  }
};

  const onRefresh = () => {
    setRefreshing(true);


    
   const unsubscribe = db
  .collection('partimeRequest')
  .onSnapshot(snapshot => {
    const jobs = snapshot.docs.map(doc => ({
      id2: doc.id,
      ...doc.data(),
    }));

    console.log('Fetched jobs on refresh:', jobs);
    const pendingJobs = jobs.filter(job =>
      job.isjobcompleted == false &&
      !(job.acceptedHelpers || []).some(
        helper => helper.househelpId === househelpId
      )
    );

    setJobRequests(pendingJobs);
  });

    // Since the data is updated in real-time via onSnapshot, 
    // we simulate a refresh by briefly showing the indicator
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  return (
    <View style={styles.container}>
      <Header2 />
      <Hmenu navigation={navigation} />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.header}>Available Jobs</Text>
        {jobRequests.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>No job requests available.</Text>
        ) : (
          jobRequests.map((job) => (
            <Pressable onPress={() => {}}>
            <View key={job.id2} style={styles.jobCard}>
              <Text style={styles.jobTitle}>{job.clientName}</Text>
              <Text style={styles.jobAmount}>₦{job.totalCost}</Text>
              <Text style={styles.jobInfo}>Apartment: {job.apartmentType}</Text>
              <Text style={styles.jobInfo}>Address: {job.address}</Text>
              <Text style={styles.jobInfo}>Phone: {job.phone}</Text>
              <Text style={styles.jobInfo}>Jobid: {job.id}</Text>
              <Text style={styles.jobInfo}> Date:{new Date(job.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })}</Text>

              <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Chores:</Text>
              {job.chores.map((chore, index) => (
                <Text key={index} style={styles.choreItem}>• {chore.chore}</Text>
              ))}

              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptJob(job.id2)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Text style={styles.acceptButtonText}>Processing...</Text>
                ) : (
                  <Text style={styles.acceptButtonText}>Accept Job</Text>
                )}
              </TouchableOpacity>
            </View>
            </Pressable>
          ))
        )}
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
    marginTop: 15,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export { HPartimeRequest };
