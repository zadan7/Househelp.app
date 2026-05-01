import * as React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, Image, Linking, Button,TouchableOpacity } from 'react-native';
import { Header } from '../../component/Header';
import { db } from '../../pages/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import NigerianStateAndLGASelector from '../../component/NigerianStateAndLGASelector';
import { Cmenu } from '../../component/Menu';

function HousehelpList({ navigation }) {
  const [househelps, setHousehelps] = useState([]);
  const [filteredHousehelps, setFilteredHousehelps] = useState([]);
  const [locationFilter, setLocationFilter] = useState('Lagos'); // Filter by state
  const [addressFilter, setAddressFilter] = useState('Ojo'); // Filter by LGA or address

  // Fetch househelps data from Firestore
  useEffect(() => {
    const fetchHousehelps = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'househelps'));
        const househelpsList = querySnapshot.docs.map(doc => doc.data());
        setHousehelps(househelpsList);
        setFilteredHousehelps(househelpsList);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    fetchHousehelps();
  }, []);

  // Filter househelps based on location and address
  const filterHousehelps = () => {
    const filtered = househelps.filter(househelp => {
      const location = JSON.parse(househelp.location); // Parse the location field
      const isInLocation = househelp.state.toLowerCase() === locationFilter.toLowerCase();
      const isInAddress = househelp.lga.toLowerCase().includes(addressFilter.toLowerCase());
      return isInLocation && isInAddress;
    });
    setFilteredHousehelps(filtered);
  };

  // Handler for state and LGA change
  const handleStateChange = (state) => {
    setLocationFilter(state);
    filterHousehelps(); // Apply filter on state change
  };

  const handleLGAChange = (lga) => {
    setAddressFilter(lga);
    filterHousehelps(); // Apply filter on LGA change
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header navigation={navigation} />
      <Cmenu navigation={navigation} />

      {/* <View style={styles.filtersContainer}>
        <NigerianStateAndLGASelector 
          onStateChange={handleStateChange}
          onLGAChange={handleLGAChange}
        />
        <Button title="Apply Filters" onPress={filterHousehelps} />
      </View> */}

<View style={styles.househelpContainer}>
  
        <Text style={styles.subtitle}>Househelps List</Text>
        {filteredHousehelps.length > 0 ? (
          filteredHousehelps.map((househelp, index) => (
            <Pressable 
              key={index} 
              style={styles.card} 
              onPress={() => navigation.navigate('HousehelpDetail', { househelp })}
            >
              <Image source={{ uri: househelp.url }} style={styles.image} />
              <View style={styles.details}>
                <Text style={styles.name}>{househelp.name}</Text>
                <Text style={styles.info}>📧 {househelp.email}</Text>
                <Pressable onPress={() => Linking.openURL(`tel:${househelp.phonenumber}`)}>
                  <Text style={styles.info}>📞 {househelp.phonenumber}</Text>
                </Pressable>
                <Text style={styles.info}>📍 {househelp.address}, {househelp.state}</Text>
                <Text style={styles.info}>🛠️ {JSON.parse(househelp.selectedJobs).join(", ")}</Text>
              </View>
            </Pressable>
          ))
        ) : (
          <Text style={styles.noDataText}>No househelps found for the selected filters.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    paddingBottom: 20,
  },
  househelpContainer: {
    marginTop: 20,
    width: '90%',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#28a745',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  info: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  noDataText: {
    textAlign: 'center',
    color: '#777',
    fontSize: 16,
    marginTop: 20,
  },
  filtersContainer: {
    width: '90%',
    marginTop: 20,
    alignItems: 'center',
  },
});


function HousehelpDetail({ route, navigation }) {
  const { househelp } = route.params;

  // Hardcoded average rating (to be dynamic later)
  const averageRating = 3.2;

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <Text style={styles2.stars}>
        {'★'.repeat(fullStars)}
        {hasHalfStar ? '⯪' : ''}
        {'☆'.repeat(emptyStars)}
        <Text style={styles2.starNumber}> ({rating.toFixed(1)})</Text>
      </Text>
    );
  };

  return (
    <ScrollView style={{ backgroundColor: '#f1f3f6' }}>
      <Header />
      <Cmenu navigation={navigation} />

      <View style={styles2.card}>
        <Image source={{ uri: househelp.url }} style={styles2.image} />
        <Text style={styles2.name}>{househelp.name}</Text>
        <Text style={styles2.subText}>{househelp.employmentType} | {househelp.gender}</Text>
        {renderStars(averageRating)}
      </View>

      <View style={styles2.infoSection}>
        <Text style={styles2.sectionHeader}>📋 Personal Info</Text>
        <Text style={styles2.info}>📧 {househelp.email}</Text>
        <Text style={styles2.info}>📞 {househelp.phonenumber}</Text>
        <Text style={styles2.info}>🎂 {househelp.dateOfBirth}</Text>
        <Text style={styles2.info}>🆔 Code: {househelp.code}</Text>
        <Text style={styles2.info}>📍 {househelp.address}, {househelp.lga}, {househelp.state}</Text>
      </View>

      <View style={styles2.infoSection}>
        <Text style={styles2.sectionHeader}>💼 Work Details</Text>
        <Text style={styles2.info}>🛠️ Jobs: {JSON.parse(househelp.selectedJobs).join(', ')}</Text>
        <Text style={styles2.info}>📅 Experience: {househelp.experience} years</Text>
        <Text style={styles2.info}>📆 Registered: {househelp.createdAt?.toDate().toDateString()}</Text>
      </View>

      <View style={styles2.infoSection}>
        <Text style={styles2.sectionHeader}>📍 Location</Text>
        <Text style={styles2.info}>Accuracy: {JSON.parse(househelp.location).accuracy} meters</Text>
        <Text style={styles2.info}>
          Coordinates: ({JSON.parse(househelp.location).latitude}, {JSON.parse(househelp.location).longitude})
        </Text>
      </View>

      <TouchableOpacity style={styles2.callButton} onPress={() => Linking.openURL(`tel:${househelp.phonenumber}`)}>
        <Text style={styles2.callText}>📞 Call {househelp.name}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles2 = StyleSheet.create({
  card: {
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 16,
    elevation: 4,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#28a745',
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  stars: {
    fontSize: 22,
    color: '#f4c542',
    marginVertical: 10,
  },
  starNumber: {
    fontSize: 16,
    color: '#444',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
  },
  callButton: {
    backgroundColor: '#28a745',
    marginHorizontal: 60,
    marginBottom: 30,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 3,
  },
  callText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});




export { HousehelpList, HousehelpDetail };
