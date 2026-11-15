import React, { useState, useEffect, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, Alert, TextInput, Image, TouchableOpacity } from 'react-native';
import { Header } from "../component/Header";
import { Footer } from "../component/Footer";
import NigerianStateAndLGASelector from '../component/NigerianStateAndLGASelector';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import emailjs from "emailjs-com";
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import BankPicker from '../component/Banks';
import Loader from '../component/Loader';
import { Ionicons } from '@expo/vector-icons';
import { Screen, ScreenHeader, Card, Field, Select, Chips, PhotoTile, Button, ErrorText } from '../component/ui';
import { colors, space, radius } from '../component/theme';
import { generateVerificationCode, sendVerificationEmail } from '../services/verification';


// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { getStorage } from 'firebase/storage';
import {db} from "./firebase";
import { storage } from './firebase';

// import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import * as Notifications from "expo-notifications";
import { Timestamp } from '@react-native-firebase/firestore';


// import { db } from "./firebaseConfig"; // Import Firestore instance

// import { firebase } from '@react-native-firebase/storage';
// import firebase from 'firebase/compat/app';








function HSignup({ navigation }) {
  const [form, setForm] = useState({
    firstname: '', lastname: '', phone: '', email: '', password: '', Cpassword: '',
    address: '', dateOfBirth: '', gender: '', employmentType: '', experience: '',
    state: '', lga: '', accountnumber: '', bankcode: '',
  });
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [facePicture, setFacePicture] = useState('');
  const [location, setLocation] = useState(null);
  const [locStatus, setLocStatus] = useState('loading'); // loading | ok | denied
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const jobOptions = ["Nanny", "Cook", "Cleaner", "Driver", "Gardener", "Housekeeper", "Security", "Caregiver", "Househelp"];

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };
  const onState = useCallback((v) => {
    setForm((f) => ({ ...f, state: v }));
    setErrors((e) => ({ ...e, state: undefined }));
  }, []);
  const onLGA = useCallback((v) => {
    setForm((f) => ({ ...f, lga: v }));
    setErrors((e) => ({ ...e, lga: undefined }));
  }, []);
  const onBank = useCallback((v) => {
    setForm((f) => ({ ...f, bankcode: v }));
    setErrors((e) => ({ ...e, bankcode: undefined }));
  }, []);

  const fetchLocation = useCallback(async () => {
    setLocStatus('loading');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLocStatus('denied'); return; }
      const pos = await Location.getCurrentPositionAsync({});
      setLocation(pos.coords);
      setLocStatus('ok');
      setErrors((e) => ({ ...e, location: undefined }));
    } catch (err) {
      setLocStatus('denied');
    }
  }, []);

  useEffect(() => { fetchLocation(); }, [fetchLocation]);

  const pickPhoto = () => {
    const apply = (result) => {
      if (!result.canceled) {
        setFacePicture(result.assets[0].uri);
        setErrors((e) => ({ ...e, facePicture: undefined }));
      }
    };
    Alert.alert('Profile photo', 'Clients choose househelps by photo, so use a clear picture of your face.', [
      {
        text: 'Take photo',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Camera needed', 'Please allow camera access to take a photo.');
            return;
          }
          apply(await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.7 }));
        },
      },
      {
        text: 'Choose from gallery',
        onPress: async () =>
          apply(await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
          })),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const toggleJob = (job) => {
    setSelectedJobs((cur) => (cur.includes(job) ? cur.filter((j) => j !== job) : [...cur, job]));
    setErrors((e) => ({ ...e, selectedJobs: undefined }));
  };

  // Returns age in years for DD/MM/YYYY, or null if the date is invalid.
  const ageFromDob = (dob) => {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dob.trim());
    if (!m) return null;
    const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    if (d.getFullYear() !== Number(m[3]) || d.getMonth() !== Number(m[2]) - 1 || d.getDate() !== Number(m[1])) return null;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) age -= 1;
    return age;
  };

  const validate = () => {
    const e = {};
    const f = form;
    if (!f.firstname.trim()) e.firstname = 'Enter your first name.';
    if (!f.lastname.trim()) e.lastname = 'Enter your last name.';
    if (!/^\+?\d{10,14}$/.test(f.phone.replace(/[\s-]/g, ''))) e.phone = 'Enter a valid phone number.';
    if (!/\S+@\S+\.\S+/.test(f.email.trim())) e.email = 'Enter a valid email address.';
    if (f.password.length < 6) e.password = 'Use at least 6 characters.';
    if (f.password !== f.Cpassword) e.Cpassword = 'Passwords do not match.';
    if (!/^\d{10}$/.test(f.accountnumber.trim())) e.accountnumber = 'Enter your 10-digit account number.';
    if (!f.bankcode) e.bankcode = 'Select your bank.';
    if (!f.address.trim()) e.address = 'Enter your address.';
    const age = ageFromDob(f.dateOfBirth);
    if (age === null) e.dateOfBirth = 'Use the format DD/MM/YYYY.';
    else if (age < 18) e.dateOfBirth = 'You must be at least 18 years old.';
    if (!f.gender) e.gender = 'Select your gender.';
    if (!f.employmentType) e.employmentType = 'Select an employment type.';
    if (!f.experience.trim() || isNaN(Number(f.experience))) e.experience = 'Enter your years of experience as a number.';
    if (!f.state) e.state = 'Select your state.';
    if (!f.lga) e.lga = 'Select your LGA.';
    if (!selectedJobs.length) e.selectedJobs = 'Select at least one job type.';
    if (!facePicture) e.facePicture = 'A profile photo is required.';
    if (!location) e.location = 'We need your location to match you with nearby jobs.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleDone = async () => {
    if (!validate()) {
      Alert.alert('Almost there', 'Please fix the highlighted fields.');
      return;
    }
    setSubmitting(true);
    try {
      const email = form.email.trim().toLowerCase();

      // Only look up THIS email instead of downloading every househelp.
      const dup = await db.collection('househelps').where('email', '==', email).limit(1).get();
      if (!dup.empty) {
        setErrors((e) => ({ ...e, email: 'This email is already registered. Try logging in.' }));
        return;
      }

      const verificationCode = generateVerificationCode();
      const fullName = `${form.firstname.trim()} ${form.lastname.trim()}`;
      await sendVerificationEmail({ name: fullName, code: verificationCode, email });

      // Same storage keys the verification step already reads, plus the bank details
      // that were being collected but never saved.
      await Promise.all([
        // The Guarantor step reads this combined record, so keep saving it in the same shape.
        AsyncStorage.setItem('househelpdata', JSON.stringify({
          firstname: form.firstname.trim(),
          lastname: form.lastname.trim(),
          email,
          phone: form.phone.trim(),
          address: form.address.trim(),
          state: form.state,
          lga: form.lga,
          gender: form.gender,
          location,
          dateOfBirth: form.dateOfBirth.trim(),
          employmentType: form.employmentType,
          experience: form.experience.trim(),
          selectedJobs,
          verificationCode,
          facePicture,
          password: form.password,
          accountnumber: form.accountnumber.trim(),
          bankcode: form.bankcode,
        })),
        AsyncStorage.setItem('hname', fullName),
        AsyncStorage.setItem('hemail', email),
        AsyncStorage.setItem('haddress', form.address.trim()),
        AsyncStorage.setItem('hphonenumber', form.phone.trim()),
        AsyncStorage.setItem('state', form.state),
        AsyncStorage.setItem('lga', form.lga),
        AsyncStorage.setItem('gender', form.gender),
        AsyncStorage.setItem('DOB', form.dateOfBirth.trim()),
        AsyncStorage.setItem('emplaymenttype', form.employmentType),
        AsyncStorage.setItem('experience', form.experience.trim()),
        AsyncStorage.setItem('selectedJobs', JSON.stringify(selectedJobs)),
        AsyncStorage.setItem('code', verificationCode),
        AsyncStorage.setItem('facepicture', facePicture),
        AsyncStorage.setItem('password', form.password),
        AsyncStorage.setItem('hlocation', JSON.stringify(location)),
        AsyncStorage.setItem('haccountnumber', form.accountnumber.trim()),
        AsyncStorage.setItem('hbankcode', form.bankcode),
      ]);
      navigation.navigate('codevalidation');
    } catch (err) {
      Alert.alert("Couldn't continue", 'We could not send your verification email. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <ScreenHeader
        title="Join as a househelp"
        subtitle="Create your profile so clients near you can find and hire you."
        onBack={() => navigation.goBack()}
        step={1}
        totalSteps={3}
      />

      <Card title="About you" icon="person-outline">
        <Field label="First name" value={form.firstname} onChangeText={set('firstname')} error={errors.firstname} autoCapitalize="words" />
        <Field label="Last name" value={form.lastname} onChangeText={set('lastname')} error={errors.lastname} autoCapitalize="words" />
        <Field label="Phone number" value={form.phone} onChangeText={set('phone')} error={errors.phone} keyboardType="phone-pad" placeholder="08012345678" />
        <Field label="Email" value={form.email} onChangeText={set('email')} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        <Field label="Date of birth" value={form.dateOfBirth} onChangeText={set('dateOfBirth')} error={errors.dateOfBirth} placeholder="DD/MM/YYYY" keyboardType="numbers-and-punctuation" hint="You must be 18 or older" />
        <Select label="Gender" value={form.gender} onChange={set('gender')} items={['Male', 'Female']} placeholder="Select gender" error={errors.gender} />
      </Card>

      <Card title="Password" icon="lock-closed-outline">
        <Field label="Password" value={form.password} onChangeText={set('password')} error={errors.password} secure hint="At least 6 characters" autoCapitalize="none" />
        <Field label="Confirm password" value={form.Cpassword} onChangeText={set('Cpassword')} error={errors.Cpassword} secure autoCapitalize="none" />
      </Card>

      <Card title="Where you get paid" icon="wallet-outline">
        <Text style={{ color: colors.muted, fontSize: 13 }}>
          Your pay is sent to this account, so double-check the details.
        </Text>
        <Field label="Account number" value={form.accountnumber} onChangeText={set('accountnumber')} error={errors.accountnumber} keyboardType="number-pad" maxLength={10} />
        <BankPicker onBankSelect={onBank} />
        <ErrorText>{errors.bankcode}</ErrorText>
      </Card>

      <Card title="Where you live" icon="home-outline">
        <Field label="Address" value={form.address} onChangeText={set('address')} error={errors.address} />
        <NigerianStateAndLGASelector onStateChange={onState} onLGAChange={onLGA} />
        <ErrorText>{errors.state}</ErrorText>
        <ErrorText>{errors.lga}</ErrorText>
        <View style={[hs.locRow, locStatus === 'ok' && hs.locOk, locStatus === 'denied' && hs.locBad]}>
          <Ionicons
            name={locStatus === 'ok' ? 'checkmark-circle' : locStatus === 'denied' ? 'alert-circle' : 'locate'}
            size={20}
            color={locStatus === 'denied' ? colors.danger : colors.primary}
          />
          <Text style={hs.locText}>
            {locStatus === 'ok' && 'Location captured'}
            {locStatus === 'loading' && 'Getting your location…'}
            {locStatus === 'denied' && 'Location is off. We need it to show you nearby jobs.'}
          </Text>
          {locStatus === 'denied' ? (
            <TouchableOpacity onPress={fetchLocation}><Text style={hs.retry}>Retry</Text></TouchableOpacity>
          ) : null}
        </View>
        <ErrorText>{errors.location}</ErrorText>
      </Card>

      <Card title="Your work" icon="briefcase-outline">
        <Select label="Employment type" value={form.employmentType} onChange={set('employmentType')} items={['Full-Time', 'Part-Time', 'Live-In']} placeholder="Select employment type" error={errors.employmentType} />
        <Field label="Years of experience" value={form.experience} onChangeText={set('experience')} error={errors.experience} keyboardType="number-pad" />
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600' }}>Jobs you can do</Text>
          <Chips options={jobOptions} selected={selectedJobs} onToggle={toggleJob} />
          <ErrorText>{errors.selectedJobs}</ErrorText>
        </View>
      </Card>

      <Card title="Profile photo" icon="camera-outline">
        <PhotoTile label="Your face" hint="Tap to add a photo" uri={facePicture} onPress={pickPhoto} error={errors.facePicture} />
      </Card>

      <Button title="Continue" onPress={handleDone} loading={submitting} />
      <TouchableOpacity onPress={() => navigation.navigate('login')} style={{ alignSelf: 'center', padding: space.lg }}>
        <Text style={{ color: colors.muted }}>
          Already have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Log in</Text>
        </Text>
      </TouchableOpacity>
    </Screen>
  );
}

const hs = StyleSheet.create({
  locRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.md, backgroundColor: colors.bg },
  locOk: { backgroundColor: colors.primarySoft },
  locBad: { backgroundColor: colors.dangerSoft },
  locText: { flex: 1, fontSize: 13, color: colors.text },
  retry: { color: colors.primary, fontWeight: '700' },
});

