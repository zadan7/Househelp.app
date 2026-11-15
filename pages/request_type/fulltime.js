import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen, ScreenHeader } from '../../component/ui';
import { colors, space, radius, type, shadow } from '../../component/theme';

// The old buttons went to unregistered routes ('SelectApartment' and an empty name), which
// crashed. Full-time requests need an account, so: logged in -> the request form, otherwise login.
const OPTIONS = [
  { route: 'cfulltimelivein', icon: 'bed-outline', title: 'Live-in househelp', text: 'Stays at your home and supports you full time.' },
  { route: 'cfulltimeliveout', icon: 'walk-outline', title: 'Live-out househelp', text: 'Works full time and goes home after each day.' },
];

function Fulltime({ navigation }) {
  const go = async (route) => {
    let loggedIn = false;
    try {
      loggedIn = !!(await AsyncStorage.getItem('clientdata'));
    } catch (e) {}
    if (loggedIn) {
      navigation.navigate(route);
    } else {
      Alert.alert('Please log in', 'Log in or create a client account to request a full-time househelp.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log in', onPress: () => navigation.navigate('login') },
      ]);
    }
  };

  return (
    <Screen>
      <ScreenHeader
        title="Full-time househelp"
        subtitle="Choose the arrangement that suits your home."
        onBack={() => navigation.goBack()}
      />
      {OPTIONS.map((o) => (
        <TouchableOpacity key={o.route} style={styles.option} activeOpacity={0.85} onPress={() => go(o.route)}>
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

export { Fulltime };
