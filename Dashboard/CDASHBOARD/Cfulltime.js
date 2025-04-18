import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../pages/firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import { Picker } from '@react-native-picker/picker';

const CFulltime = ({ navigation }) => {
  const [client, setClient] = useState(null);
  const [description, setDescription] = useState('');
  const [chores, setChores] = useState('');
  const [salaryRange, setSalaryRange] = useState('N50,000');
  const [numberOfKids, setNumberOfKids] = useState('');

  useEffect(() => {
    const fetchClientData = async () => {
      const storedData = await AsyncStorage.getItem('clientdata');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setClient(parsed);
      }
    };
    fetchClientData();
  }, []);

  const handleSubmit = async () => {
    if (!client || !description || !chores || numberOfKids === '') {
      return Alert.alert('Incomplete Form', 'Please fill in all required fields.');
    }

    try {
      // Replace console logs with actual Firestore submission if needed
      console.log("client", client);
      console.log("description", description);
      console.log("chores", chores);
      console.log("salaryRange", salaryRange);
      console.log("numberOfKids", numberOfKids);

      // Uncomment this block to submit to Firestore:
      /*
      await addDoc(collection(db, 'fulltimeLiveinRequest'), {
        clientId: client.id,
        clientName: client.name,
        phone: client.phone,
        apartmentType: client.apartmentType || 'Not specified',
        location: client.location || 'Not specified',
        requestType: 'fulltime-livein',
        description,
        salaryRange,
        numberOfKids,
        chores: chores.split(',').map(c => c.trim()),
        status: 'pending',
        createdAt: Timestamp.now(),
      });
      */

      Alert.alert('Success', 'Your request has been submitted!');
      setDescription('');
      setChores('');
      setNumberOfKids('');
      setSalaryRange('N50,000');
    } catch (error) {
      console.error('Submission Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Header2 />
      <Cmenu navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>Full-Time Live-In Request
         
          </Text>

        <Text style={styles.label}>Job Description  <Text style={{color:"red", fontSize:"15"}}>take your time to Describe exactly what you want from the househelp </Text></Text>
        <TextInput
          placeholder="Describe what the househelp will do"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { height: 100 }]}
         
        />

        <Text style={styles.label}>Chores (comma-separated)</Text>
        <TextInput
          placeholder="e.g., Cleaning, Cooking, Babysitting"
          value={chores}
          onChangeText={setChores}
          style={styles.input}
        />

        <Text style={styles.label}>Number of Kids</Text>
        <TextInput
          placeholder="Enter number of kids"
          keyboardType="numeric"
          value={numberOfKids}
          onChangeText={setNumberOfKids}
          style={styles.input}
        />

        <Text style={styles.label}>Salary Range</Text>
        <View style={Platform.OS === 'android' ? styles.androidPickerWrapper : styles.pickerWrapper}>
          <Picker
            selectedValue={salaryRange}
            onValueChange={(itemValue) => setSalaryRange(itemValue)}
            style={styles.picker}
            mode="dropdown"
          >
            <Picker.Item label="N50,000" value="N50,000" />
            <Picker.Item label="N60,000" value="N60,000" />
            <Picker.Item label="N70,000" value="N70,000" />
            {/* <Picker.Item label="N70,000" value="N70,000" /> */}
            <Picker.Item label="N80,000" value="N80,000" />
            <Picker.Item label="N90,000" value="N90,000" />
            <Picker.Item label="N100,000" value="N100,000" />
            <Picker.Item label="N120,000" value="N120,000" />
            <Picker.Item label="N150,000" value="N150,000" />
            <Picker.Item label="N200,000" value="N200,000" />
            <Picker.Item label="N250,000" value="N250,000" />
            <Picker.Item label="N300,000" value="N300,000" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Request</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#1c1c1e',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 6,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  androidPickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
    height: 60, // helps Picker show on Android
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#1877f2',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export { CFulltime };
