import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cmenu } from '../component/Menu';
import { Hero, Tile } from '../component/ui';
import { Footer } from '../component/Footer';
import { colors, space, type } from '../component/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// "Favorites" and "Help Center" pointed at screens that are not registered in App.js, so
// tapping them did nothing. They are kept as "Soon" tiles instead of dead buttons.
const TILES = [
  { title: 'Make request', subtitle: 'Book a part-time househelp', icon: 'create-outline', screen: 'cmakerequest' },
  { title: 'Full-time', subtitle: 'Live-in or live-out help', icon: 'business-outline', screen: 'cfulltimeselection' },
  { title: 'Pending jobs', subtitle: 'Requests awaiting a reply', icon: 'hourglass-outline', screen: 'requestconfirmation' },
  { title: 'Arriving', subtitle: 'Track your househelp', icon: 'navigate-outline', screen: 'arriving' },
  { title: 'Job history', subtitle: 'Completed jobs', icon: 'document-text-outline', screen: 'ccompletedjobs' },
  { title: 'Balances', subtitle: 'Wallet and payments', icon: 'wallet-outline', screen: 'cwallet' },
  { title: 'Profile', subtitle: 'Your details', icon: 'person-circle-outline', screen: 'cprofile' },
  { title: 'Refer & earn', subtitle: 'Invite friends', icon: 'gift-outline', screen: 'referandearn' },
  { title: 'Settings', subtitle: 'Account preferences', icon: 'settings-outline', screen: 'csettings' },
  { title: 'Favorites', subtitle: 'Saved househelps', icon: 'heart-outline', soon: true },
  { title: 'Help center', subtitle: 'Get support', icon: 'help-circle-outline', soon: true },
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const ClientDashboard = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('clientdata')
      .then((raw) => raw && setUser(JSON.parse(raw)))
      .catch(() => {});
  }, []);

  const open = (t) => {
    if (t.soon) {
      Alert.alert('Coming soon', `${t.title} is not available yet.`);
      return;
    }
    navigation.navigate(t.screen);
  };

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ paddingTop: insets.top, backgroundColor: colors.primary }}>
          <Hero
            greeting={greeting()}
            name={user?.firstname || 'Client'}
            photo={user?.facepicture}
            role="Client"
          />
        </View>

        <View style={styles.body}>
          <Text style={[type.h2, { marginBottom: space.md }]}>What would you like to do?</Text>
          <View style={styles.grid}>
            {TILES.map((t) => (
              <Tile
                key={t.title}
                title={t.title}
                subtitle={t.subtitle}
                icon={t.icon}
                badge={t.soon ? 'Soon' : undefined}
                onPress={() => open(t)}
              />
            ))}
          </View>
        </View>
        <Footer />
      </ScrollView>
      <Cmenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { padding: space.lg, marginTop: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});

export { ClientDashboard };
