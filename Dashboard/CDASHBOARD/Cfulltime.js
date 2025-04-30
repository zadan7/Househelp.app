import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, Pressable,Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../pages/firebase';
import { addDoc, collection, Timestamp, updateDoc,doc } from 'firebase/firestore';
import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import { Picker } from '@react-native-picker/picker';
import { arrayUnion } from 'firebase/firestore';


// import {Modal} from 'react-native-modal';



const CFulltimelivein = ({ navigation }) => {
  const [client, setClient] = useState(null);
  const [description, setDescription] = useState('');
  const [chores, setChores] = useState('');
  const [salaryRange, setSalaryRange] = useState('N50,000');
  const [numberOfKids, setNumberOfKids] = useState('');
  const [secondaryProvision, setSecondaryProvision] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

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
      
    var fulltimeRequestdata=  await addDoc(collection(db, 'fulltimeRequest'),
       {
        // clientId: client.id,
        clientData: client,
        // clientName: client.firstname + ' ' + client.lastname,
        // clientPhone: client.phonenumber,
        // clientState: client.state,
        // clientLGA: client.lga,
        // clientAddress: client.address,

        requestType: 'fulltime-livein',
       description: description,
        secondaryProvision: secondaryProvision,
       salary: salaryRange,
       kidsnum: numberOfKids,
       chores:  chores.split(',').map(c => c.trim()),
        status: 'pending',
        createdAt: Timestamp.now(),
      });

      if (fulltimeRequestdata) {
        console.log('Document written with ID: ', fulltimeRequestdata.id);
        var  fulltimeRequestdataid = fulltimeRequestdata.id;
        console.log("fulltimeRequestdata", fulltimeRequestdataid);
        updateDoc(doc(db, 'fulltimeRequest', fulltimeRequestdata.id), {
          id: fulltimeRequestdataid,
        });

        setModalVisible(true);

      }
      

      // Alert.alert('Success', 'Your request has been submitted!');
      
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

        <Text style={styles.label}>Job Description : <Text style={{color:"red", fontSize:"15"}}>take your time to Describe exactly what you want from the househelp </Text></Text>
        <TextInput
          placeholder="Describe what the househelp will do"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { height: 100 }]}
          multiline={true}
         
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

<Text style={styles.label}>Secondary provision : <Text style={{color:"red", fontSize:"15"}}>Describe what you can provide for the househelp outside her salary e.g meals basic health care  </Text></Text>
        <TextInput
          placeholder="note that this is not complusory but it will help you get a better househelp"
          multiline={true}
          value={secondaryProvision}
          onChangeText={setSecondaryProvision}
          style={[styles.input, { height: 100 }]}
         
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

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Thank you for your request!</Text>
            <Text style={styles.modalText}>We have successfully received your submission. A househelp will get in touch soon.</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('cdashboard'); // Navigate to home or other page
              }}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};


const CFulltimeliveout = ({ navigation }) => {
  const [client, setClient] = useState(null);
  const [description, setDescription] = useState('');
  const [chores, setChores] = useState('');
  const [salaryRange, setSalaryRange] = useState('N50,000');
  const [numberOfKids, setNumberOfKids] = useState('');
  const [resumptionTime, setResumptionTime] = useState('');
  const [closingTime, setClosingTime] = useState('');

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
    if (
      !client ||
      !description ||
      !chores ||
      numberOfKids === '' ||
      !resumptionTime ||
      !closingTime
    ) {
      return Alert.alert('Incomplete Form', 'Please fill in all required fields.');
    }

    try {
    var fulltimeRequestdata=  await addDoc(collection(db, 'fulltimeRequest'), {
        clientData: client,
        requestType: 'fulltime-liveout',
        description: description,
        salary: salaryRange,
        kidsnum: numberOfKids,
        chores: chores.split(',').map(c => c.trim()),
        resumptionTime:resumptionTime,
        closingTime:closingTime,
        status: 'pending',
        createdAt: Timestamp.now(),
      });

      if (fulltimeRequestdata) {
        console.log('Document written with ID: ', fulltimeRequestdata.id);
       var  fulltimeRequestdataid = fulltimeRequestdata.id;
        console.log("fulltimeRequestdata", fulltimeRequestdataid);



              updateDoc(doc(db, 'fulltimeRequest-liveout', fulltimeRequestdata.id), {
                id: fulltimeRequestdataid,
              });
      }

    

      Alert.alert('Success', 'Your request has been submitted!');
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
        <Text style={styles.header}>Full-Time Live-Out Request</Text>

        <Text style={styles.label}>
          Job Description{' '}
          <Text style={{ color: 'red', fontSize: 15 }}>
            (Take your time to describe exactly what you want from the househelp)
          </Text>
        </Text>
        <TextInput
          placeholder="Describe what the househelp will do"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { height: 100 }]}
          multiline
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
        <View
          style={
            Platform.OS === 'android'
              ? styles.androidPickerWrapper
              : styles.pickerWrapper
          }
        >
          <Picker
            selectedValue={salaryRange}
            onValueChange={itemValue => setSalaryRange(itemValue)}
            style={styles.picker}
            mode="dropdown"
          >
            <Picker.Item label="N50,000" value="N50,000" />
            <Picker.Item label="N60,000" value="N60,000" />
            <Picker.Item label="N70,000" value="N70,000" />
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

        <Text style={styles.label}>Resumption Time</Text>
        <TextInput
          placeholder="Enter resumption time (e.g., 8:00 AM)"
          value={resumptionTime}
          onChangeText={setResumptionTime}
          style={styles.input}
        />

        <Text style={styles.label}>Closing Time</Text>
        <TextInput
          placeholder="Enter closing time (e.g., 5:00 PM)"
          value={closingTime}
          onChangeText={setClosingTime}
          style={styles.input}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Request</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};



const CFulltimeSelection = ({ navigation }) => {
  const [client, setClient] = useState(null);
  

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



  return (
    <View style={styles.container}>
      <Header2 />
      <Cmenu navigation={navigation} />

      <ScrollView
  contentContainerStyle={{
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: '#f4f6f8',
  }}
>
  <Text
    style={{
      fontSize: 26,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 30,
      color: '#1c1c1e',
    }}
  >
    Full-Time Selection
  </Text>

  <Pressable
    onPress={() => navigation.navigate('cfulltimelivein')}
    style={{
      backgroundColor: 'green',
      paddingVertical: 20,
      paddingHorizontal: 15,
      borderRadius: 12,
      marginBottom: 20,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }}
  >
    <Text style={{ fontSize: 18, fontWeight: '600', color: 'white' }}>
    Request Full-Time Live-In Househlp
    </Text>
  </Pressable>

  <Pressable
    onPress={() => navigation.navigate('cfulltimeliveout')}
    style={{
      backgroundColor: 'green',
      paddingVertical: 20,
      paddingHorizontal: 15,
      borderRadius: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }}
  >
    <Text style={{ fontSize: 18, fontWeight: '600', color: 'white' }}>
     Request  Full-Time Live-Out Househelp
    </Text>
  </Pressable>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
  },
  closeText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
});

export { CFulltimelivein,CFulltimeliveout ,CFulltimeSelection };






