import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
// import { collection, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import { Hmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import Loader from '../../component/Loader';

const Hfulltime = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [househelp, setHousehelp] = useState({});
  const [isloading, setisLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    const fetchHousehelpData = async () => {
      const househelpData = await AsyncStorage.getItem('househelpdata');
      const parsedHousehelp = JSON.parse(househelpData);
      console.log('Househelp data: ', parsedHousehelp);
      setHousehelp(parsedHousehelp);
    };
    fetchHousehelpData();
  }, []);
  const fetchFulltimeJobs = async () => {
    setisLoading(true);
    try {
      const querySnapshot = await db.collection('fulltimeRequest').get();
      const jobList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filteredJobs = jobList.filter((job) => {
        const alreadyApplied = job.acceptedHelpers?.some(
          (helper) => helper.id === househelp.id
        );
        return !alreadyApplied;
      });

      setJobs(filteredJobs);
      setisLoading(false);
    } catch (error) {
      console.error('Error fetching full-time jobs: ', error);
    } finally {
      setisLoading(false);
    }
  };
  useEffect(() => {
    const fetchFulltimeJobs = async () => {
      setisLoading(true);
      try {
        const querySnapshot = await db.collection('fulltimeRequest').get();
        const jobList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

    const filteredJobs = jobList.filter((job) => {
  // 1. Defend against missing local data: If househelp or its ID isn't ready, don't crash
  if (!househelp || !househelp.id) {
    return true; // Keep the jobs listed until data resolves, or false to hide them
  }

  // 2. Defend against missing database array fields
  const acceptedHelpersArray = Array.isArray(job.acceptedHelpers) ? job.acceptedHelpers : [];

  const alreadyApplied = acceptedHelpersArray.some((helper) => {
    // 3. Defend against corrupt, incomplete, or broken helper objects in the array
    return helper && helper.id === househelp.id;
  });

  // Return the jobs they haven't applied to yet
  return !alreadyApplied;
});
       

        setJobs(filteredJobs);
      } catch (error) {
        console.error('Error fetching full-time jobs: ', error);
      } finally {
        setisLoading(false);
      }
    };

    if (househelp.lga) {
      fetchFulltimeJobs();
    }
  }, [househelp.lga]);

  const applyJob = async (jobId) => {
    setAppliedJobs((prevState) => [...prevState, jobId]);

    try {
      await db.collection('fulltimeRequest').doc(jobId).update({
        status: 'applied',
        acceptedHelpers: firestore.FieldValue.arrayUnion(househelp) // Direct object, not nested
      });
      console.log('Job application submitted successfully!');
      fetchFulltimeJobs(); // Refresh the job list after applying
    } catch (error) {
      console.error('Error submitting job application: ', error);
    }
  };

  const renderJobCard = ({ item }) => (
    <View style={styles.jobCard}>
      <View style={styles.cardHeader}>
        <View style={styles.headerItem}>
          <Text style={styles.headerLabel}>Location</Text>
          <Text style={styles.headerValue}>
            {item.clientData.lga}, {item.clientData.state}
          </Text>
        </View>
        <View style={styles.headerItem}>
          <Text style={styles.headerLabel}>Salary</Text>
          <Text style={styles.headerValue}>₦{item.salary}</Text>
        </View>
      </View>

      <View style={styles.profileSection}>
        <Image
          source={{ uri: item.clientData.facepicture || 'https://via.placeholder.com/50' }}
          style={styles.clientImage}
        />
        <Text style={styles.jobType}>{item.requestType}</Text>
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.jobLabel}>Apartment Size:</Text>
        <Text style={styles.jobValue}>{item.clientData.apartmentsize}</Text>

        <Text style={styles.jobLabel}>Description:</Text>
        <Text style={styles.jobValue}>{item.description}</Text>

        <Text style={styles.jobLabel}>Chores:</Text>
        <Text style={styles.jobValue}>{item.chores.join(', ')}</Text>

        <Text style={styles.jobLabel}>Number of Kids:</Text>
        <Text style={styles.jobValue}>{item.kidsnum}</Text>

        <Text style={styles.jobLabel}>Secondary Provision:</Text>
        <Text style={styles.jobValue}>{item.secondaryProvision}</Text>

        <Text style={styles.jobLabel}>Address:</Text>
        <Text style={styles.jobValue}>{item.clientData.address}</Text>

        {item.closingTime !== "" && (
  <View>
    <Text style={styles.jobLabel}>Resumption Time: {item.resuptionTime}</Text>
    <Text style={styles.jobLabel}>Closing Time: {item.closingTime}</Text>
  </View>
)}




        <Text style={styles.jobValue}>{item.clientData.address}</Text>
      </View>

      <TouchableOpacity
        style={styles.acceptButton}
        onPress={() => applyJob(item.id)}
        disabled={appliedJobs.includes(item.id)}
      >
        <Text style={styles.acceptButtonText}>
          {appliedJobs.includes(item.id) ? 'Applied' : 'Apply'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (isloading) {
    return (
      <View style={styles.container}>
        <Loader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header2 />
      <Hmenu navigation={navigation} />
      {jobs.length > 0 && (
  <Text style={styles.header}>Available Full-time Jobs</Text>
)}

<FlatList
  contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
  data={jobs}
  renderItem={renderJobCard}
  keyExtractor={(item) => item.id}
  ListEmptyComponent={
    <Text style={styles.header}>No Available Full-time Jobs Yet</Text>
  }
/>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#343a40',
  },
  jobCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerItem: {
    flex: 1,
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  headerValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  clientImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  jobType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#28a745',
  },
  detailSection: {
    marginTop: 10,
  },
  jobLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  jobValue: {
    fontSize: 15,
    color: '#444',
    marginBottom: 8,
  },
  acceptButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export { Hfulltime };