function CodeValidation({ navigation }) {
  const [code, setCode] = useState("");
  const [code2, setCode2] = useState("");
  const [hname, setHname] = useState("");
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('');
  const [lga, setLGA] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedJobs, setSelectedJobs] = useState([]);
  // const [facePicture, setFacePicture] = useState("");
  const[face,setFace]=useState("");
  const[password,setPassword]=useState("");
  const[Cpassword,setCPassword]=useState("");


  // const [idPicture, setIDPicture] = useState(null);
  const [location, setLocation] = useState(null);
  const [errors, setErrors] = useState({});

 
  const [facePicture, setFacePicture] = useState(null);
  const [downloadURL, setDownloadURL] = useState("");
  const [data ,setdata]=useState({});
  const [expotoken ,setExpoToken]=useState("");
  const [fcmtoken ,setFcmToken]=useState(""); 


  const [isLoading, setIsLoading] = useState(true); // Track loading state

  // Function to upload image to Firebase
  // const uploadImageToFirebase = async (imageUri, verificationCode, userName) => {
  //   try {
  //     console.log("uploadImageToFirebase: Starting upload for URI:", imageUri);
  //     if (!imageUri || imageUri.trim() === "") {
  //       console.log("Error: Image URI is empty or invalid");
  //       return null;
  //     }

  //     console.log("uploadImageToFirebase: Fetching image from URI");
  //     const response = await fetch(imageUri);
  //     console.log("uploadImageToFirebase: Fetch response status:", response.status);
      
  //     if (!response.ok) {
  //       console.log("Error: Fetch failed with status", response.status);
  //       return null;
  //     }
      
  //     const blob = await response.blob();
  //     console.log("uploadImageToFirebase: Blob created, size:", blob.size);

  //     const storage = getStorage();
  //     const fileName = `profile_pictures/${verificationCode}+${userName}.jpg`;
  //     console.log("uploadImageToFirebase: Uploading with fileName:", fileName);
      
  //     const imageRef = ref(storage, fileName);
  //     await uploadBytes(imageRef, blob);
  //     console.log("uploadImageToFirebase: Upload successful");
      
  //     const downloadURL = await getDownloadURL(imageRef);
  //     console.log("Image uploaded successfully:", downloadURL);
  //     return downloadURL;
  //   } catch (error) {
  //     console.log("Error uploading image:", error.message);
  //     return null;
  //   }
  // };
