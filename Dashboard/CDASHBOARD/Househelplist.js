import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Image, Linking, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../pages/firebase';
import NigerianStateAndLGASelector from '../../component/NigerianStateAndLGASelector';
import { Header2 } from '../../component/Header';
import { Cmenu } from '../../component/Menu';
import { Card, InfoRow, Button } from '../../component/ui';
import { colors, space, radius, type, shadow } from '../../component/theme';

// Turns the stored jobs value (array or JSON string) into readable text.
const jobsText = (jobsData, empty = 'None specified') => {
  if (!jobsData) return empty;
  try {
    const parsed = typeof jobsData === 'string' ? JSON.parse(jobsData) : jobsData;
    return Array.isArray(parsed) ? parsed.join(', ') : String(parsed);
  } catch (e) {
    return String(jobsData);
  }
};

const callNumber = (n) => n && Linking.openURL(`tel:${n}`);

function HousehelpList({ navigation }) {
  const [househelps, setHousehelps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState('');
  const [lgaFilter, setLgaFilter] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const snap = await db.collection('househelps').get();
        // Never keep other people's passwords in memory or pass them between screens.
        setHousehelps(
          snap.docs.map((d) => {
            const { password, ...safe } = d.data();
            return safe;
          })
        );
      } catch (e) {
        // Leave the list empty; the empty state explains it.
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fixed: the old filter ran inside two change handlers that each used the other's stale
  // value, so choosing a state could filter by the previously selected state. Filtering is now
  // derived from the current selection. With nothing selected, everyone is shown (as before).
  const filtered = useMemo(
    () =>
      househelps.filter((h) => {
        const okState = !stateFilter || (h.state || '').toLowerCase() === stateFilter.toLowerCase();
        const okLga = !lgaFilter || (h.lga || '').toLowerCase().includes(lgaFilter.toLowerCase());
        return okState && okLga;
      }),
    [househelps, stateFilter, lgaFilter]
  );

  return (
    <View style={styles.root}>
      <Header2 />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={type.h1}>Househelps</Text>
        <Text style={styles.sub}>Browse househelps near you.</Text>

        <Card title="Filter by area" icon="filter-outline" style={{ marginTop: space.lg }}>
          <NigerianStateAndLGASelector onStateChange={setStateFilter} onLGAChange={setLgaFilter} />
        </Card>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: space.xl }} />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={32} color={colors.muted} />
            <Text style={styles.emptyText}>No househelps found for the selected area.</Text>
          </View>
        ) : (
          filtered.map((h, i) => (
            <TouchableOpacity
              key={h.email || i}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('HousehelpDetail', { househelp: h })}
            >
              {h.url ? (
                <Image source={{ uri: h.url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarEmpty]}>
                  <Ionicons name="person" size={30} color={colors.primary} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>{h.name}</Text>
                <Text style={styles.meta} numberOfLines={1}>
                  <Ionicons name="location-outline" size={12} color={colors.muted} /> {[h.address, h.state].filter(Boolean).join(', ')}
                </Text>
                <Text style={styles.meta} numberOfLines={2}>
                  <Ionicons name="construct-outline" size={12} color={colors.muted} /> {jobsText(h.selectedJobs)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => callNumber(h.phonenumber)} style={styles.callBtn} accessibilityLabel={`Call ${h.name}`}>
                <Ionicons name="call" size={18} color={colors.white} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <Cmenu navigation={navigation} />
    </View>
  );
}

function HousehelpDetail({ route, navigation }) {
  const { househelp } = route.params;
  // The old screen showed a made-up 3.2-star rating for everyone. Ratings are only shown now
  // when a real `rating` value is stored on the househelp.
  const rating = typeof househelp.rating === 'number' ? househelp.rating : null;
  const registered = househelp.createdAt?.toDate ? househelp.createdAt.toDate().toDateString() : 'N/A';

  return (
    <View style={styles.root}>
      <Header2 />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          {househelp.url ? (
            <Image source={{ uri: househelp.url }} style={styles.bigAvatar} />
          ) : (
            <View style={[styles.bigAvatar, styles.avatarEmpty]}>
              <Ionicons name="person" size={48} color={colors.primary} />
            </View>
          )}
          <Text style={[type.h1, { marginTop: space.md }]}>{househelp.name}</Text>
          <Text style={styles.sub}>{[househelp.employmentType, househelp.gender].filter(Boolean).join(' · ')}</Text>
          {rating !== null ? (
            <Text style={styles.rating}>
              {'★'.repeat(Math.round(rating))}
              <Text style={styles.ratingNum}> ({rating.toFixed(1)})</Text>
            </Text>
          ) : null}
        </View>

        <Card title="Personal info" icon="person-outline">
          <InfoRow label="Email" value={househelp.email} />
          <InfoRow label="Phone" value={househelp.phonenumber} />
          <InfoRow label="Date of birth" value={househelp.dateOfBirth} />
          <InfoRow label="Code" value={househelp.code} />
          <InfoRow label="Address" value={[househelp.address, househelp.lga, househelp.state].filter(Boolean).join(', ')} last />
        </Card>

        <Card title="Work details" icon="briefcase-outline">
          <InfoRow label="Jobs" value={jobsText(househelp.selectedJobs, 'None')} />
          <InfoRow label="Experience" value={househelp.experience ? `${househelp.experience} years` : null} />
          <InfoRow label="Registered" value={registered} last />
        </Card>

        {/* The old screen printed the househelp's exact GPS coordinates to every client. It now
            shows the area only. */}
        <Card title="Area" icon="location-outline">
          <InfoRow label="LGA" value={househelp.lga} />
          <InfoRow label="State" value={househelp.state} last />
        </Card>

        <Button title={`Call ${househelp.name || 'househelp'}`} onPress={() => callNumber(househelp.phonenumber)} />
      </ScrollView>
      <Cmenu navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 110 },
  sub: { color: colors.muted, marginTop: 2 },
  empty: { alignItems: 'center', padding: space.xl, gap: space.sm },
  emptyText: { color: colors.muted, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.md,
    marginBottom: space.md,
    ...shadow,
  },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarEmpty: { backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { fontSize: 12, color: colors.muted, marginTop: 3 },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  top: { alignItems: 'center', paddingVertical: space.lg },
  bigAvatar: { width: 112, height: 112, borderRadius: 56, borderWidth: 4, borderColor: colors.white, ...shadow },
  rating: { color: colors.accent, fontSize: 18, marginTop: space.sm },
  ratingNum: { color: colors.muted, fontSize: 13 },
});

export { HousehelpList, HousehelpDetail };
