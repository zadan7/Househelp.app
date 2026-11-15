import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { db } from '../../pages/firebase';
import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import { Card, InfoRow, Button } from '../../component/ui';
import { colors, space, radius, type, shadow } from '../../component/theme';

const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;

const CcompletedJobs = ({ navigation }) => {
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchCompletedJobs = async () => {
      try {
        const clientData = await AsyncStorage.getItem('clientdata');
        const parsedClient = clientData ? JSON.parse(clientData) : null;
        const clientId = parsedClient?.id;
        if (!clientId) return; // where('clientId', '==', undefined) would throw

        const snapshot = await db
          .collection('partimeRequest')
          .where('isjobcompleted', '==', true)
          .where('clientId', '==', clientId)
          .get();
        const jobs = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((job) => job.status === 'completed' && job.clientId === clientId);

        setCompletedJobs(jobs);
      } catch (error) {
        console.error('Error fetching completed jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedJobs();
  }, []);

  const openModal = (job) => {
    setSelectedJob(job);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedJob(null);
  };

  return (
    <View style={styles.root}>
      <Header2 />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: space.xxl }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={type.h1}>Completed Jobs</Text>
          <Text style={styles.sub}>Your finished househelp bookings.</Text>

          {completedJobs.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="checkmark-done-circle-outline" size={52} color={colors.border} />
              <Text style={styles.empty}>No completed jobs yet.</Text>
            </View>
          ) : (
            completedJobs.map((job) => (
              <TouchableOpacity key={job.id} style={styles.jobCard} activeOpacity={0.85} onPress={() => openModal(job)}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle} numberOfLines={1}>{job.househelpName || 'Househelp'}</Text>
                  <Text style={styles.meta}>
                    <Ionicons name="location-outline" size={12} color={colors.muted} /> {job.location?.lga || '—'}
                  </Text>
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>Completed</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: space.xs }}>
                  <Text style={styles.amount}>{naira(job.totalCost)}</Text>
                  <Text style={styles.link}>View Details</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[type.h2, { marginBottom: space.md }]}>Job Details</Text>

              {selectedJob && (
                <>
                  <InfoRow label="Househelp" value={selectedJob.househelpName} />
                  <InfoRow label="Phone" value={selectedJob.phone} />
                  <InfoRow label="Apartment" value={selectedJob.apartmentType} />
                  <InfoRow label="Location" value={selectedJob.location?.lga} />
                  <InfoRow label="Cost" value={naira(selectedJob.totalCost)} last />
                  <Text style={[type.label, { marginTop: space.md, marginBottom: space.sm }]}>Chores</Text>
                  {selectedJob.chores?.map((chore, index) => (
                    <View key={index} style={styles.choreRow}>
                      <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                      <Text style={styles.choreText}>{chore.chore}</Text>
                      <Text style={styles.chorePrice}>{naira(chore.price)}</Text>
                    </View>
                  ))}
                </>
              )}

              <Button title="Close" variant="secondary" onPress={closeModal} style={{ marginTop: space.lg }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.md,
    ...shadow,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.muted, marginTop: 2 },
  pill: {
    alignSelf: 'flex-start',
    marginTop: space.xs,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  pillText: { fontSize: 11, fontWeight: '700', color: colors.primaryDark },
  amount: { fontSize: 16, fontWeight: '800', color: colors.primary },
  link: { fontSize: 12, fontWeight: '600', color: colors.muted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: space.lg },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.xl,
    maxHeight: '80%',
  },
  choreRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.sm },
  choreText: { flex: 1, fontSize: 14, color: colors.text },
  chorePrice: { fontSize: 13, fontWeight: '600', color: colors.muted },
});

export { CcompletedJobs };
