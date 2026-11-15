import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../pages/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake';
import { Header2 } from '../../component/Header';
import { Hmenu } from '../../component/Menu';
import { colors, space, radius, shadow, type } from '../../component/theme';

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
              console.error('Storage error:', error);
            }
          }
        }
      }, (error) => {
        console.error('Snapshot error:', error);
      });

    return () => unsubscribe();
  }, [jobId]);

  return (
    <View style={styles.root}>
      <Header2 />
      <View style={styles.center}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="hourglass-outline" size={34} color={colors.primary} />
          </View>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[type.h2, { textAlign: 'center' }]}>Waiting for client confirmation...</Text>
          <Text style={styles.hint}>Keep this screen open. We will take you to the job as soon as the client confirms.</Text>
          {status ? (
            <View style={styles.pill}>
              <Text style={styles.pillText}>Current Status: {status}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Hmenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', padding: space.lg },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: space.xl, alignItems: 'center', gap: space.lg, ...shadow },
  iconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  hint: { color: colors.muted, textAlign: 'center', fontSize: 14 },
  pill: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6 },
  pillText: { color: colors.text, fontWeight: '700', fontSize: 12 },
});

export { AwaitingConfirmationScreen };