const uploadImageToFirebase = async (imageUri, verificationCode, userName) => {
  try {
    console.log("CodeValidation: Starting Native Upload...");
    if (!imageUri) return null;

    // 1. Create a reference in Storage
    // Use the storage instance imported from your firebase file
    const fileName = `profile_pictures/${verificationCode}_${userName.replace(/\s/g, '_')}.jpg`;
    const reference = storage.ref(fileName);

    // 2. Upload the file directly from the URI
    await reference.putFile(imageUri); 
    console.log("CodeValidation: File uploaded to storage");

    // 3. Get the download URL
    const url = await reference.getDownloadURL();
    console.log("CodeValidation: Download URL obtained:", url);
    return url;
  } catch (error) {
    console.error("Native Storage Error:", error);
    return null; // Return null so handleDone can still finish the registration
  }
};
  // Import Firebase configuration

// Function to upload data to Firestore


const uploadDataToFirestore = async (collectionName, data) => {
  try {
    console.log("Attempting Native Firestore Upload...");
    // @react-native-firebase/firestore uses this syntax
    const docRef = await db.collection(collectionName).add({
      ...data,
      // createdAt: firestore.FieldValue.serverTimestamp(), // Use native timestamp
    });

    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Firestore Error:", error.message);
    Alert.alert("Database Error", "Check your internet or Firebase permissions.");
  }
};


