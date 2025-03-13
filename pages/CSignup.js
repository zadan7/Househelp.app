import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, Alert, TextInput, Image, TouchableOpacity,ActivityIndicator } from 'react-native';
import { Header } from "../component/Header";
import { Footer } from "../component/Footer";
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from "expo-notifications";

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
const db = getFirestore(app);
const storage = getStorage(app);

const uploadImageToFirebase = async (uri, path) => {
    if (!uri) return null;
    const response = await fetch(uri);
    const blob = await response.blob();
    const imageRef = ref(storage, `clients/${path}`);
    await uploadBytes(imageRef, blob);
    return await getDownloadURL(imageRef);
  };


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

const CSignup = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [houseFront, setHouseFront] = useState(null);
  const [apartmentInside, setApartmentInside] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const pickImage = async (setImage) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImageToFirebase = async (uri, path) => {
    if (!uri) return null;
    const response = await fetch(uri);
    const blob = await response.blob();
    const imageRef = ref(storage, `clients/${path}`);
    await uploadBytes(imageRef, blob);
    return await getDownloadURL(imageRef);
  };

  const checkIfEmailExists = async (email) => {
    const q = query(collection(db, "clients"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleSignup = async () => {
    if (!fullName || !email || !phone || !password || !address || !houseFront || !apartmentInside || !profilePic) {
      alert("Please fill all fields and upload all required images");
      return;
    }

    if (phone.length < 10) {
      alert("Invalid phone number");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const emailExists = await checkIfEmailExists(email);
      if (emailExists) {
        alert("Email is already registered");
        setIsLoading(false);
        return;
      }

      
        // const houseFrontUrl = await uploadImageToFirebase(houseFront, `houseFront_${phone}`);
        // const apartmentInsideUrl = await uploadImageToFirebase(apartmentInside, `apartmentInside_${phone}`);
        // const profilePicUrl = await uploadImageToFirebase(profilePic, `profilePic_${phone}`);
        
        const generateVerificationCode = () => {
            return Math.floor(100000 + Math.random() * 900000).toString();
          };

          var verificationCode=   generateVerificationCode()
        const userData = {
         "name": fullName,
         email: email,
         phone: phone,
         password:  password, 
         code:verificationCode,// Consider hashing before storing
       address:   address,
        houseFront:  houseFront,
        apartmentInside:  apartmentInside,
         profilePic: profilePic,
          role: "client",
          createdAt: new Date(),
          location: location ? {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          } : null,
        };
  
        console.log(userData)
  
        // await addDoc(collection(db, "clients"), userData);
        await AsyncStorage.setItem("userData", JSON.stringify(userData));
        await AsyncStorage.setItem("Cdata", JSON.stringify(userData));
  
        alert("Signup successful!");
        navigation.navigate("codevalidation2");
      
      

    } catch (error) {
      console.error("Error during signup:", error);
      alert("Signup failed. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header />
      <View style={styles.formContainer}>
        <Text style={styles.header}>Client Signup</Text>
        <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />

        <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage(setHouseFront)}>
          <Text style={styles.uploadText}>Upload House Front View</Text>
          {houseFront && <Image source={{ uri: houseFront }} style={styles.image} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage(setApartmentInside)}>
          <Text style={styles.uploadText}>Upload Apartment Inside View</Text>
          {apartmentInside && <Image source={{ uri: apartmentInside }} style={styles.image} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage(setProfilePic)}>
          <Text style={styles.uploadText}>Upload Profile Picture</Text>
          {profilePic && <Image source={{ uri: profilePic }} style={styles.image} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.signupButton} onPress={handleSignup} disabled={isLoading}>
          <Text style={styles.signupText}>{isLoading ? "Signing Up..." : "Sign Up"}</Text>
        </TouchableOpacity>
      </View>
      <Footer />
    </ScrollView>
  );
};


const CodeValidation2 = ({navigation}) => {
  

  const [location, setLocation] = useState(null);
  const [data, setData] = useState({});
  const [code, setCode] = useState("");
  const [code2, setCode2] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [facePicture, setFacePicture] = useState(null);

  const uploadImageToFirebase = async (uri, path) => {
    if (!uri) return null;
    const response = await fetch(uri);
    const blob = await response.blob();
    const imageRef = ref(storage, `clients/${path}`);
    await uploadBytes(imageRef, blob);
    return await getDownloadURL(imageRef);
  };

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const storedData = await AsyncStorage.getItem("Cdata");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setData(parsedData);
          setCode(parsedData.code || "");
          console.log("Fetched Data:", parsedData);
        } else {
          console.warn("No data found in AsyncStorage.");
        }

        await registerForPushNotificationsAsync();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // Ensure loading state is updated
      }
    };

    fetchCode();
  }, []);

 

  const handleDone = async () => {
    console.log("Entered Code:", code2);
    console.log("Stored Code:", code);
    // console.log("Face Picture URI:", facePicture);

    if (code2 === code) {
      Alert.alert("Success", "Code verified successfully!");
      console.log(data.profilePic)
     const houseFrontUrl = await uploadImageToFirebase(data.houseFront, `houseFront_${data.phone}`);
     const apartmentInsideUrl = await uploadImageToFirebase(data.apartmentInside, `apartmentInside_${data.phone}`);
    const profilePicUrl = await uploadImageToFirebase(data.profilePic, `profilePic_${data.phone}`);
      var  data2=data
      data2.houseFront=houseFrontUrl
        data2.apartmentInside=apartmentInsideUrl
        data2.profilePic=profilePicUrl
      console.log("Final Data:", data2);
        await addDoc(collection(db, "clients"), data);
        navigation.navigate("cdashboard");

    
    } else {
      Alert.alert("Error", "Invalid verification code. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="green" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView>
        <Header></Header>
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>
            Enter the verification code sent to your email
          </Text>
          <TextInput
            onChangeText={setCode2}
            style={styles.input}
            keyboardType="numeric"
            value={code2}
          />
          <Pressable onPress={handleDone} style={styles.doneButton}>
            <Text style={styles.doneButtonText}>Confirm</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};




const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    paddingVertical: 20,
  },
  formContainer: {
    width: '90%',
    maxWidth: 500,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginVertical: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
    width: '100%',
  },
  uploadButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    width: '100%',
  },
  uploadText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 5,
    borderRadius: 8,
  },
  signupButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  signupText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  title:{
    fontSize:15,
    color:"green"
  }
  ,doneButton: {
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
});


export { CSignup ,CodeValidation2};