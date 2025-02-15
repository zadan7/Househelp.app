import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, Alert, TextInput, Image } from 'react-native';
import { Header } from "../component/Header"
import { Footer } from  "../component/Footer"
import NigerianStateAndLGASelector from '../component/NigerianStateAndLGASelector';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

// import { launchImageLibrary } from 'expo-image-picker';
import * as Permissions from 'expo-permissions';


function HSignup({ navigation }) {
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('');
  const [lga, setLGA] = useState('');
  const [facePicture, setFacePicture] = useState(null); // To store selected image
  const [errors, setErrors] = useState({});
  const [location ,setLocation]=useState(null)
  const [loading, setLoading] = useState(true); // Loading state for location
  

  // Request permission for camera and media library access
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera and photo library access is needed for this feature.');
      }
    };
    requestPermissions();

    (async () => {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            setLoading(false);
            return;
          }
    
          const currentLocation = await Location.getCurrentPositionAsync({});
          setLocation(currentLocation.coords);
          setLoading(false); // Stop loading once location is available
          console.log(currentLocation.coords)
          
        })();

        console.log(location)
  }, []);

  const validateInputs = () => {
    const newErrors = {};
    if (!firstname.trim()) newErrors.firstname = 'First name is required.';
    if (!lastname.trim()) newErrors.lastname = 'Last name is required.';
    if (!phone.trim() || !/^\d{10,15}$/.test(phone)) newErrors.phone = 'Phone number must be 10-15 digits.';
    if (!address.trim()) newErrors.address = 'Address is required.';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format.';
    if (!state.trim()) newErrors.state = 'State is required.';
    if (!lga.trim()) newErrors.lga = 'LGA is required.';
    if (!facePicture) newErrors.facePicture = 'Face picture is required.';
    if (location ===null) newErrors.location = 'location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDone = () => {
    console.log(location)
    if (validateInputs()) {
      Alert.alert(
        'Success',
        `Form submitted successfully!\n\nName: ${firstname} ${lastname}\nPhone: ${phone}\nAddress: ${address}\nEmail: ${email}\nState: ${state}\nLGA: ${lga} \nLatitude: ${location.latitude}  \nlongitude: ${location.longitude}`
      );  
    
      console.log(firstname, lastname, state, lga);
    } else {
      Alert.alert('Validation Failed', 'Please correct the highlighted fields.');
      console.log(firstname, lastname, state, lga);
    }
  };

  const selectFacePicture = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,  // Updated approach
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
  
    if (!result.cancelled) {
      console.log(result.assets[0].uri)
      setFacePicture(result.assets[0].uri); // Sets the selected image URI to state
    }
  };
  
  return (
    <ScrollView>
      <View style={styles.container}>
        <Header navigation={navigation} />
        <Text style={styles.title}>Enter your Personal Information</Text>

        <View style={styles.formContainer}>
        {/* <Text style={styles.title}>{location.lat}, {location.long}</Text> */}

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Firstname</Text>
            <TextInput
              style={[styles.input, errors.firstname && styles.errorInput]}
              value={firstname}
              onChangeText={(text) => {
                setFirstName(text);
                if (errors.firstname) setErrors((prev) => ({ ...prev, firstname: undefined }));
              }}
            />
            {errors.firstname && <Text style={styles.errorText}>{errors.firstname}</Text>}
          </View>

          {/* Lastname Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Lastname</Text>
            <TextInput
              style={[styles.input, errors.lastname && styles.errorInput]}
              value={lastname}
              onChangeText={(text) => {
                setLastName(text);
                if (errors.lastname) setErrors((prev) => ({ ...prev, lastname: undefined }));
              }}
            />
            {errors.lastname && <Text style={styles.errorText}>{errors.lastname}</Text>}
          </View>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Enter your phone number</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.errorInput]}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          {/* Address Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Enter your address</Text>
            <TextInput
              style={[styles.input, errors.address && styles.errorInput]}
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
              }}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Enter your email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.errorInput]}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              keyboardType="email-address"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* State and LGA Selector */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Select your State and LGA</Text>
            <NigerianStateAndLGASelector
              onStateChange={(selectedState) => {
                setState(selectedState);
                if (errors.state) setErrors((prev) => ({ ...prev, state: undefined }));
              }}
              onLGAChange={(selectedLGA) => {
                setLGA(selectedLGA);
                if (errors.lga) setErrors((prev) => ({ ...prev, lga: undefined }));
              }}
            />
            {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
            {errors.lga && <Text style={styles.errorText}>{errors.lga}</Text>}
          </View>

          {/* Face Picture Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Upload Face Picture</Text>
            <Pressable onPress={selectFacePicture} style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>Select Picture</Text>
            </Pressable>
            {facePicture && (
              <Image source={{ uri: facePicture }} style={styles.imagePreview} />
            )}
            {errors.facePicture && <Text style={styles.errorText}>{errors.facePicture}</Text>}
          </View>

          {/* Submit Button */}
          <Pressable onPress={handleDone} style={styles.doneButton}>
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </View>
        <Footer />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    height: 'auto',
  },
  title: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  formContainer: {
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: 'green',
    borderRadius: 10,
    padding: 20,
  },
  label: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 5,
  },
  inputContainer: {
    width: "90%",
    padding: 10,
  },
  input: {
    padding: 10,
    borderColor: 'green',
    borderWidth: 1,
    borderRadius: 5,
    textAlign: 'center',
    marginBottom: 10,
    width: "100%",
  },
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  doneButton: {
    backgroundColor: 'green',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 80,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: 'lightgray',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: 'black',
    fontSize: 16,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 10,
  }
});

export {HSignup} ;
