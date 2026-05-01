import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Hmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../pages/firebase';

const Hprofile = ({ navigation }) => {
  const [househelp, setHousehelp] = useState(null);
  const [Guarantor, setGuarantor] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await AsyncStorage.getItem('househelpdata');
      if (data) {
        setHousehelp(JSON.parse(data));
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!househelp?.code) return;

    let isMounted = true;

    const fetchGuarantor = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'guarantors'));
        const guarantors = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const matched = guarantors.find(g => g.code === househelp.code);
        if (matched && isMounted) {
          setGuarantor(matched);
          console.log('Guarantor:', matched);
        }
      } catch (error) {
        console.error('Error fetching guarantor:', error);
      }
    };

    fetchGuarantor();

    return () => {
      isMounted = false;
    };
  }, [househelp]);

  if (!househelp) {
    return (
      <View style={styles.container}>
        <Header2 />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header2 />
      <Hmenu navigation={navigation} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>My Profile</Text>
        <View style={styles.profileCard}>
          <Image
            source={{ uri: househelp.url || 'https://via.placeholder.com/100' }}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{househelp.name}</Text>
          <Text style={styles.info}>Email: {househelp.email}</Text>
          <Text style={styles.info}>Phone: {househelp.phonenumber}</Text>
          <Text style={styles.info}>Gender: {househelp.gender}</Text>
          <Text style={styles.info}>Date of Birth: {househelp.dateOfBirth}</Text>
          <Text style={styles.info}>LGA: {househelp.lga}</Text>
          <Text style={styles.info}>State: {househelp.state}</Text>
          <Text style={styles.info}>code: {househelp.code}</Text>

          <Text style={styles.info}>Address: {househelp.address}</Text>
          <Text style={styles.info}>Employment Type: {househelp.employmentType}</Text>
          <Text style={styles.info}>Years of Experience: {househelp.experience}</Text>
          <Text style={styles.info}>
            Selected Jobs: {JSON.parse(househelp.selectedJobs).join(', ')}
          </Text>
          <Text style={styles.info}>
           {Guarantor ? `Guarantor Code: ${Guarantor.code}` : 'No Guarantor'}
          </Text>
        </View>

        {Guarantor && (
          <View style={styles.profileCard}>
            <Text style={styles.sectionHeader}>Guarantor Information</Text>
            <Image
              source={{ uri: Guarantor.facePicture || 'https://via.placeholder.com/100' }}
              style={styles.profileImage}
            />
            <Text style={styles.name}>
              {Guarantor.firstName} {Guarantor.lastName}
            </Text>
            <Text style={styles.info}>Email: {Guarantor.email}</Text>
            <Text style={styles.info}>Phone: {Guarantor.phone}</Text>
            <Text style={styles.info}>Relationship: {Guarantor.relationship}</Text>
            <Text style={styles.info}>Occupation: {Guarantor.occupation}</Text>
            <Text style={styles.info}>NIN Number: {Guarantor.ninNumber}</Text>
            <Text style={styles.info}>State: {Guarantor.state}</Text>
            <Text style={styles.info}>LGA: {Guarantor.lga}</Text>
            <Text style={styles.info}>Address: {Guarantor.address}</Text>

            <Text style={styles.subSectionHeader}>Company Details</Text>
            <Text style={styles.info}>Name: {Guarantor.companyName}</Text>
            <Text style={styles.info}>Address: {Guarantor.companyAddress}</Text>

            <Text style={styles.info}>ID Image:</Text>
            <Image
              source={{ uri: Guarantor.idImage || 'https://via.placeholder.com/100' }}
              style={styles.idImage}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#343a40',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#28a745',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: '#333',
    marginVertical: 4,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007bff',
    textAlign: 'center',
  },
  subSectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6c757d',
    marginTop: 15,
    marginBottom: 5,
  },
  idImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: 10,
  },
});

export { Hprofile };
