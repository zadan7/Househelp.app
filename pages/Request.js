import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, ScreenHeader } from '../component/ui';
import { colors, space, radius, type, shadow } from '../component/theme';

// The old "Fulltime" button navigated to an empty route name (a crash). It now goes to
// the registered 'fulltime' screen.
const OPTIONS = [
  { route: 'partime', icon: 'time-outline', title: 'Part-time househelp', text: 'Cleaning, cooking, laundry and other jobs by the hour or day.' },
  { route: 'fulltime', icon: 'home-outline', title: 'Full-time househelp', text: 'A dedicated househelp, live-in or live-out, for ongoing support.' },
];

function Request({ navigation }) {
  return (
    <Screen>
      <ScreenHeader
        title="What do you need?"
        subtitle="Choose the kind of househelp you would like to request."
        onBack={() => navigation.goBack()}
      />
      {OPTIONS.map((o) => (
        <TouchableOpacity key={o.route} style={styles.option} activeOpacity={0.85} onPress={() => navigation.navigate(o.route)}>
          <View style={styles.icon}>
            <Ionicons name={o.icon} size={26} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={type.h2}>{o.title}</Text>
            <Text style={styles.text}>{o.text}</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.muted} />
        </TouchableOpacity>
      ))}
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
});

export { Request };
