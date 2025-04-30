import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Header } from '../component/Header';
import { Footer } from '../component/Footer';

import * as Notifications from "expo-notifications";

// Push notification registration
async function registerForPushNotificationsAsync() {
  let token;
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== "granted") {
      alert("Failed to get push token for notifications!");
      return null;
    }
  }
  token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("Push Token:", token);
  return token;
}

export const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clients, setClients] = useState([]);
  const [househelps, setHousehelps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pushToken, setPushToken] = useState(null); // <-- New state

  useEffect(() => {
    const fetchDataAndToken = async () => {
      try {
        // Fetch clients and househelps
        const clientSnapshot = await getDocs(collection(db, 'clients'));
        const househelpSnapshot = await getDocs(collection(db, 'househelps'));
        setClients(clientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setHousehelps(househelpSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch push token
        const token = await registerForPushNotificationsAsync();
        if (token) {
          setPushToken(token);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    fetchDataAndToken();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Email and password are required.');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const client = clients.find(user => user.email === email && user.password === password);
      const househelp = househelps.find(user => user.email === email && user.password === password);

      if (client && househelp) {
        Alert.alert('Login As', 'Select your role:', [
          { text: 'Client', onPress: () => loginUser(client, 'client') },
          { text: 'Househelp', onPress: () => loginUser(househelp, 'househelp') },
        ]);
      } else if (client) {
        loginUser(client, 'client');
      } else if (househelp) {
        loginUser(househelp, 'househelp');
      } else {
        Alert.alert('Login Failed', 'Invalid email or password.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Reusable login function
  const loginUser = async (user, role) => {
    try {
      if (pushToken) {
        const userRef = doc(db, role === 'client' ? 'clients' : 'househelps', user.id);
        await updateDoc(userRef, { PushToken: pushToken });
      }

      if (role === 'client') {
        await AsyncStorage.setItem('clientdata', JSON.stringify({ ...user, PushToken: pushToken }));
        navigation.navigate('cdashboard', { clientdata: { ...user, PushToken: pushToken } });
      } else {
        await AsyncStorage.setItem('househelpdata', JSON.stringify({ ...user, PushToken: pushToken }));
        navigation.navigate('hdashboard');
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Error', 'Could not complete login.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Header navigation={navigation} />

        <Text style={styles.title}>Login</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable style={styles.button} onPress={handleLogin}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </Pressable>
        </View>

        <Footer />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 24,
    color: '#2e7d32',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#2e7d32',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
