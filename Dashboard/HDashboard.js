import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Hmenu } from '../component/Menu';
import { Hero, Tile } from '../component/ui';
import { Footer } from '../component/Footer';
import { colors, space, type } from '../component/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Fixed routes: "HcurrentJob" is registered as 'hcurrentjob' (case matters); the "Weekly Jobs"
// and "Settings" tiles pointed at routes that do not exist, so they are replaced with
// "Applied jobs" (which does exist).
const TILES = [
  { title: 'Current job', subtitle: 'The job you are on', icon: 'briefcase-outline', screen: 'hcurrentjob' },
  { title: 'Part-time', subtitle: 'Open part-time requests', icon: 'time-outline', screen: 'hpartime' },
  { title: 'Full-time', subtitle: 'Open full-time requests', icon: 'business-outline', screen: 'hfulltime' },
  { title: 'Applied jobs', subtitle: 'Jobs you applied for', icon: 'calendar-outline', screen: 'happliedjobs' },
  { title: 'Wallet', subtitle: 'Earnings and payouts', icon: 'wallet-outline', screen: 'hwallet' },
  { title: 'Profile', subtitle: 'Your details', icon: 'person-outline', screen: 'hprofile' },
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const HousehelpDashboard = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(null);

  // The old version called JSON.parse on an un-awaited promise (so the name never loaded) and
  // downloaded every job and every client without using them. Both removed.
  useEffect(() => {
    AsyncStorage.getItem('househelpdata')
      .then((raw) => raw && setUser(JSON.parse(raw)))
      .catch(() => {});
  }, []);

  const firstName = (user?.name || user?.firstname || 'there').split(' ')[0];

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ paddingTop: insets.top, backgroundColor: colors.primary }}>
          <Hero
            greeting={greeting()}
            name={firstName}
            photo={user?.url || user?.uri || user?.facepicture}
            role="Househelp"
          />
        </View>

        <View style={styles.body}>
          <Text style={[type.h2, { marginBottom: space.md }]}>Find and manage work</Text>
          <View style={styles.grid}>
            {TILES.map((t) => (
              <Tile
                key={t.title}
                title={t.title}
                subtitle={t.subtitle}
                icon={t.icon}
                onPress={() => navigation.navigate(t.screen)}
              />
            ))}
          </View>
        </View>
        <Footer />
      </ScrollView>
      <Hmenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { padding: space.lg, marginTop: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});

export { HousehelpDashboard };
