import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen, ScreenHeader } from '../../../component/ui';
import { colors, space, radius, shadow } from '../../../component/theme';

const APARTMENTS = [
  'One bedroom flat',
  'Two bedroom flat',
  'Three bedroom flat',
  'Three bedroom duplex',
  'Four bedroom flat',
  'Five bedroom duplex',
];

function SelectApartment({ navigation }) {
  const choose = async (apartment) => {
    try {
      await AsyncStorage.setItem('apartmenttype', apartment);
    } catch (e) {}
    navigation.navigate('selectchores');
  };

  return (
    <Screen>
      <ScreenHeader
        title="Apartment type"
        subtitle="Tell us the size of your home."
        onBack={() => navigation.goBack()}
        step={1}
        totalSteps={2}
      />
      {APARTMENTS.map((a) => (
        <TouchableOpacity key={a} style={styles.row} activeOpacity={0.85} onPress={() => choose(a)}>
          <View style={styles.icon}>
            <Ionicons name="business-outline" size={22} color={colors.primary} />
          </View>
          <Text style={styles.label}>{a}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </TouchableOpacity>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.white,
    borderRadius: radius.lg, padding: space.md, marginBottom: space.sm, ...shadow,
  },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text },
});

export { SelectApartment };
