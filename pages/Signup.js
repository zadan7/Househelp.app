import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, ScreenHeader } from '../component/ui';
import { colors, space, radius, type, shadow } from '../component/theme';
import { Footer } from '../component/Footer';

const ROLES = [
  { route: 'CSignup', icon: 'home-outline', title: 'I need a househelp', text: 'Sign up as a client to request and manage househelps.' },
  { route: 'HSignup', icon: 'briefcase-outline', title: 'I want to work', text: 'Sign up as a househelp to find jobs near you and get paid.' },
];

function Signup({ navigation }) {
  return (
    <Screen>
      <ScreenHeader title="Join Househelp" subtitle="How would you like to use the app?" onBack={() => navigation.goBack()} />
      {ROLES.map((r) => (
        <TouchableOpacity key={r.route} style={styles.option} activeOpacity={0.85} onPress={() => navigation.navigate(r.route)}>
          <View style={styles.icon}>
            <Ionicons name={r.icon} size={26} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={type.h2}>{r.title}</Text>
            <Text style={styles.text}>{r.text}</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.muted} />
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={() => navigation.navigate('login')} style={styles.linkRow}>
        <Text style={{ color: colors.muted }}>
          Already have an account? <Text style={styles.link}>Log in</Text>
        </Text>
      </TouchableOpacity>
      <Footer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.white,
    borderRadius: radius.lg, padding: space.lg, marginBottom: space.md, ...shadow,
  },
  icon: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.muted, fontSize: 13, marginTop: 2, lineHeight: 18 },
  linkRow: { alignSelf: 'center', padding: space.lg },
  link: { color: colors.primary, fontWeight: '700' },
});

export { Signup };
