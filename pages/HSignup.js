import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, Alert, TextInput, Image } from 'react-native';
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


// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { getStorage } from 'firebase/storage';
import {db} from "./firebase";
import { storage } from './firebase';

// import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import * as Notifications from "expo-notifications";


// import { db } from "./firebaseConfig"; // Import Firestore instance

// import { firebase } from '@react-native-firebase/storage';
// import firebase from 'firebase/compat/app';








function HSignup({ navigation }) {
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
  const [facePicture, setFacePicture] = useState("");
  const[face,setFace]=useState("");
  const[password,setPassword]=useState("");
  const[Cpassword,setCPassword]=useState("");
  const[downloadURL, setDownloadURL]=useState("");
  // const [accountname , setAccountName] = useState("");
  const [accountnumber , setAccountNumber] = useState("");
  const [bankname , setBankName] = useState("");


  // const [idPicture, setIDPicture] = useState(null);
  const [location, setLocation] = useState(null);
  const [errors, setErrors] = useState({});

  const jobOptions = ["Nanny", "Cook", "Cleaner", "Driver", "Gardener", "Housekeeper","Security","Caregiver","Househelp"];

  useEffect(() => {
    console.log("HSignup: Component mounted, requesting permissions");
    (async () => {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        console.log("HSignup: Getting current location");
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
        console.log("HSignup: Location obtained", currentLocation.coords);
      } else {
        console.log("HSignup: Location permission denied");
      }
    })();

    console.log(location)
  }, []);

  const validateInputs = () => {
    console.log("HSignup: Validating inputs");
    const newErrors = {};
    if (!firstname.trim()) newErrors.firstname = 'First name is required.';
    if (!lastname.trim()) newErrors.lastname = 'Last name is required.';
    if (!phone.trim()) newErrors.phone = 'Phone number is required.';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format.';
    if (!dateOfBirth.trim()) newErrors.dateOfBirth = 'Date of birth is required.';
    if (!gender) newErrors.gender = 'Gender is required.';
    if (!employmentType) newErrors.employmentType = 'Employment type is required.';
    if (!experience.trim()) newErrors.experience = 'Experience is required.';
    if (!selectedJobs.length) newErrors.selectedJobs = 'Select at least one job type.';
    if (!facePicture) newErrors.facePicture = 'Face picture is required.';
    // if (!idPicture) newErrors.idPicture = 'ID picture is required.';
    if (!location) newErrors.location = 'Location is required.';
    if (!password) newErrors.location = 'Password is required.';


    setErrors(newErrors);
    console.log("HSignup: Validation errors", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const selectPicture = async (setter) => {
    console.log("HSignup: Selecting picture from library");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled){
      console.log("HSignup: Picture selected", result.assets[0].uri);
      setter(result.assets[0].uri);
      setFace(result.assets[0].uri)
      setFacePicture(result.assets[0].uri)
    } else {
      console.log("HSignup: Picture selection canceled");
    }
  };
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  

  const handleDone =  async() => {
    console.log("HSignup: handleDone started");
    if (validateInputs()) {
      console.log("HSignup: Validation passed");
      var verificationCode=   generateVerificationCode()
      console.log("HSignup: Generated verification code", verificationCode);
      Alert.alert('Success', 'Form submitted successfully!');

   
      // console.log(firstname,lastname,email,phone,address,state,lga,gender,location,dateOfBirth,selectedJobs,verificationCode,facePicture,password,experience)
       console.log(location)
       let househelpData = {
        "firstname":firstname,
        "lastname":lastname,
        "email":email,
        "phone":phone,
        "address":address,
        "state":state,
        "lga":lga,
        "gender":gender,
        "location":location,
        "dateOfBirth":dateOfBirth,
        "employmentType":employmentType,
        "experience":experience,
        "selectedJobs":selectedJobs,
        "verificationCode":verificationCode,
        "facePicture":facePicture,
        "password":password}
      //  db.collection("househelps").add({"firstname":firstname,"lastname":lastname,"email":email,"phone":phone})
   

      try{
        console.log("HSignup: Saving to AsyncStorage");
        await Promise.all([ 
          AsyncStorage.add("househelpdata",JSON.stringify(househelpData)),
          AsyncStorage.setItem("hname", firstname+"  "+ lastname ),
          AsyncStorage.setItem("hemail", email),
          AsyncStorage.setItem("haddress", address),
          AsyncStorage.setItem("hphonenumber", phone),
          AsyncStorage.setItem("state", state),
          AsyncStorage.setItem("lga", lga),
          AsyncStorage.setItem("gender",gender ),
          AsyncStorage.setItem("DOB", dateOfBirth),
          AsyncStorage.setItem("emplaymenttype",employmentType),
          AsyncStorage.setItem("experience",experience ),
          AsyncStorage.setItem("selectedJobs",JSON.stringify(selectedJobs) ),
          AsyncStorage.setItem("code",verificationCode ),
          AsyncStorage.setItem("facepicture",face ),
          AsyncStorage.setItem("password",password ),
          AsyncStorage.setItem("hlocation",JSON.stringify(location) ),



         
  

        ])
        console.log("HSignup: Data saved to AsyncStorage");
        // console.log(facePicture)
      
       
      

      }catch(error){
        console.log("HSignup: Error saving to AsyncStorage", error)
      }
      console.log(firstname,lastname,email,phone,address,state,lga,gender,location,dateOfBirth,selectedJobs,verificationCode,facePicture,password,experience)
      console.log("HSignup: Sending verification email");
      

      // navigation.navigate("codevalidation") 
      
      navigation.navigate("codevalidation")
      emailjs.send("service_y6igit7","template_a7bqysj",{
        name: firstname+ lastname,
        code: verificationCode,
        message: "welcome Onboard",
        from_name: "Househelp.ng",
        email:email,
        },"tqnSNSHM6dMmakDbI");
    } else {
      console.log("HSignup: Validation failed");
      Alert.alert('Validation Failed', 'Please correct the highlighted fields.');
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Header navigation={navigation} />
        <Text style={styles.title}>Enter your Personal Information</Text>

        <View style={styles.formContainer}>
          <TextInput style={styles.input} placeholder="First Name" value={firstname} onChangeText={setFirstName} />
          <TextInput style={styles.input} placeholder="Last Name" value={lastname} onChangeText={setLastName} />
          <TextInput style={styles.input} placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail}/>
          <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} keyboardType="phone-pad" secureTextEntry />
          <TextInput style={styles.input} placeholder="Confirm Password" value={Cpassword} onChangeText={setCPassword} keyboardType="phone-pad" secureTextEntry />
       <View style={{marginPadding:10,width:"100%"}}>

       
        <Text style={styles.title}>Bank Account Details for Recieving Your Payments<Text style={{color:"red",fontWeight:"bold"}}> (very crucial)</Text> </Text>
          <TextInput style={styles.input} placeholder="Account Number" value={accountnumber} onChangeText={setAccountNumber} keyboardType="numeric" />
          <BankPicker onBankSelect={setBankName} />
          </View>
          
          <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress}/>


          <TextInput style={styles.input} placeholder="Date of Birth" value={dateOfBirth} onChangeText={setDateOfBirth} />
          <Picker selectedValue={gender} onValueChange={setGender} style={styles2.input}>
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
          </Picker>
          <Picker selectedValue={employmentType} onValueChange={setEmploymentType} style={styles2.input}>
            <Picker.Item label="Select Employment Type" value="" />
            <Picker.Item label="Full-Time" value="Full-Time" />
            <Picker.Item label="Part-Time" value="Part-Time" />
            <Picker.Item label="Live-In" value="Live-In" />
          </Picker>
          <TextInput style={styles2.input} placeholder="Years of Experience" value={experience} onChangeText={setExperience} keyboardType="numeric" />
          <NigerianStateAndLGASelector onStateChange={setState} onLGAChange={setLGA} />
          <View >
            <View>
              </View>
            <Text style={styles2.title}>select the list of jobs that suits your preference</Text>
            {jobOptions.map((job) => (
              <Pressable key={job} onPress={() => {
                setSelectedJobs(selectedJobs.includes(job) ? selectedJobs.filter(j => j !== job) : [...selectedJobs, job]);
              }}>
                <Text style={[styles2.jobOption, selectedJobs.includes(job) && styles2.selectedJob]}>{job}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles2.picturebtn} onPress={() => selectPicture(setFacePicture)}><Text style={styles.doneButtonText}>Select Face Picture</Text></Pressable>
          <View style={{margin:10}}>
          <Image source={{ uri: facePicture }} style={styles.imagePreview} />

          </View>
         

          {/* <Pressable style={styles.doneButton} onPress={() => selectPicture(setIDPicture)}><Text style={styles.doneButtonText}>Select ID Picture</Text></Pressable> */}
          <Pressable onPress={handleDone} style={styles.doneButton}><Text style={styles.doneButtonText}>Done</Text></Pressable>
        </View>

        <Footer />
      </View>
    </ScrollView>
  );
}








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
  
    console.log("CodeValidation: data before fetch:", data);
  
    fetchCode();
    
  }, []); // Empty dependency array to run only once on mount
  
 const handleDone = async () => {
  if (code2 == code) {
    Alert.alert("Success", "Code verified! Completing registration...");
    
    try {
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
      const docId = await uploadDataToFirestore("househelps", data);

      if (docId) {
        
        navigation.navigate("Guarantor", { data2: data });
      }
    } catch (error) {
      console.log("Final submission failed:", error);
    }
  } else {
    Alert.alert("Error", "Invalid verification code.");
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

export {HSignup,CodeValidation} ;