async function registerForPushNotificationsAsync() {
  console.log("HSignup: Registering for push notifications");
  let token;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    console.log("HSignup: Push permissions not granted, requesting");
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== "granted") {
      console.log("HSignup: Push permissions denied");
      alert("Failed to get push token for notifications!");
      return null;
    }
  }

  console.log("HSignup: Getting Expo push token");
  token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("Push Token:", token);

  return token;
}
 const registerForFcmToken = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (!enabled) return null;
      return await messaging().getToken();
    } catch (e) { return null; }
  };




  // Fetch stored data from AsyncStorage
  useEffect(() => {
    console.log("CodeValidation: useEffect started, db:");
  
    const fetchCode = async () => {
      console.log("CodeValidation: Fetching data from AsyncStorage");
      try {
        const storedCode = await AsyncStorage.getItem("code");
        setCode(storedCode);
        console.log("CodeValidation: Stored code:", storedCode);
        const hname = await AsyncStorage.getItem("hname");
        const hemail = await AsyncStorage.getItem("hemail");
        const haddress = await AsyncStorage.getItem("haddress");
        const hphonenumber = await AsyncStorage.getItem("hphonenumber");
        const hstate = await AsyncStorage.getItem("state");
        const hlga = await AsyncStorage.getItem("lga");
        const hgender = await AsyncStorage.getItem("gender");
        const hDOB = await AsyncStorage.getItem("DOB");
        const hemplaymenttype = await AsyncStorage.getItem("emplaymenttype");
        const hexperience = await AsyncStorage.getItem("experience");
        const hselectedJob = await AsyncStorage.getItem("selectedJobs");
        const hpassword = await AsyncStorage.getItem("password");
        const hLocation = await AsyncStorage.getItem("hlocation");
        const haccountnumber = await AsyncStorage.getItem("haccountnumber");
        const hbankcode = await AsyncStorage.getItem("hbankcode");
        const storedURI = await AsyncStorage.getItem("facepicture");
        console.log("CodeValidation: Fetched all data, hname:", hname, "hemail:", hemail, "storedURI:", storedURI);
        
        const expotoken = await registerForPushNotificationsAsync();
        const fcmtoken = await registerForFcmToken();
        console.log("CodeValidation: Push token:", expotoken);
        
        setCode(storedCode);
        setFacePicture(storedURI);
        setHname(hname);
        setFirstName(hname?.split(" ")[0] || "");
        setLastName(hname?.split(" ")[1] || "");
        setPhone(hphonenumber);
        setAddress(haddress);
        setEmail(hemail);
        setState(hstate);
        setLGA(hlga);
        setDateOfBirth(hDOB);
        setGender(hgender);
        setEmploymentType(hemplaymenttype);
        setExperience(hexperience);
        setSelectedJobs(JSON.parse(hselectedJob || "[]"));
        setLocation(JSON.parse(hLocation || "{}"));
        setExpoToken(expotoken);
        setFcmToken(fcmtoken);
        
        // Consolidated data object
        setdata({ 
          code: storedCode,
          uri: "", // Will be set after upload
          name: hname,
          email: hemail,
          address: haddress,
          phonenumber: hphonenumber,
          state: hstate,
          lga: hlga,
          gender: hgender,
          dateOfBirth: hDOB,
          employmentType: hemplaymenttype,
          experience: hexperience,
          selectedJobs: JSON.parse(hselectedJob || "[]"),
          password: hpassword,
          accountnumber: haccountnumber,
          bankcode: hbankcode,
          location: JSON.parse(hLocation || "{}"),
          expotoken: expotoken,
          fcmtoken: fcmtoken
        });
        console.log("CodeValidation: Data set:", { code: storedCode, name: hname, email: hemail });
  
        setIsLoading(false); // Set loading to false once the data is fetched
      } catch (error) {
        console.error("CodeValidation: Error fetching data:", error);
        setIsLoading(false); // Set loading to false in case of an error
      }
    };
  
  
    fetchCode();
    console.log("CodeValidation: data before fetch:", data);

    
  }, []); // Empty dependency array to run only once on mount
  
 const handleDone = async () => {
  console.log("CodeValidation: handleDone started, comparing codes", { code, code2 });

  await AsyncStorage.getItem 
  if (code2 == code) {
    console.log("CodeValidation: Code verified, proceeding with registration");
    // Alert.alert("Success", "Code verified! Completing registration...");
    setIsLoading(true); // Show loading indicator during final steps
    
    try {
      console.log("data before image upload:", data );
      // let finalImageUrl = null;

      // 1. Try Image Upload
      // if (facePicture) {
      //   // finalImageUrl = await uploadImageToFirebase(facePicture, code, data.name);
      // }

      // 2. Prepare Final Data
      // const finalData = { 
      //   ...data, 
      //   uri: finalImageUrl || "No Image" 
      // };

      // 3. Upload to Firestore
   
      const photoUrl = await uploadImageToFirebase(facePicture, code, data.name || "househelp");
      if (!photoUrl) {
        setIsLoading(false);
        Alert.alert("Photo upload failed", "We could not upload your profile photo. Check your connection and try again.");
        return;
      }
      const docId = await uploadDataToFirestore("househelps", { ...data, url: photoUrl, uri: photoUrl });
      setIsLoading(false);
      

      if (docId) {
        setIsLoading(false); // Hide loading indicator
        navigation.navigate("Guarantor", { data2: { ...data, url: photoUrl, uri: photoUrl } });
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Could not finish signup", "Something went wrong. Please try again.");
    }
  } else {
    Alert.alert("Error", "Invalid verification code.");
  }
};

if (isLoading) {
  return (
    <Screen scroll={false}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Loader />
      </View>
    </Screen>
  );
}
  return (
    <Screen>
      <ScreenHeader
        title="Verify your email"
        subtitle={email ? `Enter the 6-digit code we sent to ${email}.` : 'Enter the code we emailed you.'}
        onBack={() => navigation.goBack()}
        step={2}
        totalSteps={3}
      />
      <Card>
        <Field
          label="Verification code"
          value={code2}
          onChangeText={(t) => setCode2(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="••••••"
          textAlign="center"
          inputStyle={{ fontSize: 26, letterSpacing: 8, fontWeight: '700' }}
        />
        <Button title="Confirm" onPress={handleDone} disabled={code2.length < 6} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
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

const styles2 = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: 'green', padding: 10, marginVertical: 5, width: '90%' },
  doneButton: { backgroundColor: 'green', padding: 10, marginTop: 20 },
  picturebtn: { backgroundColor: '#777', padding: 10, marginTop: 20 },

  doneButtonText: { color: 'white', textAlign: 'center' },
  jobOption: { padding: 10, borderWidth: 1, marginVertical: 2 },
  selectedJob: { backgroundColor: 'green', color: 'white' },
});

export {HSignup,CodeValidation} ;
