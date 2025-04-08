import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import { Vibration } from 'react-native';

const AwaitingConfirmationScreen = ({ route, navigation }) => {
  const { jobId } = route.params; // jobId passed from previous screen

  const [status, setStatus] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'partimeRequest', jobId), (docSnap) => {
      if (docSnap.exists()) {
        const jobData = docSnap.data();
        setStatus(jobData.status);

        if (jobData.status === 'confirmed') {
          Vibration.vibrate(1000);
          navigation.replace('hcurrentjob'); // 🔁 Navigate to current job
        }
      }
    });

    return () => unsubscribe(); // Cleanup
  }, [jobId]);

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
