import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Vibration } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AwaitingConfirmationScreen = ({ route, navigation }) => {
  const { jobId } = route.params;

  const [status, setStatus] = useState('');
  const [hasNavigated, setHasNavigated] = useState(false); // ✅ Prevent multiple navigations

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'partimeRequest', jobId), (docSnap) => {
      console.log(`Listening to job ID: ${jobId}`);
      if (docSnap.exists()) {
        const jobData = docSnap.data();
        setStatus(jobData.status);

        if (jobData.status === 'confirmed' && !hasNavigated) {
          Vibration.vibrate(1000);

          AsyncStorage.setItem('jobdata', JSON.stringify(jobData));
          AsyncStorage.setItem('jobId', jobId);

          setHasNavigated(true); // ✅ Stop future navigations/
          navigation.navigate('hcurrentjob', { job: jobData }); // Send jobData as param
        }
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [jobId, hasNavigated]); // include hasNavigated in deps

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#28a745" />
      <Text style={styles.text}>Waiting for client confirmation...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { marginTop: 20, fontSize: 18, color: '#555' },
});

export { AwaitingConfirmationScreen };
