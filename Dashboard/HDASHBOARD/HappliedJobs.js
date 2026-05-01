import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import { Hmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const HappliedJobs = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [househelp, setHousehelp] = useState({});
  const [loading, setLoading] = useState(true);
  const [fulltimeJobs, setFulltimeJobs] = useState([]);
  const [partimeJobs, setPartimeJobs] = useState([]);

  useEffect(() => {
    const fetchHousehelpData = async () => {
      const househelpData = await AsyncStorage.getItem('househelpdata');
      const parsedHousehelp = JSON.parse(househelpData);
      setHousehelp(parsedHousehelp);
    };
    fetchHousehelpData();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const fulltimeSnapshot = await getDocs(collection(db, 'fulltimeRequest'));
        const partimeSnapshot = await getDocs(collection(db, 'partimeRequest'));

        const fulltimeList = fulltimeSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const partimeList = partimeSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filteredFulltime = fulltimeList.filter(job =>
          job.acceptedHelpers?.some(helper => helper.id === househelp.id)
        );
        console.log('Filtered Fulltime Jobs:', filteredFulltime[0]);

        const filteredPartime = partimeList.filter(job =>
          job.acceptedHelpers?.some(helper => helper.id === househelp.id)
        );
        console.log('Filtered Partime Jobs:', filteredPartime[0]);

        setFulltimeJobs(filteredFulltime);
        setPartimeJobs(filteredPartime);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (househelp.id) {
      fetchJobs();
    }
  }, [househelp]);

  const handlePickerChange = (value) => {
    setSelectedType(value);
    if (value === 'fulltime') {
      setJobs(fulltimeJobs);
    } else if (value === 'partime') {
      setJobs(partimeJobs);
    } else {
      setJobs([]);
    }
  };

  return (
    <View style={styles.container}>
      <Header2 />
      <Hmenu navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Applied Jobs</Text>

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Filter by Job Type:</Text>
          <Picker
            selectedValue={selectedType}
            onValueChange={handlePickerChange}
            style={styles.picker}
            itemStyle={{ fontSize: 16 }}
          >
            <Picker.Item label="Full-time Jobs" value="fulltime" />
            <Picker.Item label="Part-time Jobs" value="partime" />
          </Picker>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 30 }} />
        ) : jobs.length === 0 ? (
          <Text style={styles.emptyText}>No applied jobs found in this category.</Text>
        ) : (
          jobs.map((job) => (
            <View key={job.id} style={styles.jobCard}>
              <Image
                source={{ uri: job.clientData?.facepicture }}
                style={{ width: 60, height: 60, borderRadius: 30, marginBottom: 10 }}
              />
              <Text style={styles.jobTitle}>{job.requestType || 'Househelp Job'}</Text>
              <Text style={styles.jobAmount}>₦{job.salary || job.totalCost || 'N/A'}</Text>
              <Text style={styles.jobInfo}>📍 {job.clientData.state +" "+   job.clientData.lga +" "+ job.clientData.address || 'N/A'}</Text>
              <Text style={styles.jobInfo}>🗓️ {job.date || job.createdAt?.toDate().toDateString() || 'N/A'}</Text>
              <Text style={styles.jobInfo}>⏰ {job.time || 'N/A'}</Text>
              <Text style={styles.jobInfo}>👤 {job.clientData.name || 'N/A'}</Text>
              <TouchableOpacity
                style={styles.acceptButton}
             
              >
                <Text style={styles.acceptButtonText}>{job.status}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollContainer: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 20,
    color: '#111',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  picker: {
    height: "auto",
    width: '100%',
  },
  jobCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  jobAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
  },
  jobInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  acceptButton: {
    marginTop: 12,
    backgroundColor: '#ccaa00',
    paddingVertical: 10, 
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 15,
    marginTop: 30,
  },
});

export { HappliedJobs };
