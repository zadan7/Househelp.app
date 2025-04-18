import React, { useState, useEffect } from 'react';
import { 
  View, Text, Pressable, StyleSheet, ScrollView, Alert, ActivityIndicator, TextInput 
} from 'react-native';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      const data = await AsyncStorage.getItem('clientdata');
      if (data) setUser(JSON.parse(data));
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
        createdAt: Timestamp.now(),
        status: 'pending',
      };

      // await addDoc(collection(db, 'partimeRequest'), requestData);
      const docRef = await addDoc(collection(db, 'partimeRequest'), requestData);
const newDocId = docRef.id;

console.log('New document created with ID:', newDocId);
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
    <View style={styles.container}>
      <Header2 />
      <Cmenu navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Request a Househelp</Text>

        <View style={styles.choreListContainer}>
          <Text style={styles.totalCost}>Total Cost: ₦{totalCost}</Text>

          {allChores.map((chore) => (
            <Pressable
              key={chore.id}
              style={[
                styles.choreItem,
                selectedChores.some((item) => item.id === chore.id) && styles.selectedChore,
              ]}
              onPress={() => toggleChore(chore)}
            >
              <Text style={styles.choreText}>
                {chore.chore} - ₦{chore.price}
              </Text>
            </Pressable>
          ))}

          <Text style={styles.customHeader}>Add a Custom Chore</Text>
          <TextInput
            style={styles.input}
            placeholder="Chore Description"
            value={customChore}
            onChangeText={setCustomChore}
          />
          <TextInput
            style={styles.input}
            placeholder="Price (₦)"
            keyboardType="numeric"
            value={customPrice}
            onChangeText={setCustomPrice}
          />
          <Pressable style={styles.addButton} onPress={handleAddCustomChore}>
            <Text style={styles.submitButtonText}>+ Add Chore</Text>
          </Pressable>

          <Pressable 
            style={[styles.submitButton, loading && styles.disabledButton]} 
            onPress={handleSubmit} 
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Submitting...' : 'Confirm Request'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7f9',
  },
  scrollContainer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginVertical: 20,
  },
  choreListContainer: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 30,
  },
  totalCost: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 15,
    textAlign: 'center',
  },
  choreItem: {
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d5dbdb',
  },
  selectedChore: {
    backgroundColor: '#27ae60',
    borderColor: '#1e8449',
  },
  choreText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  customHeader: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#1abc9c',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export { MakeRequest };
