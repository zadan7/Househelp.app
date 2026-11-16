import React, { useEffect, useState } from 'react';
import { View, Text, Image, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, Field, Button } from '../component/ui';
import { colors, space, radius, type, shadow } from '../component/theme';
import { db } from './firebase';
import { registerForPushNotificationsAsync, registerForFcmToken } from '../services/notifications';
import logo from '../assets/Househelp.png';
// import Footer from '../component/Footer';
import { Footer } from '../component/Footer';

// Looks up accounts for ONE email instead of downloading every user in the database.
// Firestore cannot search case-insensitively, so this tries the email as typed, lowercased,
// and with a capital first letter (what phone keyboards often produced for older accounts).
// Accounts stored with other capitalisation need a one-time migration that lowercases the
// stored `email` field; new signups are already saved in lowercase.
// NOTE: passwords are still compared as stored plaintext; that is only fully fixed by moving
// to Firebase Auth (planned).
async function findUser(collection, typedEmail, password) {
  const lower = typedEmail.toLowerCase();
  const capitalised = lower.charAt(0).toUpperCase() + lower.slice(1);
  const variants = Array.from(new Set([typedEmail, lower, capitalised]));
  for (const v of variants) {
    const snap = await db.collection(collection).where('email', '==', v).get();
    const match = snap.docs.map((d) => ({ id: d.id, ...d.data() })).find((u) => u.password === password);
    if (match) return match;
  }
  return null;
}

function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expotoken, setExpoToken] = useState(null);
  const [fcmtoken, setFcmToken] = useState(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then(setExpoToken);
    registerForFcmToken().then(setFcmToken);
  }, []);

  const enter = async (role, user) => {
    setLoading(true);
    try {
      const isClient = role === 'client';
      const userData = { ...user, id: user.id };

      // Only overwrite saved push tokens when we actually have new ones.
      const tokens = {};
      if (expotoken) tokens.expotoken = expotoken;
      if (fcmtoken) tokens.fcmtoken = fcmtoken;

      await Promise.all([
        AsyncStorage.setItem(isClient ? 'clientdata' : 'househelpdata', JSON.stringify(userData)),
        Object.keys(tokens).length
          ? db.collection(isClient ? 'clients' : 'househelps').doc(user.id).update(tokens)
          : Promise.resolve(),
      ]);

      navigation.reset({
        index: 0,
        routes: [
          isClient
            ? { name: 'cdashboard', params: { clientdata: userData } }
            : { name: 'hdashboard', params: { househelpdata: userData } },
        ],
      });
    } catch (e) {
      Alert.alert('Login error', 'We could not finish signing you in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const typed = email.trim();
    if (!typed || !password) {
      setError('Enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const [hh, cl] = await Promise.all([
        findUser('househelps', typed, password),
        findUser('clients', typed, password),
      ]);

      if (hh && cl) {
        setLoading(false);
        Alert.alert('Which account?', 'This email has both a client and a househelp account.', [
          { text: 'Client', onPress: () => enter('client', cl) },
          { text: 'Househelp', onPress: () => enter('househelp', hh) },
        ]);
      } else if (cl) {
        await enter('client', cl);
      } else if (hh) {
        await enter('househelp', hh);
      } else {
        setError('Incorrect email or password.');
      }
    } catch (e) {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      {navigation.canGoBack() ? (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
      ) : null}

      <View style={styles.hero}>
        <View style={styles.logoWrap}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.sub}>Log in to continue to Househelp.</Text>
      </View>

      <Card>
        <Field
          label="Email"
          value={email}
          onChangeText={(t) => { setEmail(t); setError(''); }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
          placeholder="you@example.com"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={(t) => { setPassword(t); setError(''); }}
          secure
          autoCapitalize="none"
          editable={!loading}
          onSubmitEditing={handleLogin}
        />
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        <Button title="Log in" onPress={handleLogin} loading={loading} />
      </Card>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.linkRow}>
        <Text style={{ color: colors.muted }}>
          New to Househelp? <Text style={styles.link}>Create an account</Text>
        </Text>
      </TouchableOpacity>

      
      <Footer/>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    width: 40, height: 40, borderRadius: radius.pill, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center', ...shadow,
  },
  hero: { alignItems: 'center', paddingVertical: space.xl },
  logoWrap: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center', ...shadow,
  },
  logo: { width: 64, height: 64 },
  title: { ...type.h1, marginTop: space.lg },
  sub: { color: colors.muted, marginTop: space.xs },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md,
    borderRadius: radius.md, backgroundColor: colors.dangerSoft,
  },
  errorText: { color: colors.danger, flex: 1, fontSize: 13 },
  linkRow: { alignSelf: 'center', padding: space.lg },
  link: { color: colors.primary, fontWeight: '700' },
});

export { Login };
