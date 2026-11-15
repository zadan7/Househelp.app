import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../pages/firebase';
import { Hmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import Loader from '../../component/Loader';
import { Button, InfoRow } from '../../component/ui';
import { colors, space, radius, shadow, type } from '../../component/theme';

const Hfulltime = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [househelp, setHousehelp] = useState({});
  const [isloading, setisLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    const fetchHousehelpData = async () => {
      try {
        const househelpData = await AsyncStorage.getItem('househelpdata');
        const parsedHousehelp = househelpData ? JSON.parse(househelpData) : null;
        if (parsedHousehelp) {
          setHousehelp(parsedHousehelp);
          // Fixed: without an lga the job fetch never ran and the loader spun forever.
          if (!parsedHousehelp.lga) setisLoading(false);
        } else {
          setisLoading(false);
        }
      } catch (e) {
        setisLoading(false);
      }
    };
    fetchHousehelpData();
  }, []);

  // Single fetch routine (the screen used to carry two near-identical copies).
  const fetchFulltimeJobs = async (helper = househelp) => {
    setisLoading(true);
    try {
      const querySnapshot = await db.collection('fulltimeRequest').get();
      const jobList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const filteredJobs = jobList.filter((job) => {
        if (!helper || !helper.id) return true;
        const acceptedHelpersArray = Array.isArray(job.acceptedHelpers) ? job.acceptedHelpers : [];
        const alreadyApplied = acceptedHelpersArray.some((h) => h && h.id === helper.id);
        return !alreadyApplied;
      });

      setJobs(filteredJobs);
    } catch (error) {
      console.error('Error fetching full-time jobs: ', error);
    } finally {
      setisLoading(false);
    }
  };

  useEffect(() => {
    if (househelp.lga) {
      fetchFulltimeJobs(househelp);
    }
  }, [househelp.lga]);

  const applyJob = async (jobId) => {
    setAppliedJobs((prevState) => [...prevState, jobId]);

    try {
      await db.collection('fulltimeRequest').doc(jobId).update({
        status: 'applied',
        acceptedHelpers: firestore.FieldValue.arrayUnion(househelp),
      });
      fetchFulltimeJobs();
    } catch (error) {
      console.error('Error submitting job application: ', error);
      setAppliedJobs((prevState) => prevState.filter((id) => id !== jobId));
      Alert.alert('Error', 'Could not submit your application. Please try again.');
    }
  };

  const renderJobCard = ({ item }) => {
    const c = item.clientData || {};
    const applied = appliedJobs.includes(item.id);
    const chores = Array.isArray(item.chores) ? item.chores.join(', ') : item.chores;
    return (
      <View style={styles.jobCard}>
        <View style={styles.topRow}>
          {c.facepicture ? (
            <Image source={{ uri: c.facepicture }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarEmpty]}>
              <Ionicons name="person" size={26} color={colors.primary} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={type.h2} numberOfLines={1}>{item.requestType}</Text>
            <View style={styles.locRow}>
              <Ionicons name="location-outline" size={14} color={colors.muted} />
              <Text style={styles.meta} numberOfLines={1}>{[c.lga, c.state].filter(Boolean).join(', ')}</Text>
            </View>
          </View>
          <View style={styles.pricePill}>
            <Text style={styles.priceText}>₦{item.salary}</Text>
          </View>
        </View>

        <View>
          <InfoRow label="Apartment Size" value={c.apartmentsize} />
          <InfoRow label="Description" value={item.description} />
          <InfoRow label="Chores" value={chores} />
          <InfoRow label="Number of Kids" value={item.kidsnum} />
          <InfoRow label="Secondary Provision" value={item.secondaryProvision} />
          <InfoRow label="Address" value={c.address} last={!item.closingTime} />
          {item.closingTime ? (
            <>
              <InfoRow label="Resumption Time" value={item.resuptionTime} />
              <InfoRow label="Closing Time" value={item.closingTime} last />
            </>
          ) : null}
        </View>

        <Button
          title={applied ? 'Applied' : 'Apply'}
          onPress={() => applyJob(item.id)}
          disabled={applied}
        />
      </View>
    );
  };

  if (isloading) {
    return (
      <View style={styles.root}>
        <Loader />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Header2 />
      <FlatList
        contentContainerStyle={styles.content}
        data={jobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          jobs.length > 0 ? (
            <View style={{ marginBottom: space.lg }}>
              <Text style={type.h1}>Available Full-time Jobs</Text>
              <Text style={styles.meta}>Apply to live-in and live-out roles.</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="briefcase-outline" size={44} color={colors.muted} />
            <Text style={styles.empty}>No Available Full-time Jobs Yet</Text>
          </View>
        }
      />
      <Hmenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 110, flexGrow: 1 },
  jobCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: space.lg, marginBottom: space.lg, gap: space.md, ...shadow },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  avatarEmpty: { backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  meta: { color: colors.muted, fontSize: 13, flexShrink: 1 },
  pricePill: { backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  priceText: { color: colors.primary, fontWeight: '800', fontSize: 14 },
  emptyBox: { alignItems: 'center', marginTop: space.xxl, gap: space.sm },
  empty: { color: colors.muted, textAlign: 'center' },
});

export { Hfulltime };
