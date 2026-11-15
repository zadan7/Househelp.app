import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../pages/firebase';

import { Header2 } from '../../component/Header';
import { Cmenu } from '../../component/Menu';
import { Card, InfoRow, Button } from '../../component/ui';
import { colors, space, radius, type } from '../../component/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake';

const toMillis = (v) => (v?.toDate ? v.toDate().getTime() : Number(v || 0));
const formatDate = (v) => {
  const ms = toMillis(v);
  return ms ? new Date(ms).toLocaleString() : '—';
};

const RequestConfirmation = ({ navigation, route }) => {
  useKeepAwake(); // Keep the screen on while this component is active
  // route.params is an object (or undefined), never an id, so start empty until the stored client is read.
  const [clientId, setClientId] = useState(null);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [selectedHelpers, setSelectedHelpers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const user = await AsyncStorage.getItem('clientdata');
        const parsedUser = user ? JSON.parse(user) : null;
        if (parsedUser?.id) setClientId(parsedUser.id);
        else setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    };

    fetchClientId();
  }, []);

  useEffect(() => {
    if (!clientId) return;

    // Query only this client's requests instead of downloading the whole collection.
    const unsubscribe = db
      .collection('partimeRequest')
      .where('clientId', '==', clientId)
      .onSnapshot(
        (snapshot) => {
          const jobs = snapshot.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter(
              (job) =>
                job.clientId === clientId &&
                (job.status === 'pending' || job.status === 'accepted' || job.isjobcompleted === false)
            );
          jobs.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
          setPendingJobs(jobs);
          setLoading(false);
        },
        (error) => {
          console.error('Error loading requests:', error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [clientId]);

  const handleConfirm = async (jobId, job) => {
    const selectedHelper = selectedHelpers[jobId];
    if (!selectedHelper) {
      Alert.alert('Please select a househelp before confirming.');
      return;
    }

    try {
      // db is the compat Firestore instance; the old code mixed in modular doc()/updateDoc().
      await db.collection('partimeRequest').doc(jobId).update({
        househelpName: selectedHelper.househelpName,
        househelpId: selectedHelper.househelpId,
        househelpdata: selectedHelper.househelpdata,
        status: 'accepted',
        isjobcompleted: false,
      });

      Alert.alert('Job Confirmed', `You selected ${selectedHelper.name}.`);
      await AsyncStorage.setItem('jobId', jobId);
      await AsyncStorage.setItem('requestdata', JSON.stringify(job));
      navigation.navigate('cmappage', { jobId });
    } catch (error) {
      console.error('Error confirming job:', error);
      Alert.alert('Error', 'Failed to confirm job.');
    }
  };

  const handleConfirm2 = async (jobId, job) => {
    try {
      await AsyncStorage.setItem('jobId', jobId);
      await AsyncStorage.setItem('requestdata', JSON.stringify(job));
      navigation.navigate('cmappage', { jobId });
    } catch (error) {
      console.error('Error confirming job:', error);
      Alert.alert('Error', 'Failed to confirm job.');
    }
  };

  if (loading) {
    return (
      <View style={styles.root}>
        <Header2 />
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: space.xxl }} />
        <Cmenu navigation={navigation} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Header2 />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={type.h1}>Confirm Your Job Requests</Text>
        <Text style={styles.sub}>Requests waiting for you to continue.</Text>

        {pendingJobs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="clipboard-outline" size={48} color={colors.border} />
            <Text style={styles.empty}>No pending jobs found.</Text>
          </View>
        ) : (
          pendingJobs.map((job) => {
            const accepted = job.status === 'accepted';
            const chores = Array.isArray(job.chores) ? job.chores : [];
            return (
              <Card key={job.id}>
                <View style={styles.titleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={type.h2}>{job.clientName}'s Job Request</Text>
                    <Text style={type.small}>Part-time</Text>
                  </View>
                  <View style={[styles.pill, { backgroundColor: accepted ? colors.primarySoft : colors.accent }]}>
                    <Text style={[styles.pillText, { color: accepted ? colors.primaryDark : colors.text }]}>
                      {accepted ? 'Accepted' : 'Pending'}
                    </Text>
                  </View>
                </View>

                <View>
                  <InfoRow label="Location" value={job.address} />
                  <InfoRow label="Apartment type" value={job.apartmentType} />
                  <InfoRow label="Price" value={`₦${Number(job.totalCost || 0).toLocaleString()}`} />
                  <InfoRow label="Requested on" value={formatDate(job.createdAt)} last />
                </View>

                <Text style={type.label}>Chores</Text>
                {chores.map((chore, index) => (
                  <View key={index} style={styles.choreRow}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                    <Text style={styles.choreText}>{chore.chore}</Text>
                    <Text style={styles.chorePrice}>₦{chore.price}</Text>
                  </View>
                ))}

                <Button
                  title="Proceed With this pending Job"
                  onPress={() => handleConfirm2(job.id, job)}
                  disabled={!!selectedHelpers[job.id]}
                />
              </Card>
            );
          })
        )}
      </ScrollView>
      <Cmenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 110 },
  sub: { color: colors.muted, marginTop: space.xs, marginBottom: space.lg },
  emptyBox: { alignItems: 'center', marginTop: space.xxl, gap: space.sm },
  empty: { color: colors.muted, fontSize: 15 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  pill: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  pillText: { fontSize: 12, fontWeight: '700' },
  choreRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  choreText: { flex: 1, fontSize: 14, color: colors.text },
  chorePrice: { fontSize: 13, fontWeight: '600', color: colors.muted },
});

export { RequestConfirmation };
