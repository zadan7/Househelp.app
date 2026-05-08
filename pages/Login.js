import React, { useEffect, useState, useRef } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
} from 'react-native';
import { Header } from '../component/Header';
import { Footer } from '../component/Footer';
import { db } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import messaging from '@react-native-firebase/messaging';
import { useCallback } from 'react';

function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [househelps, setHousehelps] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;
  const [fcmtoken, setFcmToken] = useState(null);
  const [expotoken, setExpoToken] = useState(null);

  // Animation logic
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.stopAnimation();
    }
  }, [loading]);

  // Optimized Fetch: Gets data once when the app opens
  const fetchData = async () => {
    try {
      const [hhSnap, clSnap] = await Promise.all([
        db.collection('househelps').get(),
        db.collection('clients').get()
      ]);

      const hhData = hhSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const clData = clSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    setHousehelps(hhData);
       setClients(clData);
      // console.log('Data fetched successfully:', { househelps: househelps.length, clients: clients.length });
    } catch (error) {
      console.error('Initial fetch error:', error);
    }
  };

  useEffect(() => {
    fetchData(); // Pre-load data so login is instant later

    // Run token logic in background
    registerForPushNotificationsAsync().then(token => setExpoToken(token));
    registerForFcmToken().then(token => setFcmToken(token));
  }, []);

  const storeData = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Storage error:', e);
    }
  };

  const registerForPushNotificationsAsync = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return null;
      return (await Notifications.getExpoPushTokenAsync()).data;
    } catch (e) { return null; }
  };

  const registerForFcmToken = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (!enabled) return null;
      return await messaging().getToken();
    } catch (e) { return null; }
  };

  // Optimized Login Handlers
  const loginAsHousehelp = async (user) => {
    setLoading(true);
    console.log('Logging in as Househelp:', user);
    try {
      const userData = { ...user, id: user.id };
      
      // Update DB and LocalStorage in parallel (FAST)
      await Promise.all([
        storeData('househelpdata', userData),
        db.collection('househelps').doc(user.id).update({
          expotoken: expotoken || '',
          fcmtoken: fcmtoken || ''
        })
      ]);

      navigation.navigate('hdashboard', { househelpdata: userData });
    } catch (error) {
      console.error(error);
      Alert.alert('Login Error', 'Failed to update session.');
    } finally {
      setLoading(false);
    }
  };

  const loginAsClient = async (user) => {
    setLoading(true);
    try {
      const userData = { ...user, id: user.id };

      await Promise.all([
        storeData('clientdata', userData),
        db.collection('clients').doc(user.id).update({
          expotoken: expotoken || '',
          fcmtoken: fcmtoken || ''
        })
      ]);

      navigation.navigate('cdashboard', { clientdata: userData });
    } catch (error) {
      console.error(error);
      Alert.alert('Login Error', 'Failed to update session.');
    } finally {
      setLoading(false);
    }
  };

const handleLogin = useCallback(() => {
    // 1. Initial Validation
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter email and password.');
      return;
    }

    // 2. Logging for Debugging
    console.log('--- Login Attempt ---');
    console.log('Stored Househelps:', househelps.length);
    console.log('Stored Clients:', clients.length);
    console.log(clients);

    // 3. Safety Check: If data hasn't arrived yet
    if (househelps.length === 0 && clients.length === 0) {
      setLoading(false);
      Alert.alert(
        'Data Loading', 
        'We are still syncing user data from the cloud. Please wait a few seconds and try again.'
      );
      console.warn('Login attempted before data was loaded. Triggering fetch again.');
      fetchData(); // Trigger a fetch in case it failed the first time
      return;
    }

    setLoading(true);
    const emailLower = email.toLowerCase();

    // 4. Find the user in the pre-fetched lists
    const hhUser = househelps.find(
      (u) => u.email?.toLowerCase() === emailLower && u.password === password
    );
    const clUser = clients.find(
      (u) => u.email?.toLowerCase() === emailLower && u.password === password
    );

    console.log('Search Results:', { 
      foundHousehelp: !!hhUser, 
      foundClient: !!clUser 
    });

    // 5. Logic for Dual-Role Users
    if (hhUser && clUser) {
      setLoading(false);
      Alert.alert('Account Type', 'Which account would you like to access?', [
        { text: 'Client', onPress: () => loginAsClient(clUser) },
        { text: 'Househelp', onPress: () => loginAsHousehelp(hhUser) },
      ]);
    } 
    // 6. Logic for Single-Role Users
    else if (clUser) {
      loginAsClient(clUser);
    } else if (hhUser) {
      loginAsHousehelp(hhUser);
    } 
    // 7. Fallback for incorrect credentials
    else {
      setLoading(false);
      Alert.alert('Login Failed', 'Incorrect email or password. Please try again.');
    }
  }, [email, password, househelps, clients]); // These dependencies are CRITICAL

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Header navigation={navigation} />
        <Text style={styles.title}>Login</Text>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
          <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Authenticating...' : 'Login'}</Text>
          </Pressable>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.spinnerContainer}>
              <Animated.Image
                source={require('../assets/icon.png')}
                style={[styles.spinnerIcon, { transform: [{ rotate: spin }] }]}
              />
            </View>
          </View>
        )}
        <Footer />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', alignItems: 'center' },
  title: { color: 'green', fontSize: 36, fontWeight: 'bold', marginVertical: 10 },
  formContainer: { width: '100%', maxWidth: 400, alignItems: 'center', padding: 10 },
  input: { width: '100%', height: 50, borderColor: 'green', borderWidth: 1, borderRadius: 25, paddingHorizontal: 15, marginVertical: 10, fontSize: 16 },
  button: { backgroundColor: 'green', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, marginTop: 20, width: '100%', alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 255, 255, 0.88)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  spinnerContainer: { alignItems: 'center', justifyContent: 'center', borderRadius: 55, borderColor: 'green', borderWidth: 5 },
  spinnerIcon: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: 'white' },
});

export { Login };