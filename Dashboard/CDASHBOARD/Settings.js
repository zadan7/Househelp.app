import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Alert, Button } from 'react-native';
import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { storage, db } from '../../pages/firebase'; // Import Firebase storage and db
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';

const Csettings = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({});
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await AsyncStorage.getItem('clientdata');
        if (data) {
          const parsedData = JSON.parse(data);
          setUser(parsedData);
          setUpdatedUser(parsedData); // Initialize updatedUser state with fetched data
        }
      } catch (error) {
        console.error('Error fetching client data: ', error);
      }
    };
    fetchData();
  }, []);

  // Function to handle image selection
  const pickImage = (imageType) => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        return;
      }

      const source = response.assets[0];
      uploadImageToFirebase(source.uri, imageType);
    });
  };

  // Function to upload image to Firebase Storage
  const uploadImageToFirebase = async (uri, imageType) => {
    setLoading(true);
    try {
      const imageRef = ref(storage, `clients/${user.id}/${imageType}`);
      const response = await fetch(uri);
      const blob = await response.blob();
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);

      // Update the Firestore document with the new image URL
      const clientRef = doc(db, 'clients', user.id);
      await updateDoc(clientRef, {
        [imageType]: downloadURL,
      });

      // Update user data locally and in AsyncStorage
      setUpdatedUser(prevUser => ({ ...prevUser, [imageType]: downloadURL }));
      await AsyncStorage.setItem('clientdata', JSON.stringify({ ...user, [imageType]: downloadURL }));

      Alert.alert('Success', 'Image updated successfully!');
    } catch (error) {
      console.error('Error uploading image: ', error);
      Alert.alert('Error', 'Failed to update image.');
    } finally {
      setLoading(false);
    }
  };

  // Handle field changes
  const handleInputChange = (field, value) => {
    setUpdatedUser(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  // Function to save updated user data to Firebase and AsyncStorage
  const saveData = async () => {
    try {
      const clientRef = doc(db, 'clients', user.id);
      await updateDoc(clientRef, updatedUser);

      await AsyncStorage.setItem('clientdata', JSON.stringify(updatedUser));
      setUser(updatedUser);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile: ', error);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Header2 />
        <Cmenu navigation={navigation} />
        <Text style={styles.header}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header2 />
      {/* Floating Menu */}
      <Cmenu navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <Text style={styles.header}>Profile</Text>

        <View style={styles.profileContainer}>
          <View style={styles.profileHeader}>
            <Image source={{ uri: user.profilePic }} style={styles.profilePic} />
            <View style={styles.profileInfo}>
              <TextInput
                style={styles.input}
                value={updatedUser.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Name"
              />
              <TextInput
                style={styles.input}
                value={updatedUser.email}
                onChangeText={(text) => handleInputChange('email', text)}
                placeholder="Email"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                value={updatedUser.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                placeholder="Phone"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.imageSection}>
            <Text style={styles.sectionHeader}>Update Images</Text>

            <TouchableOpacity style={styles.imageButton} onPress={() => pickImage('profilePic')}>
              <Text style={styles.imageButtonText}>Change Profile Picture</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.imageButton} onPress={() => pickImage('apartmentInside')}>
              <Text style={styles.imageButtonText}>Change Apartment Inside Image</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.imageButton} onPress={() => pickImage('houseFront')}>
              <Text style={styles.imageButtonText}>Change House Front Image</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.sectionHeader}>Personal Details</Text>

            <View style={styles.detailsRow}>
              <Text style={styles.label}>Address:</Text>
              <TextInput
                style={styles.input}
                value={updatedUser.address}
                onChangeText={(text) => handleInputChange('address', text)}
                placeholder="Address"
              />
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.label}>Apartment Type:</Text>
              <TextInput
                style={styles.input}
                value={updatedUser.apartmentType}
                onChangeText={(text) => handleInputChange('apartmentType', text)}
                placeholder="Apartment Type"
              />
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.label}>LGA:</Text>
              <TextInput
                style={styles.input}
                value={updatedUser.lga}
                onChangeText={(text) => handleInputChange('lga', text)}
                placeholder="LGA"
              />
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.label}>State:</Text>
              <TextInput
                style={styles.input}
                value={updatedUser.state}
                onChangeText={(text) => handleInputChange('state', text)}
                placeholder="State"
              />
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.label}>Location:</Text>
              <TextInput
                style={styles.input}
                value={`Lat: ${updatedUser.location.latitude}, Lon: ${updatedUser.location.longitude}`}
                editable={false}
              />
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.label}>Account Created:</Text>
              <Text style={styles.detail}>
                {new Date(user.createdAt).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.saveButtonContainer}>
          <Button title="Save Changes" onPress={saveData} disabled={loading} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f3f5',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#495057',
  },
  scrollViewContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  profileContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
    borderWidth: 3,
    borderColor: '#007bff',
  },
  profileInfo: {
    flex: 1,
  },
  input: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
    width: 120,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 15,
  },
  saveButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  imageButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export { Csettings };
