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


import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import {db} from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import * as Notifications from "expo-notifications";

async function registerForPushNotificationsAsync() {
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
// import { db } from "./firebaseConfig"; // Import Firestore instance

// import { firebase } from '@react-native-firebase/storage';
import firebase from 'firebase/compat/app';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_Xm0x7Xz4UqRh-q4ftiIx4-D8AjLpePE",
  authDomain: "househelporg.firebaseapp.com",
  projectId: "househelporg",
  storageBucket: "househelporg.appspot.com",
  messagingSenderId: "354870677540",
  appId: "1:354870677540:web:718bf40b9ec96b6840c8b1",
  measurementId: "G-SLELK741QB"
};


const app = initializeApp(firebaseConfig);








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
  const[downloadURL, setDownloadURL]=useState("")


  // const [idPicture, setIDPicture] = useState(null);
  const [location, setLocation] = useState(null);
  const [errors, setErrors] = useState({});

  const jobOptions = ["Nanny", "Cook", "Cleaner", "Driver", "Gardener", "Housekeeper","Security","Caregiver","Househelp"];

  useEffect(() => {
    (async () => {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
      }
    })();

    console.log(location)
  }, []);

  const validateInputs = () => {
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
    return Object.keys(newErrors).length === 0;
  };

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
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  

  const handleDone =  async() => {
    if (validateInputs()) {
      // console.log(face)

   var verificationCode=   generateVerificationCode()
      Alert.alert('Success', 'Form submitted successfully!');

      console.log(firstname,lastname,email,phone,address,state,lga,gender,location,dateOfBirth,selectedJobs,verificationCode,facePicture,password,experience)
       console.log(location)

      try{
        await Promise.all([ 
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
        // console.log(facePicture)
      
       
      

      }catch(error){
        console.log(error)
      }
      console.log(firstname,lastname,email,phone,address,state,lga,gender,location,dateOfBirth,selectedJobs,verificationCode,facePicture,password,experience)
      navigation.navigate("codevalidation") 
      
      // navigation.navigate("codevalidation")
      // emailjs.send("service_y6igit7","template_a7bqysj",{
      //   name: firstname+ lastname,
      //   code: verificationCode,
      //   message: "welcome Onboard",
      //   from_name: "Househelp.ng",
      //   email:email,
      //   },"tqnSNSHM6dMmakDbI");
    } else {
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
  const [token ,setToken]=useState("");

  const [isLoading, setIsLoading] = useState(true); // Track loading state

  // Function to upload image to Firebase
  const uploadImageToFirebase = async (imageUri) => {
    try {
      if (!imageUri || imageUri.trim() === "") {
        console.log("Error: Image URI is empty or invalid");
        return;
      }

      const response = await fetch(imageUri);
      const blob = await response.blob();
      const storage = getStorage();
      const fileName = `profile_pictures/${code}+${hname}.jpg`;
      const imageRef = ref(storage, fileName);
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      console.log("Image uploaded successfully:", downloadURL);
      setDownloadURL(downloadURL)
      // console.log("download url",downloadURL)
      var data3=data
      data3.url =downloadURL
      console.log(data3,"inside upload image data")
      return downloadURL;
    } catch (error) {
      console.log("Error uploading image:", error);
    }
  };

  // Import Firebase configuration

// Function to upload data to Firestore

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



  // Fetch stored data from AsyncStorage
  useEffect(() => {
    console.log(db);
  
    const fetchCode = async () => {
      try {
        const storedCode = await AsyncStorage.getItem("code");
        const hname = await AsyncStorage.getItem("hname");  // Re-added hname
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
        const storedURI = await AsyncStorage.getItem("facepicture"); // Added storedURI
  
        const pushToken = await registerForPushNotificationsAsync();
        setCode(storedCode);
        setFacePicture(storedURI);
        setHname(hname);
        setFirstName(hname?.split(" ")[0] || ""); // Extract first name
        setLastName(hname?.split(" ")[1] || ""); // Extract last name
        setPhone(hphonenumber);
        setAddress(haddress);
        setEmail(hemail);
        setState(hstate);
        setLGA(hlga);
        setDateOfBirth(hDOB);
        setGender(hgender);
        setEmploymentType(hemplaymenttype);
        setExperience(hexperience);
        setSelectedJobs(JSON.parse(hselectedJob || "[]")); // Ensure it's an array
        setLocation(hLocation);
        setToken(pushToken)
  
        // Consolidated data object
        setdata({ 
         code: storedCode,
          uri:downloadURL,
         name: hname,
         email: hemail,
         address: haddress,
         phonenumber: hphonenumber,
         state: hstate,
         lga: hlga,
         gender: hgender,
        dateOfBirth:  hDOB,
         employmentType: hemplaymenttype,
        experience:  hexperience,
       selectedJobs:   hselectedJob,
         password: hpassword,
          location:hLocation,
          token:pushToken,
       } )
       
  
        setIsLoading(false); // Set loading to false once the data is fetched
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false); // Set loading to false in case of an error
      }
    };
  
    console.log("data", data);
  
    fetchCode();
    
  }, []); // Empty dependency array to run only once on mount
  
  const handleDone = async () => {

    console.log("Entered Code:", code2);
    console.log("Stored Code:", code);
    console.log("uri",facePicture)

    if (code2 === code) {
      Alert.alert("Success", "Code verified successfully!");
      if (facePicture) {
        const uploadedURL = await uploadImageToFirebase(facePicture);
        // setDownloadURL(uploadedURL);
        console.log(uploadedURL)
        var data2 =data;
        data2.url=uploadedURL

         // Optionally store the download URL if needed
        // data.url=downloadURL
        if(data2.url!==""){
          console.log("data2" ,data2)
          console.log()

        uploadDataToFirestore("househelps",data2)
        }else if( setTimeout(() => {
          
        }, 2)){
          setTimeout(() => {
            if(uploadedURL!==""){
              console.log("data2" ,data2)
            uploadDataToFirestore("househelps",data2)}
            
          }, 2);
        }
        
      }
      navigation.navigate("Guarantor"); // Navigate after successful verification
    } else {
      Alert.alert("Error", "Invalid verification code. Please try again.");
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
    justifyContent: 'center',
    // padding: 20,
  },
  title: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  formContainer: {
    width: '85%',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: 'green',
    borderRadius: 12,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  inputContainer: {
    width: "100%",
    padding: 10,
  },
  input: {
    padding: 12,
    borderColor: 'green',
    borderWidth: 1.5,
    borderRadius: 8,
    textAlign: 'center',
    marginBottom: 12,
    width: "100%",
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
  },
  doneButton: {
    backgroundColor: 'green',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 50,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  uploadButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  imagePreview: {
    width: 150,
    height: 150,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

const styles2 = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    alignItems: 'center', 
    justifyContent: 'center',
    padding: 20,
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 12, 
    textAlign: 'center',
    color: 'green',
  },
  input: { 
    borderWidth: 1.5, 
    borderColor: 'green', 
    padding: 12, 
    marginVertical: 8, 
    width: '90%', 
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  doneButton: { 
    backgroundColor: 'green', 
    paddingVertical: 12, 
    paddingHorizontal: 40, 
    borderRadius: 8, 
    marginTop: 15, 
    alignItems: 'center',
  },
  picturebtn: { 
    backgroundColor: '#777', 
    paddingVertical: 12, 
    paddingHorizontal: 40, 
    borderRadius: 8, 
    marginTop: 15, 
    alignItems: 'center',
  },
  doneButtonText: { 
    color: 'white', 
    textAlign: 'center', 
    fontSize: 16, 
    fontWeight: 'bold',
  },
  jobOption: { 
    padding: 12, 
    borderWidth: 1.5, 
    borderRadius: 8, 
    marginVertical: 5, 
    width: '100%', 
    textAlign: 'center',
    backgroundColor: '#F8F8F8',
  },
  selectedJob: { 
    backgroundColor: 'green', 
    color: 'white', 
    fontWeight: 'bold',
  },
});


export {HSignup,CodeValidation} ;
