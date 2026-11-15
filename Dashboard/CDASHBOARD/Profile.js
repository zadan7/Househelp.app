import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import { Card, InfoRow } from '../../component/ui';
import { colors, space, radius, type, shadow } from '../../component/theme';

// The old screen read user.name, user.apartmentType and user.createdAt, but signup saves
// firstname/lastname and apartmentsize (and had no creation date), so those showed blank.
const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('clientdata')
      .then((raw) => raw && setUser(JSON.parse(raw)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const fullName = user ? [user.firstname, user.lastname].filter(Boolean).join(' ') || user.name : '';
  const since = user?.createdAt && !isNaN(new Date(user.createdAt)) ? new Date(user.createdAt).toLocaleDateString() : null;

  return (
    <View style={styles.root}>
      <Header2 />
      {!loaded ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.xxl }} />
      ) : !user ? (
        <Text style={styles.empty}>We could not load your profile. Please log in again.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.top}>
            {user.facepicture ? (
              <Image source={{ uri: user.facepicture }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]} />
            )}
            <Text style={styles.name}>{fullName || 'Client'}</Text>
            <Text style={styles.sub}>{user.email}</Text>
            {since ? <Text style={styles.sub}>Member since {since}</Text> : null}
          </View>

          <Card title="Contact" icon="call-outline">
            <InfoRow label="Phone" value={user.phone} />
            <InfoRow label="Email" value={user.email} last />
          </Card>

          <Card title="Home" icon="home-outline">
            <InfoRow label="Address" value={user.address} />
            <InfoRow label="Apartment" value={user.apartmentsize || user.apartmentType} />
            <InfoRow label="LGA" value={user.lga} />
            <InfoRow label="State" value={user.state} last />
          </Card>

          {user.frontview || user.insideview ? (
            <Card title="Photos" icon="images-outline">
              {user.frontview ? (
                <View>
                  <Text style={type.label}>Front of house</Text>
                  <Image source={{ uri: user.frontview }} style={styles.photo} />
                </View>
              ) : null}
              {user.insideview ? (
                <View>
                  <Text style={type.label}>Inside apartment</Text>
                  <Image source={{ uri: user.insideview }} style={styles.photo} />
                </View>
              ) : null}
            </Card>
          ) : null}
        </ScrollView>
      )}
      <Cmenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 110 },
  empty: { textAlign: 'center', color: colors.muted, margin: space.xl },
  top: { alignItems: 'center', paddingVertical: space.lg },
  avatar: { width: 104, height: 104, borderRadius: 52, borderWidth: 4, borderColor: colors.white, ...shadow },
  name: { ...type.h1, marginTop: space.md },
  sub: { color: colors.muted, marginTop: 2 },
  photo: { width: '100%', height: 170, borderRadius: radius.md, marginTop: space.sm, backgroundColor: colors.border },
});

export { Profile };
