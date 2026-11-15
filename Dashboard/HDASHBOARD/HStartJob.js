import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../pages/firebase';
import { Hmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import { Card, InfoRow, Button, StatusPill } from '../../component/ui';
import { colors, space, radius, type, shadow } from '../../component/theme';

const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;

const Star = ({ filled, onPress, disabled }) => (
  <TouchableOpacity onPress={onPress} disabled={disabled} accessibilityLabel="Rate">
    <Ionicons name={filled ? 'star' : 'star-outline'} size={36} color={filled ? '#F5A524' : colors.border} />
  </TouchableOpacity>
);

const HStartJob = ({ navigation, route }) => {
  const { job } = route.params;
  const [jobData, setJobData] = useState(job);
  const [loading, setLoading] = useState(true);
  const [documentId, setDocumentId] = useState(job?.id || job?.jobid || null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fixed: this screen used to load whichever job id was last stored on the phone, so a househelp
  // who had applied to several jobs could be shown the wrong one. The job it was opened for wins;
  // the stored id is only a fallback.
  useEffect(() => {
    if (documentId) return;
    AsyncStorage.getItem('jobId')
      .then((id) => (id ? setDocumentId(id) : setLoading(false)))
      .catch(() => setLoading(false));
  }, [documentId]);

  useEffect(() => {
    if (!documentId) return;
    const unsubscribe = db
      .collection('partimeRequest')
      .doc(documentId)
      .onSnapshot(
        (snap) => {
          if (snap.exists) setJobData({ id: snap.id, ...snap.data() });
          setLoading(false);
        },
        () => setLoading(false)
      );
    return () => unsubscribe();
  }, [documentId]);

  const chores = Array.isArray(jobData?.chores) ? jobData.chores : [];
  const doneCount = chores.filter((c) => c.completed).length;
  const allDone = chores.length > 0 && doneCount === chores.length;
  const review = jobData?.househelpReview;

  // The old "Process Payment" button only showed a made-up "payment processed" message and the
  // rating was never saved. The review is now saved on the job.
  const submitReview = async () => {
    if (!documentId || rating < 1 || !comment.trim()) return;
    setSubmitting(true);
    try {
      await db
        .collection('partimeRequest')
        .doc(documentId)
        .update({ househelpReview: { rating, comment: comment.trim(), at: new Date().toISOString() } });
      Alert.alert('Thank you', 'Your review has been submitted.');
    } catch (e) {
      Alert.alert('Could not submit', 'Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <Header2 />
      {loading || !jobData ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.muted}>Loading job details…</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={type.h1}>Job in progress</Text>
          <Text style={styles.muted2}>Chores update here as the client marks them complete.</Text>

          <Card style={{ marginTop: space.lg }}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{jobData.clientName}</Text>
              <StatusPill status={jobData.status} />
            </View>
            <InfoRow label="Client" value={jobData.clientName} />
            <InfoRow label="Househelp" value={jobData.househelpName} last />
          </Card>

          <Card title={`Chores (${doneCount}/${chores.length})`} icon="checkbox-outline">
            <View style={styles.track}>
              <View style={[styles.bar, { width: `${chores.length ? (doneCount / chores.length) * 100 : 0}%` }]} />
            </View>
            {chores.map((c, i) => (
              <View key={i} style={[styles.chore, c.completed && styles.choreDone]}>
                <Ionicons
                  name={c.completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={c.completed ? colors.primary : colors.muted}
                />
                <Text style={[styles.choreText, c.completed && { color: colors.primary }]}>{c.chore}</Text>
                <Text style={styles.choreText}>{naira(c.price)}</Text>
              </View>
            ))}
          </Card>

          {allDone ? (
            <Card title="Review the client" icon="star-outline">
              {review ? (
                <>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} filled={n <= review.rating} disabled />
                    ))}
                  </View>
                  <Text style={styles.reviewText}>“{review.comment}”</Text>
                  <Text style={styles.muted2}>Review submitted. Thank you.</Text>
                </>
              ) : (
                <>
                  <Text style={styles.muted2}>How was your experience at this home?</Text>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} filled={n <= rating} onPress={() => setRating(n)} />
                    ))}
                  </View>
                  <TextInput
                    style={styles.comment}
                    placeholder="Leave a comment…"
                    placeholderTextColor="#9AABA2"
                    value={comment}
                    onChangeText={setComment}
                    multiline
                  />
                  <Button title="Submit review" onPress={submitReview} loading={submitting} disabled={rating < 1 || !comment.trim()} />
                </>
              )}
            </Card>
          ) : null}
        </ScrollView>
      )}
      <Hmenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 110 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: colors.muted, marginTop: space.sm },
  muted2: { color: colors.muted, marginTop: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, flex: 1 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' },
  bar: { height: 8, backgroundColor: colors.primary },
  chore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
  },
  choreDone: { backgroundColor: colors.primarySoft },
  choreText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: space.sm, marginVertical: space.sm },
  comment: {
    minHeight: 90,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    padding: space.md,
    textAlignVertical: 'top',
    color: colors.text,
    fontSize: 15,
  },
  reviewText: { fontSize: 15, fontStyle: 'italic', color: colors.text, textAlign: 'center' },
});

export { HStartJob };
