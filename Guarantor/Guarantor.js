import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Alert, ActivityIndicator } from "react-native";
import NigerianStateAndLGASelector from "../component/NigerianStateAndLGASelector";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../pages/firebase";
import firestore from "@react-native-firebase/firestore";
import { Screen, ScreenHeader, Card, Field, PhotoTile, Button, ErrorText } from "../component/ui";
import { colors, space } from "../component/theme";

function Guarantor({ navigation ,route}) {
  const [househelpdata ,setHousehelpdata] = useState();
  // console.log(househelpdata);
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
  const [hphonenumber, setHphonenumber] = useState("");
  const [hemail, setHemail] = useState("");


  const selectPicture = async (setter) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled){
      setter(result.assets[0].uri);
    }
  };

  const uploadDataToFirestore = async (collectionName, data) => {
    try {
      await db.collection(collectionName).add(data);
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
        var data = await AsyncStorage.getItem("househelpdata");
        var hemail = await AsyncStorage.getItem("hemail");
        var hphonenumber = await AsyncStorage.getItem("hphonenumber");
        const parsedData = JSON.parse(data);
        setHousehelpdata(parsedData);
        setHemail(hemail);
        setHphonenumber(hphonenumber);
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
    // if (!Gemail.trim() || !/\S+@\S+\.\S+/.test(Gemail)) newErrors.Gemail = "Invalid email format.";
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
        househelpemail: hemail,
        househelpphone: hphonenumber,
        code: code,
        timestamp: firestore.FieldValue.serverTimestamp(),
      };
      setdata(guarantorData)
      await uploadDataToFirestore("guarantors", guarantorData)
      
      Alert.alert("Success", "Guarantor information has been saved successfully.");
      navigation.navigate("login");
    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert("Error", "Failed to save guarantor information. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Screen>
      <ScreenHeader
        title="Guarantor details"
        subtitle="Tell us about someone who can vouch for you."
        onBack={() => navigation.goBack()}
        step={3}
        totalSteps={3}
      />
      {loading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: space.md }} /> : null}

      <Card title="Guarantor" icon="person-outline">
        <Field label="First name" placeholder="First Name" value={Gfirstname} onChangeText={setFirstName} error={errors.Gfirstname} />
        <Field label="Last name" placeholder="Last Name" value={Glastname} onChangeText={setLastName} error={errors.Glastname} />
        <Field label="Phone number" placeholder="Phone Number" value={Gphone} onChangeText={setPhone} keyboardType="phone-pad" error={errors.Gphone} />
        <Field label="Email" placeholder="Email" value={Gemail} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.Gemail} />
        <Field label="Relationship to applicant" placeholder="Relationship to Applicant" value={relationship} onChangeText={setRelationship} error={errors.relationship} />
      </Card>

      <Card title="Where they live" icon="home-outline">
        <Field label="Address" placeholder="Address" value={Gaddress} onChangeText={setAddress} error={errors.Gaddress} />
        <NigerianStateAndLGASelector selectedState={Gstate} selectedLGA={Glga} onStateChange={setState} onLGAChange={setLGA} />
        <ErrorText>{errors.Gstate}</ErrorText>
        <ErrorText>{errors.Glga}</ErrorText>
        <ErrorText>{errors.location}</ErrorText>
      </Card>

      <Card title="Work" icon="briefcase-outline">
        <Field label="Occupation" placeholder="Occupation" value={occupation} onChangeText={setOccupation} error={errors.occupation} />
        <Field label="Company name" placeholder="Company Name" value={companyName} onChangeText={setCompanyName} />
        <Field label="Company address" placeholder="Company Address" value={companyAddress} onChangeText={setCompanyAddress} error={errors.companyAddress} />
      </Card>

      <Card title="Identity" icon="id-card-outline">
        <Field
          label="NIN number"
          placeholder="NIN Number (11 digits)"
          value={ninNumber}
          onChangeText={setNinNumber}
          keyboardType="numeric"
          maxLength={11}
          error={errors.ninNumber}
        />
        <PhotoTile label="ID image (optional)" hint="Tap to add an ID photo" uri={idImage} onPress={() => selectPicture(setIdImage)} />
        <PhotoTile label="Guarantor photo" hint="Tap to add a photo" uri={GfacePicture} onPress={() => selectPicture(setFacePicture)} error={errors.GfacePicture} />
      </Card>

      <Button title="Done" onPress={handleDone} />
    </Screen>
  );
}

export { Guarantor };
