import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, space, radius, type, shadow } from '../../component/theme';

const OPTIONS = [
  { type: 'Part-time', title: 'Request Part-time Househelp', sub: 'Short, flexible help for a few hours or days.', icon: 'time-outline' },
  { type: 'Full-time', title: 'Request Full-time Househelp', sub: 'Dedicated help for your home every day.', icon: 'home-outline' },
];

const MakeRequest = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const handleRequest = async (type) => {
    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem('clientdata');
      if (!userData) {
        Alert.alert('Error', 'User data not found. Please log in again.');
        return;
      }

      const user = JSON.parse(userData);
      const requestId = `req_${Date.now()}`;
      const requestData = {
        id: requestId,
        clientId: user.id,
        clientName: user.name,
        phone: user.phone,
        address: user.address,
        apartmentType: user.apartmentType,
        location: user.location,
        requestType: type,
        createdAt: Timestamp.now(),
        status: 'pending'
      };

      await setDoc(doc(db, 'requests', requestId), requestData);
      Alert.alert('Success', `Your ${type} request has been posted.`);
      navigation.navigate('cdashboard');
    } catch (error) {
      console.error('Error creating request:', error);
      Alert.alert('Error', 'Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <Header2 />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={type.h1}>Request a Househelp</Text>
        <Text style={styles.sub}>Choose the kind of help you need.</Text>

        {OPTIONS.map((o) => (
          <TouchableOpacity
            key={o.type}
            style={[styles.option, loading && { opacity: 0.6 }]}
            onPress={() => handleRequest(o.type)}
            disabled={loading}
            activeOpacity={0.85}
          >
            <View style={styles.optionIcon}>
              <Ionicons name={o.icon} size={26} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>{o.title}</Text>
              <Text style={styles.optionSub}>{o.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>
        ))}

        {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: space.lg }} /> : null}
      </ScrollView>

      <Cmenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 110, gap: space.md },
  sub: { ...type.body, color: colors.muted, marginBottom: space.sm },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 84,
    backgroundColor: colors.white, borderRadius: radius.lg, padding: space.lg, ...shadow,
  },
  optionIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  optionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  optionSub: { fontSize: 13, color: colors.muted, marginTop: 2 },
});

export { MakeRequest };
