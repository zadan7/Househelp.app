import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Vibration } from 'react-native';
// import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AwaitingConfirmationScreen = ({ route, navigation }) => {
  const { jobId } = route.params;

  const [status, setStatus] = useState('');
  const [hasNavigated, setHasNavigated] = useState(false); // ✅ Prevent multiple navigations

useEffect(() => {
  const unsubscribe = db
    .collection('partimeRequest')
    .doc(jobId)
    .onSnapshot(async (docSnap) => {
      console.log(`Listening to job ID: ${jobId}`);

      if (docSnap.exists) {
        const jobData = docSnap.data();
        setStatus(jobData.status);

        if (jobData.status === 'confirmed' && !hasNavigated) {
          Vibration.vibrate(1000);

          await AsyncStorage.setItem('jobdata', JSON.stringify(jobData));
          await AsyncStorage.setItem('jobId', jobId);

          setHasNavigated(true); // stop future navigation

          navigation.navigate('hcurrentjob', { job: jobData });
        }
      }
    });

  return () => unsubscribe(); // cleanup
}, [jobId, hasNavigated]);
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
