import * as React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, Image, Linking, Button } from 'react-native';
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


function HousehelpDetail({ route }) {
  const { househelp } = route.params;

  return (
    <ScrollView>
    <Header />

  
    <View style={styles2.container}>
      <Cmenu navigation={navigation} />
      <Image source={{ uri: househelp.url }} style={styles2.image} />
      <Text style={styles2.name}>{househelp.name}</Text>
      <Text style={styles2.info}>📧 {househelp.email}</Text>
      <Text style={styles2.info}>📞 {househelp.phonenumber}</Text>
      <Text style={styles2.info}>📍 {househelp.address}, {househelp.state}</Text>
      <Text style={styles2.info}>🛠️ {JSON.parse(househelp.selectedJobs).join(", ")}</Text>
      <Text style={styles2.info}>💼 Job Experience: {househelp.experience}</Text>
      <Text style={styles2.info}>👨‍👩‍👧‍👦 Availability: {househelp.availability}</Text>
      <Text style={styles2.info}>💰 Rate: {househelp.rate}</Text>
      {/* <Text style={styles2.info}>📅 Last Updated: {new Date(househelp.updatedAt.seconds * 1000).toLocaleDateString()}</Text> */}
      <Text style={styles2.contact} onPress={() => Linking.openURL(`tel:${househelp.phonenumber}`)}>Call</Text>
    </View>
    </ScrollView>
  );
}

const styles2 = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  contact: {
    fontSize: 18,
    color: '#28a745',
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});




export { HousehelpList, HousehelpDetail };
