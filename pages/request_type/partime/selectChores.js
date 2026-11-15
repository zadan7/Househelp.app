import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../../pages/firebase';
import { Screen, ScreenHeader, Button } from '../../../component/ui';
import { colors, space, radius, type, shadow } from '../../../component/theme';

const CHORES = [
  { id: 1, chore: 'Clean Living Room', price: 800 },
  { id: 2, chore: 'Wash Bathroom', price: 800 },
  { id: 3, chore: 'Clean Personal Room', price: 700 },
  { id: 4, chore: 'Clean Kitchen', price: 800 },
  { id: 5, chore: 'Wash Dishes', price: 1000 },
  { id: 6, chore: 'Wash Car', price: 2000 },
  { id: 7, chore: 'Wash Clothes', price: 3000 },
];

function SelectChores({ navigation }) {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [apartment, setApartment] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem('clientdata');
        if (data) setUser(JSON.parse(data));
        const a = await AsyncStorage.getItem('apartmenttype');
        if (a) setApartment(a);
      } catch (e) {}
    })();
  }, []);

  const total = useMemo(() => selected.reduce((s, c) => s + c.price, 0), [selected]);

  const toggle = (chore) =>
    setSelected((prev) => (prev.some((c) => c.id === chore.id) ? prev.filter((c) => c.id !== chore.id) : [...prev, chore]));

  const submit = async () => {
    if (selected.length === 0) return Alert.alert('Select chores', 'Please select at least one chore.');
    if (!user) {
      return Alert.alert('Please log in', 'Log in to send your request.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log in', onPress: () => navigation.navigate('login') },
      ]);
    }
    setLoading(true);
    try {
      // Fixed: this used the web Firestore API (addDoc/collection/Timestamp) on the native
      // instance, which throws. It also read fields that signup never saves (name, apartmentType).
      await db.collection('requests').add({
        clientId: user.id,
        clientName: user.name || [user.firstname, user.lastname].filter(Boolean).join(' '),
        phone: user.phone || user.phonenumber || '',
        address: user.address || '',
        apartmentType: apartment || user.apartmentsize || '',
        location: user.location || null,
        requestType: 'Part-time',
        chores: selected,
        totalCost: total,
        createdAt: new Date(),
        status: 'pending',
      });
      await AsyncStorage.setItem('chores', JSON.stringify(selected));
      await AsyncStorage.setItem('total', `${total}`);
      Alert.alert('Request sent', 'Your request has been submitted.');
      navigation.navigate('cdashboard');
    } catch (e) {
      Alert.alert('Error', 'Failed to submit request. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScreenHeader
        title="Select chores"
        subtitle={apartment ? `${apartment} · tap the chores you need` : 'Tap the chores you need'}
        onBack={() => navigation.goBack()}
        step={2}
        totalSteps={2}
      />
      {CHORES.map((c) => {
        const on = selected.some((x) => x.id === c.id);
        return (
          <TouchableOpacity key={c.id} style={[styles.row, on && styles.rowOn]} activeOpacity={0.85} onPress={() => toggle(c)}>
            <Ionicons name={on ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={on ? colors.primary : colors.muted} />
            <Text style={styles.label}>{c.chore}</Text>
            <Text style={styles.price}>₦{c.price}</Text>
          </TouchableOpacity>
        );
      })}
      <View style={styles.totalBar}>
        <Text style={type.h2}>Total</Text>
        <Text style={styles.total}>₦{total}</Text>
      </View>
      <Button title="Confirm request" onPress={submit} loading={loading} disabled={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.white,
    borderRadius: radius.lg, padding: space.md, marginBottom: space.sm, borderWidth: 1.5, borderColor: 'transparent', ...shadow,
  },
  rowOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  label: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  price: { fontWeight: '700', color: colors.primary },
  totalBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: space.md },
  total: { fontSize: 22, fontWeight: '800', color: colors.primary },
});

export { SelectChores };
