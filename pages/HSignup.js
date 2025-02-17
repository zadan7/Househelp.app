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
  const [facePicture, setFacePicture] = useState(null);
  // const [idPicture, setIDPicture] = useState(null);
  const [location, setLocation] = useState(null);
  const [errors, setErrors] = useState({});

  const jobOptions = ["Nanny", "Cook", "Cleaner", "Driver", "Gardener", "Housekeeper"];

  useEffect(() => {
    (async () => {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
      }
    })();
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
    if (!result.canceled) setter(result.assets[0].uri);
  };
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  

  const handleDone = () => {
    if (validateInputs()) {
   var verificationCode=   generateVerificationCode()
      Alert.alert('Success', 'Form submitted successfully!');



      async ()=>{
        await 
        AsyncStorage.setItem("hname", firstname+"  "+ lastname )
        AsyncStorage.setItem("hemail", email)
        AsyncStorage.setItem("haddress", address)
        AsyncStorage.setItem("hphonenumber", phone)
        AsyncStorage.setItem("state", state)
        AsyncStorage.setItem("lga", lga)
        AsyncStorage.setItem("gender",gender )
        AsyncStorage.setItem("DOB", dateOfBirth)
        AsyncStorage.setItem("emplaymenttype",employmentType)
        AsyncStorage.setItem("experience",experience )

      }
      console.log(firstname,lastname,email,phone,email,address,state,lga,gender,location,dateOfBirth,selectedJobs,verificationCode)
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

function codeValidation ({navigation}){
  return(
    <ScrollView>
      <Header></Header>
    </ScrollView>
  )
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

export {HSignup} ;
