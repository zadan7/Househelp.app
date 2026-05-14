import React, { useEffect, useState, useRef } from 'react'; // Added useRef
import { View, Text, ActivityIndicator, StyleSheet, Vibration } from 'react-native';
import { db } from '../../pages/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AwaitingConfirmationScreen = ({ route, navigation }) => {
  const { jobId } = route.params;
  const [status, setStatus] = useState('');
  
  // Use a Ref instead of State to track navigation
  // This prevents the useEffect from restarting when the value changes
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (!jobId) return;

    const unsubscribe = db
      .collection('partimeRequest')
      .doc(jobId)
      .onSnapshot(async (docSnap) => {
        console.log(`Listening to job ID: ${jobId}`);

        if (docSnap.exists) {
          const jobData = docSnap.data();
          setStatus(jobData.status);

          // Check the ref value
          if (jobData.status === 'confirmed' && !hasNavigatedRef.current) {
            // Set it to true immediately to block other snapshots
            hasNavigatedRef.current = true;
            
            Vibration.vibrate(1000);

            try {
              await AsyncStorage.setItem('jobdata', JSON.stringify(jobData));
              await AsyncStorage.setItem('jobId', jobId);

              // Use replace instead of navigate if you don't want them 
              // to be able to go back to the loading screen
              navigation.replace('hcurrentjob', { job: jobData });
            } catch (error) {
              console.error("Storage error:", error);
            }
          }
        }
      }, (error) => {
        console.error("Snapshot error:", error);
      });

    return () => unsubscribe(); 
  }, [jobId]); // Removed hasNavigated from dependencies

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#28a745" />
      <Text style={styles.text}>Waiting for client confirmation...</Text>
      {status ? <Text style={styles.statusSubText}>Current Status: {status}</Text> : null}
    </View>
  );
};



const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { marginTop: 20, fontSize: 18, color: '#555' },
});

export { AwaitingConfirmationScreen };
