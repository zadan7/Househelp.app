import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  Pressable,
  Linking,
} from 'react-native';
import { collection, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../pages/firebase';

import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const HcurrentJob = ({ route, navigation }) => {
  const jobdata = route.params.job; // Use the passed jobdata prop or set it to null
  const [confirmedJobs, setConfirmedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [househelpId, setHousehelpId] = useState('');
  const [clientData, setClientData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    const fetchHousehelp = async () => {
      const user = await AsyncStorage.getItem('househelpdata');
      if (user) {
        const parsed = JSON.parse(user);
        setHousehelpId(parsed.id);
      }
    };
    fetchHousehelp();
  }, []);

  useEffect(() => {
    if (!househelpId) return;

    const unsubscribe = onSnapshot(collection(db, 'partimeRequest'), (snapshot) => {
      const allJobs = snapshot.docs.map(doc => ({ id2: doc.id, ...doc.data() }));
      const filteredJobs = allJobs.filter(job =>
        job.status === 'confirmed' &&
        job.househelpId === househelpId 
        && job.jobid === jobdata.jobid
      );

      setConfirmedJobs(filteredJobs);

      if (filteredJobs.length > 0) {
        getClientData(filteredJobs[0].clientId);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [househelpId]);

  const getClientData = async (clientId) => {
    try {
      const clientRef = doc(db, 'clients', clientId);
      const docSnap = await getDoc(clientRef);
      if (docSnap.exists()) {
        setClientData(docSnap.data());
      }
    } catch (error) {
      console.error("Error fetching client data:", error);
    }
  };

  const openImage = (uri) => {
    setModalImage(uri);
    setModalVisible(true);
  };

  const startJob = async () => {
    try {
      // Update job status to 'in-progress' or any other relevant action
      // const jobRef = doc(db, 'partimeRequest', jobdata.jobid);
      // await updateDoc(jobRef, { status: 'in-progress' });
      // alert('Job has started!');
      console.log('Job started:', jobdata);
       navigation.navigate('hstartjob', (JSON.stringify(jobdata)));
    } catch (error) {
      console.error("Error starting job:", error);
    }
  };

  const callClient = () => {
    if (clientData?.phone) {
      Linking.openURL(`tel:${clientData.phone}`);
    }
  };

  const messageClient = () => {
    if (clientData?.phone) {
      Linking.openURL(`sms:${clientData.phone}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading confirmed jobs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header2 />
      <Cmenu navigation={navigation} />

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Text style={styles.title}>Confirmed Job & Client Info</Text>

        {confirmedJobs.length === 0 ? (
          <Text style={styles.noJob}>No confirmed jobs yet.</Text>
        ) : (
          confirmedJobs.map((job) => (
            <View key={job.id2} style={styles.card}>
              {clientData?.facepicture && (
                <TouchableOpacity onPress={() => openImage(clientData.facepicture)}>
                  <Image source={{ uri: clientData.facepicture }} style={styles.avatar} />
                </TouchableOpacity>
              )}

              <View style={styles.badge}><Text style={styles.badgeText}>CONFIRMED</Text></View>

              <Text style={styles.clientName}>{job.clientName}</Text>
              <Text style={styles.detail}>📞 {job.phone}</Text>
              <Text style={styles.detail}>🏠 {job.address}</Text>
              <Text style={styles.detail}>🏢 {job.apartmentType}</Text>
              <Text style={styles.detail}>🆔 {job.id2}</Text>
              <Text style={styles.detail}>💵 ₦{Number(job.totalCost).toLocaleString()}</Text>
              <Text style={styles.detail}>📅 {job.startDate}</Text>

              <Text style={styles.sectionTitle}>Chores</Text>
              {job.chores.map((chore, index) => (
                <Text key={index} style={styles.chore}>
                  • {chore.chore} — ₦{Number(chore.price).toLocaleString()} {chore.completed ? '✅' : ''}
                </Text>
              ))}

              {clientData && (
                <>
                  <Text style={styles.sectionTitle}>Client Info</Text>
                  <Text style={styles.detail}>✉️ {clientData.email}</Text>
                </>
              )}
               <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.clientButton} onPress={callClient}>
                  <Text style={styles.clientButtonText}>Call Client</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.clientButton} onPress={messageClient}>
                  <Text style={styles.clientButtonText}>Message Client</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.imageGrid}>
                {clientData?.insideview && (
                  <Pressable onPress={() => openImage(clientData.insideview)}>
                    <Image source={{ uri: clientData.insideview }} style={styles.extraImage} />
                    <Text style={styles.imageName}>Inside View</Text>
                  </Pressable>
                )}
                {clientData?.frontview && (
                  <Pressable onPress={() => openImage(clientData.frontview)}>
                    <Image source={{ uri: clientData.frontview }} style={styles.extraImage} />
                    <Text style={styles.imageName}>Front View</Text>
                  </Pressable>
                )}
              </View>

              {/* Start Job Button */}
              <TouchableOpacity style={styles.startJobButton} onPress={startJob}>
                <Text style={styles.startJobButtonText}>Start Job</Text>
              </TouchableOpacity>

              {/* Call and Message Buttons */}
             
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal for full image view */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalImageWrapper} onPress={() => setModalVisible(false)}>
            <Image source={{ uri: modalImage }} style={styles.modalImage} />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f4f7' },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  noJob: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 30,
    color: '#777',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  badge: {
    // alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
    alignSelf: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  clientName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  detail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  sectionTitle: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: '600',
    color: '#4CAF50',
  },
  chore: {
    fontSize: 15,
    color: '#444',
    marginLeft: 10,
    marginBottom: 2,
  },
  imageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 15,
  },
  extraImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  imageName: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    color: '#333',
  },
  startJobButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startJobButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  clientButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageWrapper: {
    width: screenWidth * 0.8,
    height: screenHeight * 0.8,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'contain',
  },
});

export { HcurrentJob };
