import React, { useState, useEffect } from "react";
import { Pressable, StyleSheet, Text, View, ScrollView, Alert, TextInput, Image, ActivityIndicator } from "react-native";
import { Header } from "../component/Header";
import { Footer } from "../component/Footer";
import NigerianStateAndLGASelector from "../component/NigerianStateAndLGASelector";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import {db} from "../pages/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import firebase from 'firebase/compat/app';

function Guarantor({ navigation }) {
  const [Gfirstname, setFirstName] = useState("");
  const [Glastname, setLastName] = useState("");
  const [Gphone, setPhone] = useState("");
  const [Gaddress, setAddress] = useState("");
  const [Gemail, setEmail] = useState("");
  const [Gstate, setState] = useState("");
  const [Glga, setLGA] = useState("");
  const [relationship, setRelationship] = useState("");
  const [occupation, setOccupation] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [ninNumber, setNinNumber] = useState("");
  const [idImage, setIdImage] = useState(null);
  const [GfacePicture, setFacePicture] = useState(null);
  const [Hname, setHname] = useState("");
  const [code, setcode] = useState("");
  const [data, setdata] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const selectPicture = async (setter) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled){
      setter(result.assets[0].uri);
      setFace(result.assets[0].uri)
      setFacePicture(result.assets[0].uri)
    } 
  };

  const uploadDataToFirestore = async (collectionName, data) => {
    try {
      await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
      });
      console.log("Data uploaded successfully!");
    } catch (error) {
      console.error("Error uploading data to Firestore:", error);
    }
  };
  useEffect(() => {
    const getdata = async () => {
      try {
        var hname = await AsyncStorage.getItem("hname"); 
        const storedCode = await AsyncStorage.getItem("code");
        setHname(hname);
        setcode(storedCode);
      } catch (error) {
        console.log(error);
      }
    };
    getdata();
    const requestPermissions = async () => {
      try {
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        if (mediaStatus !== "granted") {
          Alert.alert("Permission required", "Camera and photo library access is needed.");
        }
        if (locationStatus !== "granted") {
          setErrors((prev) => ({ ...prev, location: "Permission to access location was denied" }));
        }
      } catch (error) {
        console.error("Error requesting permissions:", error);
      } finally {
        setLoading(false);
      }
    };
    requestPermissions();
  }, []);

  const validateInputs = () => {
    const newErrors = {};
    if (!Gfirstname.trim()) newErrors.Gfirstname = "First name is required.";
    if (!Glastname.trim()) newErrors.Glastname = "Last name is required.";
    if (!Gphone.trim() || !/^\d{10,15}$/.test(Gphone)) newErrors.Gphone = "Phone number must be 10-15 digits.";
    if (!Gaddress.trim()) newErrors.Gaddress = "Address is required.";
    if (!Gemail.trim() || !/\S+@\S+\.\S+/.test(Gemail)) newErrors.Gemail = "Invalid email format.";
    if (!Gstate.trim()) newErrors.Gstate = "State is required.";
    if (!Glga.trim()) newErrors.Glga = "LGA is required.";
    if (!relationship.trim()) newErrors.relationship = "Relationship to applicant is required.";
    if (!occupation.trim()) newErrors.occupation = "Occupation is required.";
    if (!ninNumber.trim() || ninNumber.length !== 11) newErrors.ninNumber = "NIN must be 11 digits.";
    // if (!GfacePicture) newErrors.GfacePicture = "Face picture is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDone = async () => {
    if (!validateInputs()) {
      Alert.alert("Validation Error", "Please fix the errors before proceeding.");
      return;
    }

    setLoading(true);
    try {
      const guarantorData = {
        firstName: Gfirstname,
        lastName: Glastname,
        phone: Gphone,
        address: Gaddress,
        email: Gemail,
        state: Gstate,
        lga: Glga,
        relationship: relationship,
        occupation: occupation,
        companyName: companyName,
        companyAddress: companyAddress,
        ninNumber: ninNumber,
        facePicture: GfacePicture,
        idImage: idImage,
        househelpName: Hname,
        code: code,
        timestamp: serverTimestamp(),
      };
      setdata(guarantorData)
      console.log(data)
      uploadDataToFirestore("guarantors",data)
      
      Alert.alert("Success", "Guarantor information has been saved successfully.");
      navigation.navigate("Login");
    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert("Error", "Failed to save guarantor information. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <ScrollView>
      <View style={styles.container}>
        <Header navigation={navigation} />
        <Text style={styles.title}>Enter your Guarantor Information</Text>
        {loading ? <ActivityIndicator size="large" color="green" /> : null}
        <View style={styles.formContainer}>
          <TextInput placeholder="First Name" value={Gfirstname} onChangeText={setFirstName} style={styles.input} />
          <TextInput placeholder="Last Name" value={Glastname} onChangeText={setLastName} style={styles.input} />
          <TextInput placeholder="Phone Number" value={Gphone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
          <TextInput placeholder="Email" value={Gemail} onChangeText={setEmail} style={styles.input} />
          <TextInput placeholder="Address" value={Gaddress} onChangeText={setAddress} style={styles.input} />
          <NigerianStateAndLGASelector selectedState={Gstate} selectedLGA={Glga} onStateChange={setState} onLGAChange={setLGA} />
          <TextInput placeholder="Relationship to Applicant" value={relationship} onChangeText={setRelationship} style={styles.input} />
          <TextInput placeholder="Occupation" value={occupation} onChangeText={setOccupation} style={styles.input} />
          <TextInput placeholder="Company Name" value={companyName} onChangeText={setCompanyName} style={styles.input} />
          <TextInput placeholder="Company Address" value={companyAddress} onChangeText={setCompanyAddress} style={styles.input} />
          <TextInput placeholder="NIN Number (11 digits)" value={ninNumber} onChangeText={setNinNumber} keyboardType="numeric" maxLength={11} style={styles.input} />
          <Pressable style={styles2.doneButton} onPress={() => selectPicture(setFacePicture)}>
            <Text style={{ color: 'white' }}>Select ID Image (Optional)</Text>
          </Pressable>
          <View style={{ margin: 10 }}>
            <Image source={{ uri: GfacePicture }} style={styles2.imagePreview} />
          </View>
          <Pressable onPress={handleDone} style={styles2.doneButton}>
            <Text style={styles2.doneButtonText}>Done</Text>
          </Pressable>
        </View>
        <Footer />
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center" },
  title: { color: "green", fontWeight: "bold", fontSize: 18, marginBottom: 10 },
  formContainer: { width: "80%", alignItems: "center", marginTop: 20, padding: 20 },
  input: { padding: 10, borderWidth: 1, borderRadius: 5, width: "100%", marginBottom: 10 },
  doneButton: { backgroundColor: "green", padding: 10, borderRadius: 5 },
});
const styles2 = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    height: '100%',
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
    marginBottom:30
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
    margin:10
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
    width: 150,
    height: 150,
    marginTop: 10,
    borderRadius: 10,
  }
});


export { Guarantor };



