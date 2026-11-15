import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../pages/firebase';
import { Hmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, InfoRow } from '../../component/ui';
import { colors, space, radius, type } from '../../component/theme';

const TYPES = [
  { value: 'fulltime', label: 'Full-time Jobs' },
  { value: 'partime', label: 'Part-time Jobs' },
];

const statusStyle = (status) => {
  const s = String(status || '').toLowerCase();
  if (['rejected', 'declined', 'cancelled', 'canceled'].includes(s)) return { bg: colors.dangerSoft, fg: colors.danger };
  if (['confirmed', 'accepted', 'completed', 'in-progress', 'hired'].includes(s)) return { bg: colors.primarySoft, fg: colors.primary };
  return { bg: colors.accent, fg: colors.text };
};

const appliedBy = (job, househelp) =>
  (job.acceptedHelpers || []).some(
    (helper) => helper && (helper.id === househelp.id || helper.househelpId === househelp.id)
  );

const HappliedJobs = ({ navigation }) => {
  // Fixed: the picker used to start on '' so nothing was listed until the user changed it.
  const [selectedType, setSelectedType] = useState('fulltime');
  const [househelp, setHousehelp] = useState({});
  const [loading, setLoading] = useState(true);
  const [fulltimeJobs, setFulltimeJobs] = useState([]);
  const [partimeJobs, setPartimeJobs] = useState([]);

  useEffect(() => {
    const fetchHousehelpData = async () => {
      try {
        const househelpData = await AsyncStorage.getItem('househelpdata');
        const parsedHousehelp = househelpData ? JSON.parse(househelpData) : null;
        if (parsedHousehelp) setHousehelp(parsedHousehelp);
        else setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    };
    fetchHousehelpData();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const fulltimeSnapshot = await db.collection('fulltimeRequest').get();
        const partimeSnapshot = await db.collection('partimeRequest').get();

        const fulltimeList = fulltimeSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const partimeList = partimeSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        setFulltimeJobs(fulltimeList.filter((job) => appliedBy(job, househelp)));
        // Fixed: part-time applicants are stored with `househelpId`, not `id`, so none matched before.
        setPartimeJobs(partimeList.filter((job) => appliedBy(job, househelp)));
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (househelp.id) {
      fetchJobs();
    }
  }, [househelp]);

  const handlePickerChange = (value) => {
    setSelectedType(value);
  };

  const jobs = selectedType === 'fulltime' ? fulltimeJobs : selectedType === 'partime' ? partimeJobs : [];

  return (
    <View style={styles.root}>
      <Header2 />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={type.h1}>Applied Jobs</Text>

        <View style={styles.segment}>
          {TYPES.map((t) => {
            const on = selectedType === t.value;
            return (
              <TouchableOpacity
                key={t.value}
                onPress={() => handlePickerChange(t.value)}
                style={[styles.segBtn, on && styles.segBtnOn]}
                accessibilityState={{ selected: on }}
              >
                <Text style={[styles.segText, on && { color: colors.white }]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: space.xxl }} />
        ) : jobs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="document-text-outline" size={44} color={colors.muted} />
            <Text style={styles.empty}>No applied jobs found in this category.</Text>
          </View>
        ) : (
          jobs.map((job) => {
            const c = job.clientData || {};
            const st = statusStyle(job.status);
            const location = [c.state, c.lga, c.address].filter(Boolean).join(' ');
            const clientName = [c.firstname, c.lastname].filter(Boolean).join(' ');
            return (
              <Card key={job.id} style={{ marginBottom: 0, marginTop: space.lg }}>
                <View style={styles.topRow}>
                  {c.facepicture ? (
                    <Image source={{ uri: c.facepicture }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarEmpty]}>
                      <Ionicons name="person" size={26} color={colors.primary} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={type.h2} numberOfLines={1}>{job.requestType || 'Househelp Job'}</Text>
                    <Text style={styles.price}>₦{job.salary || job.totalCost || 'N/A'}</Text>
                  </View>
                  <View style={[styles.pill, { backgroundColor: st.bg }]}>
                    <Text style={[styles.pillText, { color: st.fg }]}>{job.status || 'pending'}</Text>
                  </View>
                </View>
                <View>
                  <InfoRow label="Location" value={location || 'N/A'} />
                  <InfoRow label="Date" value={job.date || 'N/A'} />
                  <InfoRow label="Time" value={job.time || 'N/A'} />
                  <InfoRow label="Client" value={clientName || 'N/A'} />
                  <InfoRow label="Phone" value={c.phone || 'N/A'} />
                  <InfoRow label="Email" value={c.email || 'N/A'} last />
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
      <Hmenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 110 },
  segment: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: radius.pill, padding: 4, marginTop: space.lg, borderWidth: 1, borderColor: colors.border },
  segBtn: { flex: 1, minHeight: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  segBtnOn: { backgroundColor: colors.primary },
  segText: { fontWeight: '700', color: colors.text, fontSize: 14 },
  emptyBox: { alignItems: 'center', marginTop: space.xxl, gap: space.sm },
  empty: { color: colors.muted, textAlign: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  avatarEmpty: { backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  price: { color: colors.primary, fontWeight: '800', marginTop: 2 },
  pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill },
  pillText: { fontSize: 12, fontWeight: '800', textTransform: 'capitalize' },
});

export { HappliedJobs };
