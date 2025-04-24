import React, { useEffect, useState } from 'react';
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
  ActivityIndicator
} from 'react-native';
import { Header } from '../component/Header';
import { Footer } from '../component/Footer';
import { db } from './firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [househelps, setHousehelps] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hhSnap, clSnap] = await Promise.all([
          getDocs(collection(db, 'househelps')),
          getDocs(collection(db, 'clients')),
        ]);
        setHousehelps(hhSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setClients(clSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchData();
  }, []);
  const storeData = async (key, data) => {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  };

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Permission denied', 'Unable to get push notification permission.');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push Token:', token);
    return token;
  };
  const loginAsHousehelp = async (househelp) => {

    try{
      const token = await registerForPushNotificationsAsync();
      if (token) {
        const househelpRef = doc(db, 'househelps', househelp.id);
        await updateDoc(househelpRef, { pushToken: token });
      }

    }catch(error){
      console.error('Error updating push token:', error);
      Alert.alert('Error', 'Failed to update push token. Please try again.',error);
      // Alert.alert('Error', 'Something went wrong. Please try again.');
    }
   

    const househelpdata = { ...househelp, id: househelp.id };
    await storeData('househelpdata', househelpdata);
    navigation.navigate('hdashboard');
  };
  
  const loginAsClient = async (client) => {

    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        const clientRef = doc(db, 'clients', client.id);
        await updateDoc(clientRef, { pushToken: token });
      }
    } catch (error) {
      console.error('Error updating push token:', error);
      Alert.alert('Error', 'Failed to update push token. Please try again.',error);
      // Alert.alert('Error', 'Something went wrong. Please try again.');
      
    }
   

    const clientdata = { ...client, id: client.id };
    await storeData('clientdata', clientdata);
    navigation.navigate('cdashboard', { clientdata });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const househelp = househelps.find(u => u.email === email && u.password === password);
      const client = clients.find(u => u.email === email && u.password === password);

   


   

      if (househelp && client) {
        Alert.alert(
          'Multiple Accounts Found',
          'Choose how to login:',
          [
            { text: 'Login as Client', onPress: loginAsClient },
            { text: 'Login as Househelp', onPress: loginAsHousehelp },
          ]
        );
      } else if (client) {
        await loginAsClient(client);
        Alert.alert('Login Successful', 'Welcome Client!');
      } else if (househelp) {
        await loginAsHousehelp(househelp);
        Alert.alert('Login Successful', 'Welcome Househelp!');
      } else {
        Alert.alert('Login Failed', 'Incorrect email or password.');
      }
     } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    color: 'green',
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 10,
    fontFamily: 'serif',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    padding: 10,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: 'green',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export { Login };
