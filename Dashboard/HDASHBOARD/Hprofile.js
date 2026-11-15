import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Hmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import { Card, InfoRow } from '../../component/ui';
import { colors, space, radius, type, shadow } from '../../component/theme';
import { db } from '../../pages/firebase';

const Hprofile = ({ navigation }) => {
  const [househelp, setHousehelp] = useState(null);
  const [guarantor, setGuarantor] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('househelpdata')
      .then((raw) => raw && setHousehelp(JSON.parse(raw)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // The old version downloaded EVERY guarantor (including NIN numbers) to this phone and
  // filtered locally. This asks the database for only the guarantor with this househelp's code.
  useEffect(() => {
    if (!househelp?.code) return;
    let alive = true;
    db.collection('guarantors')
      .where('code', '==', househelp.code)
      .limit(1)
      .get()
      .then((snap) => {
        if (alive && !snap.empty) setGuarantor({ id: snap.docs[0].id, ...snap.docs[0].data() });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [househelp]);

  const jobs = Array.isArray(househelp?.selectedJobs) ? househelp.selectedJobs.join(', ') : househelp?.selectedJobs;

  return (
    <View style={styles.root}>
      <Header2 />
      {!loaded ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.xxl }} />
      ) : !househelp ? (
        <Text style={styles.empty}>We could not load your profile. Please log in again.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.top}>
            {househelp.url ? (
              <Image source={{ uri: househelp.url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]} />
            )}
            <Text style={styles.name}>{househelp.name}</Text>
            <Text style={styles.sub}>{househelp.email}</Text>
          </View>

          <Card title="About you" icon="person-outline">
            <InfoRow label="Phone" value={househelp.phonenumber} />
            <InfoRow label="Gender" value={househelp.gender} />
            <InfoRow label="Date of birth" value={househelp.dateOfBirth} />
            <InfoRow label="Address" value={househelp.address} />
            <InfoRow label="LGA" value={househelp.lga} />
            <InfoRow label="State" value={househelp.state} last />
          </Card>

          <Card title="Work" icon="briefcase-outline">
            <InfoRow label="Employment type" value={househelp.employmentType} />
            <InfoRow label="Experience" value={househelp.experience ? `${househelp.experience} years` : null} />
            <InfoRow label="Jobs" value={jobs} />
            <InfoRow label="Your code" value={househelp.code} last />
          </Card>

          <Card title="Guarantor" icon="shield-checkmark-outline">
            {guarantor ? (
              <>
                <View style={styles.gRow}>
                  {guarantor.facePicture ? <Image source={{ uri: guarantor.facePicture }} style={styles.gAvatar} /> : null}
                  <View style={{ flex: 1 }}>
                    <Text style={type.h2}>{[guarantor.firstName, guarantor.lastName].filter(Boolean).join(' ')}</Text>
                    <Text style={styles.sub}>{guarantor.relationship}</Text>
                  </View>
                </View>
                <InfoRow label="Phone" value={guarantor.phone} />
                <InfoRow label="Email" value={guarantor.email} />
                <InfoRow label="Occupation" value={guarantor.occupation} />
                <InfoRow label="Address" value={guarantor.address} />
                <InfoRow label="Company" value={guarantor.companyName} last />
              </>
            ) : (
              <Text style={styles.sub}>No guarantor on file yet.</Text>
            )}
          </Card>
        </ScrollView>
      )}
      <Hmenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 110 },
  empty: { textAlign: 'center', color: colors.muted, margin: space.xl },
  top: { alignItems: 'center', paddingVertical: space.lg },
  avatar: { width: 104, height: 104, borderRadius: 52, borderWidth: 4, borderColor: colors.white, ...shadow },
  name: { ...type.h1, marginTop: space.md },
  sub: { color: colors.muted, marginTop: 2 },
  gRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  gAvatar: { width: 52, height: 52, borderRadius: 26 },
});

export { Hprofile };
