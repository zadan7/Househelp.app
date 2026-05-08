import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, ScrollView, TouchableOpacity, Alert, StyleSheet,Pressable } from 'react-native';
import { Header } from "../component/Header";
import { Footer } from "../component/Footer";
import NigerianStateAndLGASelector from '../component/NigerianStateAndLGASelector';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from './firebase';
// import messaging from '@react-native-firebase/messaging';
// import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Notifications } from 'expo-notifications';
// import { getDocs } from 'firebase/firestore';
import emailjs from 'emailjs-com';

async function registerForPushNotificationsAsync() {
  console.log("Registering for push notifications");
  let token;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== "granted") {
      alert("Failed to get push token for notifications!");
      return null;
    }
  }

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

const CSignup = ({ navigation }) => {
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [lga, setLGA] = useState('');
  const [gender, setGender] = useState('');
  const [apartmentsize, setApartmentSize] = useState('');

  const [password, setPassword] = useState('');
  const [Cpassword, setCPassword] = useState('');
  const [facePicture, setFacePicture] = useState('');
  const [frontview, setFrontview] = useState('');
  const [insideview, setInsideView] = useState('');
  const [location, setLocation] = useState(null);
  const [errors, setErrors] = useState({});
  const [clients, setClients] = useState([]);
  const [data ,setdata]=useState({});

  useEffect(() => {
    console.log("CSignup: Component mounted, requesting permissions");
    (async () => {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
        console.log("CSignup: Location obtained", currentLocation.coords);
      } else {
        console.log("CSignup: Location permission denied");
      }
    })();
  }, []);
  

  useEffect(() => {
    console.log("CSignup: Fetching existing clients");
    const fetchClients = async () => {
      try {
      
        const querySnapshot = await db.collection('clients').get();
              const clients = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // jobs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setClients(clients);
        console.log("CSignup: Clients fetched", clients.length, "clients");
      } catch (error) {
        console.error('Error fetching clients ', error);
      }
    };
    fetchClients();

  }, []);

  

  const validateInputs = () => {
    console.log("CSignup: Validating inputs");
    const newErrors = {};
    if (!firstname.trim()) newErrors.firstname = 'First name is required.';
    if (!lastname.trim()) newErrors.lastname = 'Last name is required.';
    if (!phone.trim()) newErrors.phone = 'Phone number is required.';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format.';
    if (!gender) newErrors.gender = 'Gender is required.';
    if (!location) newErrors.location = 'Location is required.';
    if (!password) newErrors.password = 'Password is required.';
    if (!apartmentsize) newErrors.apartmentsize = ' choose apartment size.';
    if (!address.trim()) newErrors.address = 'Address is required.';
    if (!Cpassword) newErrors.Cpassword = 'Confirm password is required.';
    if (password !== Cpassword) newErrors.Cpassword = 'Passwords do not match.';
    if (!facePicture) newErrors.facePicture = 'Face picture is required.';
    if (!frontview) newErrors.frontview = 'Front view picture is required.';
    if (!insideview) newErrors.insideview = 'Inside view picture is required.';
    if (!state) newErrors.state = 'State is required.';
    if (!lga) newErrors.lga = 'LGA is required.';
    // if (!phone.match(/^\d{11}$/)) newErrors.phone = 'Phone number must be 10 digits.';


    setErrors(newErrors);
    console.log("CSignup: Validation errors", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const takePicture1 = async (parameter) => {
    console.log("Taking face picture");
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera access is needed to take pictures.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setFacePicture(result.assets[0].uri);
      console.log("Face picture taken", result.assets[0].uri);
    }
  };
  const takePicture2 = async (parameter) => {
    console.log("Taking front view picture");
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera access is needed to take pictures.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setFrontview(result.assets[0].uri);
      console.log("Front view picture taken", result.assets[0].uri);
    }
  };
  const takePicture3 = async (parameter) => {
    console.log("Taking inside view picture");
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera access is needed to take pictures.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      // aspect: [4, 3],
      quality: 0.4,
    });

    if (!result.canceled) {
      setInsideView(result.assets[0].uri);
      console.log("Inside view picture taken", result.assets[0].uri);
    }
  };
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

   const uploadImageToFirebase = async (imageUri) => {
      try {
        if (!imageUri || imageUri.trim() === "") {
          console.log("Error: Image URI is empty or invalid");
          return;
        }
  
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const storage = getStorage();
        const fileName = `profile_pictures/${verificationCode}+${email}.jpg`;
        const imageRef = ref(storage, fileName);
        await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(imageRef);
        console.log("Image uploaded successfully:", downloadURL);
        // setDownloadURL(downloadURL) // Not needed here
        // var data3=data
        // data3.url =downloadURL
        // console.log(data3,"inside upload image data")
        return downloadURL;
      } catch (error) {
        console.log("Error uploading image:", error);
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
    
    const handleDone = async () => {
      console.log("handleDone started");
      // console.log("clients", clients);
      // console.log("email", email);
      if (clients.some(client => client.email === email)) {
        console.log("Email already exists, alerting user");
        Alert.alert("Email already exists", "Please use a different email address.");
        return;
      }
    
      console.log("Validating inputs");
      if (!validateInputs()) {
        console.log("Validation failed. Fix errors.");
        return;
      }
      console.log("Validation passed");
      // Get push token in background (non-blocking)
     
        // Update the data with token if needed, but since we're saving immediately, perhaps store separately
     
      
      var verificationCode = generateVerificationCode();
      console.log("Generated verification code:", verificationCode);
    
      const newData = {
        facepicture: facePicture,
        frontview: frontview,
        insideview: insideview,
        location: location,
        state: state,
        lga: lga,
        firstname: firstname,
        lastname: lastname,
        phone: phone,
        email: email,
        address: address,
        verificationCode: verificationCode,
        gender: gender,
        apartmentsize: apartmentsize,
        password: password,
        Cpassword: Cpassword,
        expotoken: null, 
        fcmtoken: null, // Set to null initially, will be updated later if needed
        
      };
      console.log("New data to save:", newData);

      console.log("Sending verification email");
       emailjs.send("service_y6igit7","template_a7bqysj",{
        name: firstname+ " " + lastname,
        code: verificationCode,
        message: "welcome Onboard",
        from_name: "Househelp.ng",
        email:email,
        },"tqnSNSHM6dMmakDbI");
    
      setdata(newData); // State update is asynchronous
      console.log("Data set in state");
    
      // Save to AsyncStorage AFTER state is updated
     
        try {
          console.log("Saving to AsyncStorage");
          await AsyncStorage.setItem('data', JSON.stringify(newData));
          console.log("Data saved to AsyncStorage", newData);
          navigation.navigate('codevalidation2');
          console.log("Navigated to codevalidation2");
        } catch (error) {
          console.error("Error saving to AsyncStorage:", error);
        }
      // Small delay to ensure state updates
    };
    

  return (
    <ScrollView contentContainerStyle={styles3.container}>
      <Header navigation={navigation} />
      {/* <Text style={styles3.title}>Enter your Personal Information</Text> */}
      <View style={styles3.formContainer}>
  <TextInput style={styles3.input} placeholder="First Name" value={firstname} onChangeText={setFirstName} />
  {errors.firstname && <Text style={{ color: 'red' }}>{errors.firstname}</Text>}

  <TextInput style={styles3.input} placeholder="Last Name" value={lastname} onChangeText={setLastName} />
  {errors.lastname && <Text style={{ color: 'red' }}>{errors.lastname}</Text>}

  <TextInput style={styles3.input} placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
  {errors.phone && <Text style={{ color: 'red' }}>{errors.phone}</Text>}

  <TextInput style={styles3.input} placeholder="Email" value={email} onChangeText={setEmail} />
  {errors.email && <Text style={{ color: 'red' }}>{errors.email}</Text>}

  <TextInput style={styles3.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
  {errors.password && <Text style={{ color: 'red' }}>{errors.password}</Text>}

  <TextInput style={styles3.input} placeholder="Confirm Password" value={Cpassword} onChangeText={setCPassword} secureTextEntry />
  {errors.Cpassword && <Text style={{ color: 'red' }}>{errors.Cpassword}</Text>}

  <TextInput style={styles3.input} placeholder="Street Address" value={address} onChangeText={setAddress} />
  {errors.address && <Text style={{ color: 'red' }}>{errors.address}</Text>}

  
  <Picker selectedValue={apartmentsize} onValueChange={setApartmentSize} style={styles.picker}>
    <Picker.Item label="Select Apartment size" value="" />
    <Picker.Item label="1 bedroom" value="1 bedroom" />
    <Picker.Item label="2 bedrooms" value="2 bedrooms" />
    <Picker.Item label="3 bedrooms flat" value="3 bedrooms flat" />
    <Picker.Item label="4 bedrooms flat" value="4 bedrooms flat" />
  </Picker>
  {errors.apartmentsize && <Text style={{ color: 'red' }}>{errors.apartmentsize}</Text>}

  <Picker selectedValue={gender} onValueChange={setGender} style={styles.picker}>
    <Picker.Item label="Select Gender" value="" />
    <Picker.Item label="Male" value="Male" />
    <Picker.Item label="Female" value="Female" />
  </Picker>
  {errors.gender && <Text style={{ color: 'red' }}>{errors.gender}</Text>}

  <NigerianStateAndLGASelector onStateChange={setState} onLGAChange={setLGA} />
  {errors.state && <Text style={{ color: 'red' }}>{errors.state}</Text>}
  {errors.lga && <Text style={{ color: 'red' }}>{errors.lga}</Text>}

  <Text style={styles3.title2}>Upload a picture of your face</Text>
  <TouchableOpacity style={styles3.button} onPress={takePicture1}>
    <Text style={styles3.buttonText}>Take Picture</Text>
  </TouchableOpacity>
  {facePicture ? <Image source={{ uri: facePicture }} style={styles3.imagePreview} /> : null}
  {errors.facePicture && <Text style={{ color: 'red' }}>{errors.facePicture}</Text>}

  <Text style={styles3.title2}>Front view picture of your house</Text>
  <TouchableOpacity style={styles3.button} onPress={takePicture2}>
    <Text style={styles3.buttonText}>Take Picture</Text>
  </TouchableOpacity>
  {frontview ? <Image source={{ uri: frontview }} style={styles3.imagePreview} /> : null}
  {errors.frontview && <Text style={{ color: 'red' }}>{errors.frontview}</Text>}

  <Text style={styles3.title2}>Upload a picture of your Apartment (inside your house)</Text>
  <TouchableOpacity style={styles3.button} onPress={takePicture3}>
    <Text style={styles3.buttonText}>Take Picture</Text>
  </TouchableOpacity>
  {insideview ? <Image source={{ uri: insideview }} style={styles3.imagePreview} /> : null}
  {errors.insideview && <Text style={{ color: 'red' }}>{errors.insideview}</Text>}

  <TouchableOpacity style={styles3.doneButton} onPress={handleDone}>
    <Text style={styles3.doneButtonText}>Done</Text>
  </TouchableOpacity>
</View>

      <Footer />
    </ScrollView>
  );
};












function CodeValidation2({ navigation }) {
  const [code2, setCode2] = useState('');
  const [code, setCode] = useState(''); 
  const [data ,setdata]=useState({});
  const [expotoken ,setExpoToken]=useState("");
  const [fcmtoken ,setFcmToken]=useState("");
  const [profilepicture, setProfilePicture] = useState('');
  const [housepicture, setHousePicture] = useState('');
  const [insidepicture, setInsidePicture] = useState('');

  const [isLoading, setIsLoading] = useState(true); // Track loading state

  const uploadImageToFirebase1 = async (imageUri) => {
    try {
      if (!imageUri || imageUri.trim() === "") {
        console.log("Error: Image URI is empty or invalid");
        return;
      }

      const response = await fetch(imageUri);
      const blob = await response.blob();
      const storage = getStorage();
      const fileName = `profile_pictures/${data.verificationCode}+${data.email}.jpg`;
      const imageRef = ref(storage, fileName);
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      console.log("Image uploaded successfully:", downloadURL);
      setProfilePicture(downloadURL)
      console.log("download url",downloadURL)
     
      return downloadURL;
    } catch (error) {
      console.log("Error uploading image:", error);
    }
  };
  const uploadImageToFirebase2 = async (imageUri) => {
    try {
      if (!imageUri || imageUri.trim() === "") {
        console.log("Error: Image URI is empty or invalid");
        return;
      }

      const response = await fetch(imageUri);
      const blob = await response.blob();
      const storage = getStorage();
      const fileName = `housepicture/${data.verificationCode}+${data.email}.jpg`;
      const imageRef = ref(storage, fileName);
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      console.log("Image uploaded successfully:", downloadURL);
      setHousePicture(downloadURL)
      console.log("download url",downloadURL)
      return downloadURL;
    } catch (error) {
      console.log("Error uploading image:", error);
    }
  };
  const uploadImageToFirebase3 = async (imageUri) => {
    try {
      if (!imageUri || imageUri.trim() === "") {
        console.log("Error: Image URI is empty or invalid");
        return;
      }

      const response = await fetch(imageUri);
      const blob = await response.blob();
      const storage = getStorage();
      const fileName = `insidepicture/${data.verificationCode}+${data.email}.jpg`;
      const imageRef = ref(storage, fileName);
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      console.log("Image uploaded successfully:", downloadURL);
      setInsidePicture(downloadURL)
      // console.log("download url",downloadURL)
      // var data3=data
      // data3.url =downloadURL
      // console.log(data3,"inside upload image data")
      return downloadURL;
    } catch (error) {
      console.log("Error uploading image:", error);
    }
  };

  

const uploadDataToFirestore = async (collectionName, data) => {
  try {
    console.log("Uploading data to Firestore collection:", collectionName);
   db.collection(collectionName).add(data);
    console.log("Data uploaded successfully!");
  } catch (error) {
    console.error("Error uploading data to Firestore:", error);
  }
};

useEffect(() => {

  const tokens = async () => {
  let expotoken = await registerForPushNotificationsAsync().then(token => {
    setExpoToken(token);
    console.log("Expo token set in useEffect:", token);
  });

  let fcmtoken = await registerForFcmToken().then(token => {
    setFcmToken(token);
    console.log("FCM token set in useEffect:", token);
  });

}
tokens();
},[])



  useEffect(() => {
    const fetchData = async () => {
      console.log("CodeValidation2: Fetching data from AsyncStorage");
      try {
        const data2 = await AsyncStorage.getItem('data');
        if (data2) {
          setdata(JSON.parse(data2));
          setIsLoading(false);
          console.log("CodeValidation2: Data loaded from AsyncStorage", JSON.parse(data2));
        } else {
          console.log("CodeValidation2: No data found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error loading data from AsyncStorage:", error);
      }
    }
    fetchData();
    console.log("CodeValidation2: Registering for push notifications");
    registerForPushNotificationsAsync().then(token => {
      setToken(token);
      console.log("CodeValidation2: Push token set", token);
    });
   
   
    // fetchCode();
    
  }, []); // Empty dependency array to run only once on mount
  
  const handleDone = async () => {
    console.log("CodeValidation2: handleDone started");
    Alert.alert("verifiying code ", "Please wait a moment");
    console.log("data", data);
    if (code2 !== data.verificationCode) {
      console.log("CodeValidation2: Invalid code entered");
      Alert.alert("Invalid Code", "Please enter the correct verification code.");
      return;
    }
    console.log("CodeValidation2: Code verified");
  
    try {
      console.log("CodeValidation2: Starting image uploads");
      const profileURL = await uploadImageToFirebase1(data.facepicture) || "";
      console.log("CodeValidation2: Profile image uploaded", profileURL);
      const houseURL = await uploadImageToFirebase2(data.frontview) || "";
      console.log("CodeValidation2: House image uploaded", houseURL);
      const insideURL = await uploadImageToFirebase3(data.insideview) || "";
      console.log("CodeValidation2: Inside image uploaded", insideURL);
  
      var updatedData = {
        ...data,
        facepicture: profileURL,
        frontview: houseURL,
        insideview: insideURL,
        expotoken: expotoken,
        fcmtoken:fcmtoken
      };
  
      console.log(updatedData, "inside handle done data");
  
      console.log("CodeValidation2: Saving to Firestore");
      uploadDataToFirestore('clients', updatedData);
      console.log("CodeValidation2: Data saved to Firestore");
      Alert.alert("Success", "Your account has been created successfully!");
      navigation.navigate("login"); // Replace with your next screen
      console.log("CodeValidation2: Navigated to login");
    } catch (error) {
      console.error("Error in handleDone:", error);
      Alert.alert("Upload Failed", "Something went wrong. Please try again.");
    }
  };
  
  return (
    <ScrollView>
      <Header />
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Enter the verification code sent to your email</Text>
          <TextInput
            onChangeText={(text) => setCode2(text)}
            style={styles.input}
            keyboardType="numeric"
          />
          <Pressable onPress={handleDone} style={styles.doneButton}>
            <Text style={styles.doneButtonText}>Confirm</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
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
const styles3 = StyleSheet.create({
  container: { alignItems: 'center', backgroundColor: '#f5f5f5', paddingVertical: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: 'green' },
  title2: { fontSize: 15, fontWeight: 'bold', marginBottom: 10, color: 'green',textAlign:"center" },

  formContainer: { width: '90%', backgroundColor: '#fff', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5
    , paddingHorizontal: 10, paddingVertical: 10,  
   },
  input: { borderBottomWidth: 1, borderColor: 'green', padding: 10, marginBottom: 15, fontSize: 16 },
  picker: { height: 50, width: '100%', marginBottom: 15 },
  button: { backgroundColor: '#777', padding: 10, borderRadius: 5, alignItems: 'center', marginBottom: 15 },
  buttonText: { color: 'white', fontSize: 16 },
  doneButton: { backgroundColor: 'green', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  doneButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  imagePreview: { width: 150, height: 150, borderRadius: 10, marginTop: 10, alignSelf: 'center' },
});

export {CSignup,CodeValidation2} ;
