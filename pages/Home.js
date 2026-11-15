import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Button } from '../component/ui';
import { Footer } from '../component/Footer';
import { colors, space, radius, type, shadow } from '../component/theme';
import logo from '../assets/Househelp.png';

const STEPS = [
  { icon: 'create-outline', title: 'Post a request', text: 'Tell us what help you need and when.' },
  { icon: 'people-outline', title: 'Pick a househelp', text: 'Choose from nearby, verified househelps.' },
  { icon: 'navigate-outline', title: 'Track the job', text: 'Follow your househelp as they arrive and work.' },
];

function Home({ navigation }) {
  const [checking, setChecking] = useState(true);

  // Same session logic as before: send returning users straight to their dashboard.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const hasHousehelp = keys.includes('househelpdata');
        const hasClient = keys.includes('clientdata');

        if (hasHousehelp && hasClient) {
          await AsyncStorage.clear();
          navigation.reset({ index: 0, routes: [{ name: 'login' }] });
          return;
        }
        if (hasHousehelp) {
          navigation.reset({ index: 0, routes: [{ name: 'hdashboard' }] });
          return;
        }
        if (hasClient) {
          navigation.reset({ index: 0, routes: [{ name: 'cdashboard' }] });
          return;
        }
      } catch (e) {
        // Fall through and show the welcome screen.
      }
      if (alive) setChecking(false);
    })();
    return () => {
      alive = false;
    };
  }, [navigation]);

  if (checking) {
    return (
      <Screen scroll={false}>
        <View style={styles.splash}>
          <Image source={logo} style={styles.logoLarge} resizeMode="contain" />
          <ActivityIndicator color={colors.primary} style={{ marginTop: space.lg }} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.logoWrap}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.brand}>HOUSEHELP</Text>
        <Text style={styles.headline}>Trusted help for your home</Text>
        <Text style={styles.sub}>Find verified househelps near you, or earn by offering your skills.</Text>
      </View>

      <View style={styles.actions}>
        <Button title="Order a househelp" onPress={() => navigation.navigate('Request')} />
        <Button title="Log in" variant="secondary" onPress={() => navigation.navigate('login')} />
        <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.linkRow}>
          <Text style={{ color: colors.muted }}>
            New here? <Text style={styles.link}>Create an account</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>How it works</Text>
      {STEPS.map((s, i) => (
        <View key={s.title} style={styles.step}>
          <View style={styles.stepIcon}>
            <Ionicons name={s.icon} size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={type.h2}>{i + 1}. {s.title}</Text>
            <Text style={styles.stepText}>{s.text}</Text>
          </View>
        </View>
      ))}

      <Footer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoLarge: { width: 110, height: 110 },
  hero: { alignItems: 'center', paddingTop: space.xl, paddingBottom: space.xl },
  logoWrap: {
    width: 92, height: 92, borderRadius: 46, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center', ...shadow,
  },
  logo: { width: 70, height: 70 },
  brand: { marginTop: space.md, fontSize: 14, fontWeight: '800', color: colors.primary, letterSpacing: 2 },
  headline: { ...type.h1, fontSize: 30, textAlign: 'center', marginTop: space.sm },
  sub: { fontSize: 15, color: colors.muted, textAlign: 'center', marginTop: space.sm, paddingHorizontal: space.lg, lineHeight: 22 },
  actions: { gap: space.md },
  linkRow: { alignSelf: 'center', padding: space.md },
  link: { color: colors.primary, fontWeight: '700' },
  sectionTitle: { ...type.h2, marginTop: space.xl, marginBottom: space.md },
  step: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.white,
    borderRadius: radius.lg, padding: space.lg, marginBottom: space.md, ...shadow,
  },
  stepIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  stepText: { color: colors.muted, marginTop: 2, fontSize: 13 },
});

export { Home };
