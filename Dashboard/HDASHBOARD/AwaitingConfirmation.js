import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Vibration } from 'react-native';
import { db } from '../../pages/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake';
import { use } from 'react';

const AwaitingConfirmationScreen = ({ route, navigation }) => {
  useKeepAwake(); // Keep the screen on while this component is active
  const { jobId } = route.params;
  const [status, setStatus] = useState('');
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
          const currentStatus = jobData?.status || '';
          setStatus(currentStatus);

          if (currentStatus === 'confirmed' && !hasNavigatedRef.current) {
            hasNavigatedRef.current = true;
            Vibration.vibrate(1000);

            try {
              const fullJobPayload = { id: docSnap.id, ...jobData };
              await AsyncStorage.setItem('jobdata', JSON.stringify(fullJobPayload));
              await AsyncStorage.setItem('jobId', jobId);

              navigation.replace('hcurrentjob', { job: fullJobPayload });
            } catch (error) {
              console.error("Storage error:", error);
            }
          }
        }
      }, (error) => {
        console.error("Snapshot error:", error);
      });

    return () => unsubscribe(); 
  }, [jobId]);

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
  statusSubText: { marginTop: 10, fontSize: 14, color: '#888', fontWeight: '600' }
});

export { AwaitingConfirmationScreen };