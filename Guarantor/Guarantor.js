import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, Alert, TextInput, Image } from 'react-native';
import { Header } from "../component/Header";
import { Footer } from "../component/Footer";
import NigerianStateAndLGASelector from '../component/NigerianStateAndLGASelector';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Guarantor({ navigation }) {
  const [Gfirstname, setFirstName] = useState('');
  const [Glastname, setLastName] = useState('');
  const [Gphone, setPhone] = useState('');
  const [Gaddress, setAddress] = useState('');
  const [Gemail, setEmail] = useState('');
  const [Gstate, setState] = useState('');
  const [Glga, setLGA] = useState('');
  const [GfacePicture, setFacePicture] = useState(null);
  const [location, setLocation] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

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
        setErrors((prev) => ({ ...prev, location: 'Permission to access location was denied' }));
        setLoading(false);
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      setLoading(false);
    })();
  }, []);

  const validateInputs = () => {
    const newErrors = {};
    if (!Gfirstname.trim()) newErrors.Gfirstname = 'First name is required.';
    if (!Glastname.trim()) newErrors.Glastname = 'Last name is required.';
    if (!Gphone.trim() || !/^\d{10,15}$/.test(Gphone)) newErrors.Gphone = 'Phone number must be 10-15 digits.';
    if (!Gaddress.trim()) newErrors.Gaddress = 'Address is required.';
    if (!Gemail.trim() || !/\S+@\S+\.\S+/.test(Gemail)) newErrors.Gemail = 'Invalid email format.';
    if (!Gstate.trim()) newErrors.Gstate = 'State is required.';
    if (!Glga.trim()) newErrors.Glga = 'LGA is required.';
    if (!GfacePicture) newErrors.GfacePicture = 'Face picture is required.';
    if (!location) newErrors.location = 'Location is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDone = () => {
    if (validateInputs()) {
      Alert.alert(
        'Success',
        `Form submitted successfully!\n\nName: ${Gfirstname} ${Glastname}\nPhone: ${Gphone}\nAddress: ${Gaddress}\nEmail: ${Gemail}\nState: ${Gstate}\nLGA: ${Glga}\nLatitude: ${location?.latitude}\nLongitude: ${location?.longitude}`
      );
    } else {
      Alert.alert('Validation Failed', 'Please correct the highlighted fields.');
    }
  };

  const selectFacePicture = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setFacePicture(result.assets[0].uri);
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Header navigation={navigation} />
        <Text style={styles.title}>Enter your Personal Information</Text>
        <View style={styles.formContainer}>
          {/* Input Fields */}
          <TextInput placeholder="First Name" value={Gfirstname} onChangeText={setFirstName} style={styles.input} />
          <TextInput placeholder="Last Name" value={Glastname} onChangeText={setLastName} style={styles.input} />
          <TextInput placeholder="Phone" value={Gphone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
          <TextInput placeholder="Address" value={Gaddress} onChangeText={setAddress} style={styles.input} />
          <TextInput placeholder="Email" value={Gemail} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
          <NigerianStateAndLGASelector onStateChange={setState} onLGAChange={setLGA} />
          <Pressable onPress={selectFacePicture} style={styles.uploadButton}><Text>Select Picture</Text></Pressable>
          {GfacePicture && <Image source={{ uri: GfacePicture }} style={styles.imagePreview} />}
          <Pressable onPress={handleDone} style={styles.doneButton}><Text>Done</Text></Pressable>
        </View>
        <Footer />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center' },
  title: { color: 'green', fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
  formContainer: { width: '80%', alignItems: 'center', marginTop: 20, padding: 20 },
  input: { padding: 10, borderWidth: 1, borderRadius: 5, width: '100%', marginBottom: 10 },
  uploadButton: { backgroundColor: 'lightgray', padding: 10, borderRadius: 5, marginBottom: 10 },
  doneButton: { backgroundColor: 'green', padding: 10, borderRadius: 5 },
  imagePreview: { width: 100, height: 100, marginTop: 10, borderRadius: 10 }
});

export { Guarantor };
