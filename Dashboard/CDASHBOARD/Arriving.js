import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../pages/firebase';
import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import Loader from '../../component/Loader';
import { Card, InfoRow, Button, StatusPill } from '../../component/ui';
import { colors, space, radius, type } from '../../component/theme';

const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;

const Arriving = ({ navigation, route }) => {
  const { jobId } = route.params || {};
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let unsubscribe = null;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('requestdata');
        if (!raw) {
          setLoading(false);
          return;
        }
        const parsed = JSON.parse(raw);
        const activeId = parsed.id;
        if (!activeId) {
          setJobs([parsed]);
          setLoading(false);
          return;
        }
        // Live updates, so the screen flips to "confirmed" as soon as a househelp accepts.
        unsubscribe = db.collection('partimeRequest').doc(activeId).onSnapshot(
          (snap) => {
            if (snap.exists) setJobs([{ id: snap.id, ...snap.data() }]);
            else setJobs([{ id: activeId, ...parsed }]);
            setLoading(false);
            setRefreshing(false);
          },
          () => {
            setLoading(false);
            setRefreshing(false);
          }
        );
      } catch (e) {
        setLoading(false);
      }
    })();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [jobId]);

  const onRefresh = () => {
    setRefreshing(true);
    if (jobs[0]?.id) {
      db.collection('partimeRequest')
        .doc(jobs[0].id)
        .get()
        .then((snap) => {
          if (snap.exists) setJobs([{ id: snap.id, ...snap.data() }]);
          setRefreshing(false);
        })
        .catch(() => setRefreshing(false));
    } else {
      setRefreshing(false);
    }
  };

  const handleStartJob = async (targetId, job) => {
    try {
      const updatedData = { status: 'in-progress', startedAt: new Date() };
      setJobs((prev) => prev.map((j) => (j.id === targetId ? { ...j, ...updatedData } : j)));
      await db.collection('partimeRequest').doc(targetId).update(updatedData);
      Alert.alert('Success', 'Job started successfully!');
      navigation.navigate('cstartjob', { job });
    } catch (err) {
      Alert.alert('Error', 'Could not update the job. Try again.');
    }
  };

  const confirmStartJob = (targetId, job) => {
    Alert.alert(
      'Confirm arrival',
      'Has the househelp arrived at the location?',
      [
        { text: 'No, not yet', style: 'cancel' },
        { text: 'Yes, they arrived', onPress: () => handleStartJob(targetId, job) },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.root}>
      <Header2 />
      {loading ? (
        <View style={styles.loader}>
          <Loader />
          <Text style={styles.loaderText}>Loading your appointment…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        >
          <Text style={type.h1}>Househelp arrival</Text>
          <Text style={styles.sub}>Pull down to refresh the latest status.</Text>

          {jobs.length === 0 || !jobs[0] ? (
            <View style={styles.empty}>
              <Ionicons name="navigate-outline" size={34} color={colors.muted} />
              <Text style={styles.emptyText}>No active or confirmed bookings right now.</Text>
            </View>
          ) : (
            jobs.map((job) => (
              <View key={job.id || 'fallback-key'} style={{ marginTop: space.lg }}>
                <Card>
                  <View style={styles.titleRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.jobTitle}>{job.househelpName || 'Assigned househelp'}</Text>
                      <Text style={styles.muted}>Job {job.id}</Text>
                    </View>
                    <StatusPill status={job.status} />
                  </View>
                  <InfoRow label="Client" value={job.clientName} />
                  <InfoRow label="Phone" value={job.phone} />
                  <InfoRow label="Type" value={[job.requestType, job.apartmentType && `(${job.apartmentType})`].filter(Boolean).join(' ')} />
                  <InfoRow label="Address" value={job.address} />
                  <InfoRow label="Total cost" value={naira(job.totalCost)} last />
                </Card>

                {job.chores && job.chores.length ? (
                  <Card title="Chores" icon="list-outline">
                    {job.chores.map((c, i) => (
                      <InfoRow key={i} label={c.chore} value={naira(c.price)} last={i === job.chores.length - 1} />
                    ))}
                  </Card>
                ) : null}

                {job.househelpdata ? (
                  <Card title="Your househelp" icon="person-outline">
                    <View style={styles.profileRow}>
                      {job.househelpdata.url ? (
                        <Image source={{ uri: job.househelpdata.url }} style={styles.avatar} />
                      ) : (
                        <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]} />
                      )}
                      <View style={{ flex: 1 }}>
                        <InfoRow label="Phone" value={job.househelpdata.phonenumber} />
                        <InfoRow label="Experience" value={job.househelpdata.experience ? `${job.househelpdata.experience} years` : null} />
                        <InfoRow label="Gender" value={job.househelpdata.gender} last />
                      </View>
                    </View>
                  </Card>
                ) : null}

                {job.status === 'confirmed' ? (
                  <Button title="Confirm arrival and start" onPress={() => confirmStartJob(job.id, job)} />
                ) : null}
                {job.status === 'in-progress' ? (
                  <View style={styles.progress}>
                    <Ionicons name="flash" size={18} color={colors.primary} />
                    <Text style={styles.progressText}>Job in progress</Text>
                  </View>
                ) : null}
              </View>
            ))
          )}
        </ScrollView>
      )}
      <Cmenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 110 },
  sub: { color: colors.muted, marginTop: 2 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loaderText: { color: colors.muted, marginTop: space.lg },
  empty: { alignItems: 'center', padding: space.xl, gap: space.sm },
  emptyText: { color: colors.muted, textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  jobTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  muted: { color: colors.muted, fontSize: 12, marginTop: 2 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    padding: space.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  progressText: { color: colors.primary, fontWeight: '800' },
});

export { Arriving };
