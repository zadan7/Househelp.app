import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, Vibration, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../pages/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Hmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import firestore from '@react-native-firebase/firestore';
import { Card, Button, InfoRow } from '../../component/ui';
import { colors, space, radius, type } from '../../component/theme';

const toMillis = (v) => (v?.toDate ? v.toDate().getTime() : Number(v || 0));
const fmtDate = (v) => {
  const ms = toMillis(v);
  if (!ms) return '—';
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;

const HPartimeRequest = ({ navigation }) => {
  const [jobRequests, setJobRequests] = useState([]);
  const [househelpName, setHousehelpName] = useState('');
  const [househelpId, setHousehelpId] = useState('');
  const [househelpdata, setHousehelpdata] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeJobId, setActiveJobId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [feedLoading, setFeedLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = null;

    const initializeJobListener = async () => {
      try {
        const user = await AsyncStorage.getItem('househelpdata');
        if (!user) {
          Alert.alert('Error', 'Househelp data not found.');
          setFeedLoading(false);
          return;
        }

        const parsedUser = JSON.parse(user);
        const currentHelperId = parsedUser.id;

        setHousehelpId(currentHelperId);
        setHousehelpdata(parsedUser);
        setHousehelpName(parsedUser.name);

        if (!currentHelperId) {
          console.warn('Resolved user object is missing an ID parameter.');
          setFeedLoading(false);
          return;
        }

        unsubscribe = db.collection('partimeRequest').onSnapshot(
          (snapshot) => {
            const jobs = snapshot.docs.map((doc) => ({ id2: doc.id, ...doc.data() }));

            const pendingJobs = jobs.filter((job) => {
              const isCompleted = job.isjobcompleted === true;
              const isAccepted = job.status === 'accepted';
              const alreadyApplied = (job.acceptedHelpers || []).some(
                (helper) => helper && helper.househelpId === currentHelperId
              );
              return !isCompleted && !isAccepted && !alreadyApplied;
            });

            pendingJobs.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

            setJobRequests(pendingJobs);
            setFeedLoading(false);

            if (pendingJobs.length > 0) {
              Vibration.vibrate(500);
            }
          },
          (error) => {
            console.error('Live feed subscription crash: ', error);
            setFeedLoading(false);
          }
        );
      } catch (error) {
        console.error('Error setting up feed parameters:', error);
        setFeedLoading(false);
        Alert.alert('Error', 'Failed to fetch layout updates.');
      }
    };

    initializeJobListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleAcceptJob = async (jobId) => {
    if (!househelpName) {
      Alert.alert('Error', 'Househelp name is not set.');
      return;
    }

    setIsLoading(true);
    setActiveJobId(jobId);

    try {
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
      setActiveJobId(null);
    }
  };

  // Fixed: the old refresh attached a second, never-unsubscribed listener (and a different
  // filter) on every pull. The main listener is already live, so just show the indicator.
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <View style={styles.root}>
      <Header2 />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        <Text style={type.h1}>Available Jobs</Text>
        <Text style={styles.sub}>Part-time requests near you. Pull down to refresh.</Text>

        {feedLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: space.xxl }} />
        ) : jobRequests.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="briefcase-outline" size={44} color={colors.muted} />
            <Text style={styles.empty}>No job requests available.</Text>
          </View>
        ) : (
          jobRequests.map((job) => (
            <Card key={job.id2} style={{ marginTop: space.lg, marginBottom: 0 }}>
              <View style={styles.topRow}>
                <View style={{ flex: 1 }}>
                  <Text style={type.h2} numberOfLines={1}>{job.clientName}</Text>
                  <Text style={styles.sub}>{fmtDate(job.createdAt)}</Text>
                </View>
                <View style={styles.pricePill}>
                  <Text style={styles.priceText}>{naira(job.totalCost)}</Text>
                </View>
              </View>

              <View>
                <InfoRow label="Apartment" value={job.apartmentType} />
                <InfoRow label="Address" value={job.address} />
                <InfoRow label="Phone" value={job.phone} />
                <InfoRow label="Job ID" value={job.id} last />
              </View>

              <Text style={type.label}>Chores</Text>
              <View style={styles.choreWrap}>
                {(job.chores || []).map((chore, index) => (
                  <View key={index} style={styles.choreChip}>
                    <Text style={styles.choreText}>{chore.chore}</Text>
                  </View>
                ))}
              </View>

              <Button
                title="Accept Job"
                onPress={() => handleAcceptJob(job.id2)}
                disabled={isLoading}
                loading={isLoading && activeJobId === job.id2}
              />
            </Card>
          ))
        )}
      </ScrollView>
      <Hmenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 110 },
  sub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  emptyBox: { alignItems: 'center', marginTop: space.xxl, gap: space.sm },
  empty: { color: colors.muted, textAlign: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  pricePill: { backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  priceText: { color: colors.primary, fontWeight: '800', fontSize: 15 },
  choreWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  choreChip: { backgroundColor: colors.bg, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
  choreText: { fontSize: 13, color: colors.text, fontWeight: '600' },
});

export { HPartimeRequest };
