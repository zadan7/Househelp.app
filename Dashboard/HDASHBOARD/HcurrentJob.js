import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image, TouchableOpacity, Modal, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../pages/firebase';
import { Hmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import { Card, InfoRow, Button, StatusPill } from '../../component/ui';
import { colors, space, radius, type, shadow } from '../../component/theme';

const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;

const HcurrentJob = ({ route, navigation }) => {
  const jobdata = route.params?.job;
  const [confirmedJobs, setConfirmedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [househelpId, setHousehelpId] = useState('');
  const [foundJobId, setFoundJobId] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const hasNavigatedRef = useRef(false);

  const targetJobId = jobdata?.id || jobdata?.jobid || foundJobId;

  useEffect(() => {
    AsyncStorage.getItem('househelpdata')
      .then((raw) => raw && setHousehelpId(JSON.parse(raw).id))
      .catch(() => setLoading(false));
  }, []);

  // Fixed: opened from the dashboard there is no job passed in, and the old screen then spun
  // forever. In that case look for this househelp's confirmed or in-progress job.
  useEffect(() => {
    if (!househelpId || jobdata?.id || jobdata?.jobid) return;
    let alive = true;
    db.collection('partimeRequest')
      .where('status', 'in', ['confirmed', 'in-progress'])
      .get()
      .then((snap) => {
        if (!alive) return;
        const mine = snap.docs.find((d) => {
          const j = d.data();
          return (j.acceptedHelpers || []).some((h) => h.househelpId === househelpId) && (!j.househelpId || j.househelpId === househelpId);
        });
        if (mine) setFoundJobId(mine.id);
        else setLoading(false);
      })
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [househelpId, jobdata]);

  useEffect(() => {
    if (!househelpId || !targetJobId) return;
    const unsubscribe = db
      .collection('partimeRequest')
      .doc(targetJobId)
      .onSnapshot(
        (docSnap) => {
          if (!docSnap.exists) {
            setLoading(false);
            return;
          }
          const job = { id: docSnap.id, ...docSnap.data() };
          const isAccepted = job.acceptedHelpers?.some((h) => h.househelpId === househelpId);
          // Fixed: every househelp who had accepted saw the job as theirs once it was confirmed,
          // even when the client chose someone else. Jobs with a chosen househelp now only show
          // for that househelp.
          const isChosen = !job.househelpId || job.househelpId === househelpId;
          if (!isAccepted || !isChosen) {
            setConfirmedJobs([]);
            setLoading(false);
            return;
          }
          if (job.status === 'confirmed' || job.status === 'in-progress') {
            setConfirmedJobs([job]);
            if (job.clientId) getClientData(job.clientId);
            if (job.status === 'in-progress' && !hasNavigatedRef.current) {
              hasNavigatedRef.current = true;
              navigation.navigate('hstartjob', { job });
            }
          } else {
            setConfirmedJobs([]);
          }
          setLoading(false);
        },
        () => setLoading(false)
      );
    return () => unsubscribe();
  }, [househelpId, targetJobId]);

  const getClientData = async (clientId) => {
    try {
      const snap = await db.collection('clients').doc(clientId).get();
      if (snap.exists) {
        const { password, ...safe } = snap.data(); // never keep the client's password
        setClientData(safe);
      }
    } catch (e) {
      // The job details still show without the client's profile.
    }
  };

  const startJob = () => {
    if (!targetJobId) return;
    navigation.navigate('hstartjob', { job: jobdata || confirmedJobs[0] });
  };

  const callClient = () => clientData?.phone && Linking.openURL(`tel:${clientData.phone}`);
  const messageClient = () => clientData?.phone && Linking.openURL(`sms:${clientData.phone}`);

  return (
    <View style={styles.root}>
      <Header2 />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.muted}>Loading your job…</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={type.h1}>Current job</Text>
          <Text style={styles.sub}>Details of the job you were confirmed for.</Text>

          {confirmedJobs.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="briefcase-outline" size={34} color={colors.muted} />
              <Text style={styles.muted}>No confirmed job yet.</Text>
              <Button title="Find jobs" variant="secondary" onPress={() => navigation.navigate('hpartime')} style={{ alignSelf: 'stretch', marginTop: space.md }} />
            </View>
          ) : (
            confirmedJobs.map((job) => (
              <View key={job.id} style={{ marginTop: space.lg }}>
                <Card>
                  <View style={styles.titleRow}>
                    {clientData?.facepicture ? (
                      <TouchableOpacity onPress={() => setModalImage(clientData.facepicture)}>
                        <Image source={{ uri: clientData.facepicture }} style={styles.avatar} />
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]} />
                    )}
                    <View style={{ flex: 1, gap: 6 }}>
                      <Text style={styles.clientName}>{job.clientName}</Text>
                      <StatusPill status={job.status} />
                    </View>
                  </View>
                  <InfoRow label="Phone" value={job.phone} />
                  <InfoRow label="Address" value={job.address} />
                  <InfoRow label="Apartment" value={job.apartmentType} />
                  <InfoRow label="Start date" value={job.startDate} />
                  <InfoRow label="Pay" value={naira(job.totalCost)} />
                  <InfoRow label="Job ID" value={job.id} last />
                </Card>

                {job.chores?.length ? (
                  <Card title="Chores" icon="list-outline">
                    {job.chores.map((c, i) => (
                      <InfoRow key={i} label={`${c.chore}${c.completed ? ' ✓' : ''}`} value={naira(c.price)} last={i === job.chores.length - 1} />
                    ))}
                  </Card>
                ) : null}

                {clientData ? (
                  <Card title="Client" icon="person-outline">
                    <InfoRow label="Email" value={clientData.email} last />
                    <View style={styles.actions}>
                      <Button title="Call" onPress={callClient} style={{ flex: 1 }} />
                      <Button title="Message" variant="secondary" onPress={messageClient} style={{ flex: 1 }} />
                    </View>
                    {clientData.insideview || clientData.frontview ? (
                      <View style={styles.photos}>
                        {clientData.insideview ? (
                          <Pressable onPress={() => setModalImage(clientData.insideview)} style={{ flex: 1 }}>
                            <Image source={{ uri: clientData.insideview }} style={styles.photo} />
                            <Text style={styles.photoLabel}>Inside</Text>
                          </Pressable>
                        ) : null}
                        {clientData.frontview ? (
                          <Pressable onPress={() => setModalImage(clientData.frontview)} style={{ flex: 1 }}>
                            <Image source={{ uri: clientData.frontview }} style={styles.photo} />
                            <Text style={styles.photoLabel}>Front</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    ) : null}
                  </Card>
                ) : null}

                {job.status === 'confirmed' ? <Button title="Start job" onPress={startJob} /> : null}
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={!!modalImage} transparent animationType="fade" onRequestClose={() => setModalImage(null)}>
        <TouchableOpacity style={styles.modal} activeOpacity={1} onPress={() => setModalImage(null)}>
          {modalImage ? <Image source={{ uri: modalImage }} style={styles.modalImage} resizeMode="contain" /> : null}
          <Text style={styles.modalHint}>Tap anywhere to close</Text>
        </TouchableOpacity>
      </Modal>
      <Hmenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 110 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: colors.muted, marginTop: space.sm, textAlign: 'center' },
  sub: { color: colors.muted, marginTop: 2 },
  empty: { alignItems: 'center', padding: space.xl, marginTop: space.lg, backgroundColor: colors.white, borderRadius: radius.lg, ...shadow },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  clientName: { fontSize: 18, fontWeight: '800', color: colors.text },
  actions: { flexDirection: 'row', gap: space.md },
  photos: { flexDirection: 'row', gap: space.md },
  photo: { width: '100%', height: 110, borderRadius: radius.md, backgroundColor: colors.border },
  photoLabel: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 4 },
  modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' },
  modalImage: { width: '94%', height: '80%' },
  modalHint: { color: 'rgba(255,255,255,0.7)', marginTop: space.md },
});

export { HcurrentJob };
