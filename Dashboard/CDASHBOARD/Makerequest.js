import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../pages/firebase';
import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import { Card, Field, Button } from '../../component/ui';
import { colors, space, radius, type } from '../../component/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;

const MakeRequest = ({ navigation }) => {
  const [selectedChores, setSelectedChores] = useState([]);
  const [customChore, setCustomChore] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const chores = [
    { id: 1, chore: 'Clean Living Room', price: 800 },
    { id: 2, chore: 'Wash Bathroom', price: 800 },
    { id: 3, chore: 'Clean Personal Room', price: 700 },
    { id: 4, chore: 'Clean Kitchen', price: 800 },
    { id: 5, chore: 'Wash Dishes', price: 1000 },
    { id: 6, chore: 'Wash Car', price: 2000 },
    { id: 7, chore: 'Wash Clothes', price: 3000 },
  ];

  const [allChores, setAllChores] = useState(chores);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await AsyncStorage.getItem('clientdata');
        if (data) setUser(JSON.parse(data));
      } catch (e) {
        // leave user null; submit will ask the client to log in
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    setTotalCost(selectedChores.reduce((sum, chore) => sum + chore.price, 0));
  }, [selectedChores]);

  const toggleChore = (chore) => {
    setSelectedChores((prev) =>
      prev.some((item) => item.id === chore.id)
        ? prev.filter((item) => item.id !== chore.id)
        : [...prev, chore]
    );
  };

  const handleAddCustomChore = () => {
    if (!customChore.trim() || !customPrice || isNaN(customPrice)) {
      Alert.alert('Invalid Input', 'Please enter a valid chore and price.');
      return;
    }

    const newChore = {
      id: Date.now(),
      chore: customChore.trim(),
      price: parseInt(customPrice),
    };

    setAllChores([...allChores, newChore]);
    setSelectedChores([...selectedChores, newChore]);
    setCustomChore('');
    setCustomPrice('');
  };

  const handleSubmit = async () => {
    if (selectedChores.length === 0) {
      Alert.alert('Error', 'Please select at least one chore.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User data not found. Please log in.');
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        clientData: user,
        jobid: `req_${Date.now()}`,
        clientId: user.id,
        clientName: user.firstname + ' ' + user.lastname,
        clientEmail: user.email,
        phone: user.phone,
        address: user.address,
        apartmentType: user.apartmentsize,
        location: user.location,
        requestType: 'Part-time',
        chores: selectedChores,
        totalCost,
        createdAt: Date.now(),
        status: 'pending',
        isjobcompleted: false,
      };

      const docRef = await db.collection('partimeRequest').add(requestData);
      const newDocId = docRef.id;

      // Was not awaited, so a failure here was silently lost.
      await db.collection('partimeRequest').doc(newDocId).update({ id: newDocId });

      await AsyncStorage.setItem('chores', JSON.stringify(selectedChores));
      await AsyncStorage.setItem('total', `${totalCost}`);
      await AsyncStorage.setItem('requestdata', JSON.stringify(requestData));
      await AsyncStorage.setItem('jobId', newDocId);

      Alert.alert('Success', 'Your request has been submitted!');
      navigation.navigate('cmappage', { clientId: user.id });
    } catch (error) {
      console.error('Error submitting request: ', error);
      Alert.alert('Error', 'Failed to submit request. Try again.');
    }

    setLoading(false);
  };

  return (
    <View style={styles.root}>
      <Header2 />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={type.h1}>Request a Househelp</Text>
          <Text style={styles.sub}>Pick the chores you need done today.</Text>

          <View style={styles.totalBox}>
            <View>
              <Text style={styles.totalLabel}>Total cost</Text>
              <Text style={styles.totalValue}>{naira(totalCost)}</Text>
            </View>
            <View style={styles.countPill}>
              <Text style={styles.countText}>{selectedChores.length} selected</Text>
            </View>
          </View>

          <Card title="Chores" icon="list-outline">
            {allChores.map((chore) => {
              const on = selectedChores.some((item) => item.id === chore.id);
              return (
                <TouchableOpacity
                  key={chore.id}
                  activeOpacity={0.8}
                  onPress={() => toggleChore(chore)}
                  style={[styles.choreItem, on && styles.choreOn]}
                  accessibilityState={{ selected: on }}
                >
                  <Ionicons
                    name={on ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={on ? colors.primary : colors.border}
                  />
                  <Text style={styles.choreText}>{chore.chore}</Text>
                  <Text style={[styles.chorePrice, on && { color: colors.primary }]}>{naira(chore.price)}</Text>
                </TouchableOpacity>
              );
            })}
          </Card>

          <Card title="Add a custom chore" icon="add-circle-outline">
            <Field label="Chore description" placeholder="Chore Description" value={customChore} onChangeText={setCustomChore} />
            <Field
              label="Price (₦)"
              placeholder="Price (₦)"
              keyboardType="numeric"
              value={customPrice}
              onChangeText={setCustomPrice}
            />
            <Button title="+ Add Chore" variant="secondary" onPress={handleAddCustomChore} />
          </Card>

          <Button
            title={loading ? 'Submitting...' : 'Confirm Request'}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
      <Cmenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 110 },
  sub: { color: colors.muted, marginTop: space.xs, marginBottom: space.lg },
  totalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.lg,
  },
  totalLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  totalValue: { color: colors.white, fontSize: 28, fontWeight: '800' },
  countPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  countText: { color: colors.white, fontWeight: '600', fontSize: 12 },
  choreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 52,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  choreOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  choreText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  chorePrice: { fontSize: 14, fontWeight: '700', color: colors.muted },
});

export { MakeRequest };
