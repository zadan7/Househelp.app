import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Header } from '../../../component/Header';
import { Footer } from '../../../component/Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../pages/firebase';

function SelectChores({ navigation }) {
  const [selectedChores, setSelectedChores] = useState([]);
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

  useEffect(() => {
    const fetchUserData = async () => {
      const data = await AsyncStorage.getItem('clientdata');
      if (data) {
        setUser(JSON.parse(data));
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const newTotal = selectedChores.reduce((sum, chore) => sum + chore.price, 0);
    setTotalCost(newTotal);
  }, [selectedChores]);

  const toggleChore = (chore) => {
    setSelectedChores((prev) =>
      prev.some((item) => item.id === chore.id)
        ? prev.filter((item) => item.id !== chore.id)
        : [...prev, chore]
    );
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
      const requestId = `req_${Date.now()}`;
      const requestData = {
        id: requestId,
        clientId: user.id,
        clientName: user.name,
        phone: user.phone,
        address: user.address,
        apartmentType: user.apartmentType,
        location: user.location,
        requestType: 'Part-time',
        chores: selectedChores,
        totalCost,
        createdAt: Timestamp.now(),
        status: 'pending',
      };

      await addDoc(collection(db, 'requests'), requestData);

      await AsyncStorage.setItem('chores', JSON.stringify(selectedChores));
      await AsyncStorage.setItem('total', `${totalCost}`);

      Alert.alert('Success', 'Your request has been submitted!');
      navigation.navigate('ClientDashboard');
    } catch (error) {
      console.error('Error submitting request:', error);
      Alert.alert('Error', 'Failed to submit request. Try again.');
    }

    setLoading(false);
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Header navigation={navigation} />
        <Text style={styles.title}>Select Chores to be completed</Text>
        <View style={styles.buttonContainer}>
          <Text style={styles.amount}>Total: ₦{totalCost}</Text>

          {chores.map((chore) => (
            <Pressable
              key={chore.id}
              style={styles.pressable}
              onPress={() => toggleChore(chore)}
            >
              <Text
                style={
                  selectedChores.some((item) => item.id === chore.id)
                    ? styles.activeButtonStyle
                    : styles.inactiveButtonStyle
                }
              >
                {chore.chore} - ₦{chore.price}
              </Text>
            </Pressable>
          ))}

          <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.submitButtonText}>{loading ? 'Submitting...' : 'Confirm Request'}</Text>
          </Pressable>
        </View>
        <Footer />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    height: 'auto',
    paddingBottom: 50,
  },
  title: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 20,
  },
  buttonContainer: {
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: 'green',
    borderRadius: 10,
    padding: 20,
    marginBottom: 100,
  },
  amount: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
  },
  pressable: {
    marginBottom: 10,
    width: '100%',
    borderRadius: 20,
  },
  activeButtonStyle: {
    backgroundColor: 'white',
    color: 'green',
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 16,
    textAlign: 'center',
    borderRadius: 5,
    borderColor: 'green',
    borderWidth: 1,
  },
  inactiveButtonStyle: {
    backgroundColor: 'green',
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 16,
    textAlign: 'center',
    borderRadius: 5,
    borderColor: 'green',
    borderWidth: 1,
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export { SelectChores };
