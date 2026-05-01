import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      navigation.navigate('ClientDashboard');
    } catch (error) {
      console.error('Error creating request:', error);
      Alert.alert('Error', 'Failed to send request. Please try again.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Header2 />
      <Cmenu navigation={navigation} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.header}>Request a Househelp</Text>
        <TouchableOpacity
          style={[styles.button, styles.partTime]}
          onPress={() => handleRequest('Part-time')}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Request Part-time Househelp</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.fullTime]}
          onPress={() => handleRequest('Full-time')}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Request Full-time Househelp</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#343a40',
  },
  button: {
    width: '80%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  partTime: {
    backgroundColor: '#28a745',
  },
  fullTime: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export { MakeRequest };
