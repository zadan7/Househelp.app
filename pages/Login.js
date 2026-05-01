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
  Image
} from 'react-native';
import { Header } from '../component/Header';
import { Footer } from '../component/Footer';
import { db } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import messaging from '@react-native-firebase/messaging'; // Ensure this is installed

function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [househelps, setHousehelps] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;
  const [fcmtoken , setFcmToken] = useState(null); // State to hold FCM token
  const [expotoken , setExpoToken] = useState(null); // State to hold Expo token

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

  const fetchData = async () => {
    try {
      // Parallel fetch for performance
      const [hhSnap, clSnap] = await Promise.all([
        db.collection('househelps').get(),
        db.collection('clients').get()
      ]);

      const househelpsData = hhSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const clientsData = clSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setHousehelps(househelpsData);
      setClients(clientsData);

      return { househelps: househelpsData, clients: clientsData };
    } catch (error) {
      console.error('Fetch error:', error);
      return { househelps: [], clients: [] };
    }
  };

  useEffect(() => {
    // Optional: Pre-fetch data on mount for faster login experience
    fetchData();

     registerForPushNotificationsAsync().then(token => {
      setExpoToken(token);
      console.log('Expo Push Token:', token);
    })

    registerForFcmToken().then(token => {
      console.log('FCM Token:', token);
      setFcmToken(token); 

  })
}, []);

  const storeData = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Storage error:', e);
    }
  };

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  };

  const registerForFcmToken = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) return null;
      return await messaging().getToken();
    } catch (e) {
      return null;
    }
  };

  const loginAsHousehelp = async (househelp) => {
    const clientdata = { ...househelp, id: househelp.id };
    await storeData('clientdata', clientdata);

     try {
      // 1. Fetch push tokens
      

      // 2. Update Firestore if tokens exist
      if (expotoken || fcmtoken) {
        await db.collection('househelps').doc(househelp.id).update({
          expotoken: expotoken || '',
          fcmtoken: fcmtoken || ''
        });
        console.log('Push tokens updated successfully');
      }

      // 3. Prepare and store user data locally
      const househelpdata = { ...househelp, id: househelp.id };
      await storeData('househelpdata', househelpdata);
      
      // 4. Navigate to the client dashboard
      navigation.navigate('hdashboard', { househelpdata });

    } catch (error) {
      console.error('Error during househelp login:', error);
      Alert.alert('Login Error', 'We could not complete your login. Please check your connection.');
    } finally {
      // Essential: Stop the loading spinner even if an error occurs
      setLoading(false);
    }
    navigation.navigate("hdashboard", { househelp });
  };

const loginAsClient = async (client) => {
    try {
      // 1. Fetch push tokens
      

      // 2. Update Firestore if tokens exist
      if (expotoken || fcmtoken) {
        await db.collection('clients').doc(client.id).update({
          expotoken: expotoken || '',
          fcmtoken: fcmtoken || ''
        });
        console.log('Push tokens updated successfully');
      }

      // 3. Prepare and store user data locally
      const clientdata = { ...client, id: client.id };
      await storeData('clientdata', clientdata);
      
      // 4. Navigate to the client dashboard
      navigation.navigate('cdashboard', { clientdata });

    } catch (error) {
      console.error('Error during client login:', error);
      Alert.alert('Login Error', 'We could not complete your login. Please check your connection.');
    } finally {
      // Essential: Stop the loading spinner even if an error occurs
      setLoading(false);
    }
  }; 
  


  const handleLogin = async () => {
    console.log('Attempting login with:', { email, password });
    if (!email || !password  ) {
      Alert.alert('Missing Fields', 'Please enter email and password.');
      return;
    }

    setLoading(true);
    const { househelps: hh, clients: cl } = await fetchData();

    const househelpUser = hh.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    const clientUser = cl.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (househelpUser && clientUser) {
      Alert.alert('Account Type', 'How would you like to log in?', [
        { text: 'Client', onPress: () => loginAsClient(clientUser) },
        { text: 'Househelp', onPress: () => loginAsHousehelp(househelpUser) },
      ]);
    } else if (clientUser) {
      await loginAsClient(clientUser);
    } else if (househelpUser) {
      await loginAsHousehelp(househelpUser);
    } else {
      Alert.alert('Login Failed', 'Incorrect email or password.');
    }
    setLoading(false);
  };

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

    borderRadius: 25,

    paddingHorizontal: 15,

    marginVertical: 10,

    fontSize: 16,

  },

  button: {

    backgroundColor: 'green',

    paddingVertical: 12,

    paddingHorizontal: 30,

    borderRadius: 25,

    marginTop: 20,

    width: '100%',

    alignItems: 'center',

  },

  buttonText: {

    color: 'white',

    fontSize: 18,

    fontWeight: 'bold',

  },

  loadingOverlay: {

    position: 'absolute',

    top: 0,

    left: 0,

    right: 0,

    bottom: 0,

    backgroundColor: 'rgba(255, 255, 255, 0.88)',

    justifyContent: 'center',

    alignItems: 'center',

    //  border: '5px solid green',

    width:'100%',

    height:'100%',

    // borderWidth: 2,

    borderColor: 'green',

borderLeftWidth: 5,

borderRightWidth: 5,





   zIndex:999

  },

  spinnerContainer: {

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: 'rgba(255, 255, 255, 0.1)',

    borderRadius: 55,

    // padding: 0,

    color: 'white',

    width:'auto',

    height:'auto',

     border: '5px solid green',



     borderColor: 'green',

     borderWidth: 5,

   



  },

 

  spinnerIcon: {

    width: 100,

    height: 100,

    // marginBottom: 20,

    borderRadius: 50,

 

    borderWidth: 4,

     borderColor: 'white',

     boxShadowColor: 'white',

    //  boxShadowOffset: { width: 20, height: 20 },

     boxShadowOpacity: 1,

    //  boxShadowRadius: 10,



  },

 

  loadingText: {

    color: '#003f1c',

    fontSize: 18,

    fontWeight: 'bold',

    marginTop: 10,

     border: '5px solid green',

    //  width: '100%',

    //  height: '100%',



  },

});

       
export  {Login};