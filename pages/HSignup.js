import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, Alert, TextInput } from 'react-native';
import { Header } from "../component/Header"
import { Footer } from  "../component/Footer"
import NigerianStateAndLGASelector from '../component/NigerianStateAndLGASelector';

function HSignup({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('');
  const [lga, setLGA] = useState('');
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required.';
    if (!phone.trim() || !/^\d{10,15}$/.test(phone)) newErrors.phone = 'Phone number must be 10-15 digits.';
    if (!address.trim()) newErrors.address = 'Address is required.';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format.';
    if (!state.trim()) newErrors.state = 'State is required.';
    if (!lga.trim()) newErrors.lga = 'LGA is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDone = () => {
    if (validateInputs()) {
      Alert.alert(
        'Success',
        `Form submitted successfully!\n\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\nEmail: ${email}\nState: ${state}\nLGA: ${lga}`
      );
      console.log(name,state,lga)
      
      // Example navigation: navigation.navigate('NextScreen');
    } else {
      Alert.alert('Validation Failed', 'Please correct the highlighted fields.');
      console.log(name,state,lga)
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Header navigation={navigation} />
        <Text style={styles.title}>Enter your Personal Information</Text>
        <View style={styles.formContainer}>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Enter your name</Text>
            <TextInput
              style={[styles.input, errors.name && styles.errorInput]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
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
    // paddingVertical: 20,
    height: "auto",
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
  inputContainer:{
    width:"90%",
    padding:10
  },
  input: {
    padding: 10,
    borderColor: 'green',
    borderWidth: 1,
    borderRadius: 5,
    textAlign: 'center',
    marginBottom: 10,
    width:"100%"
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
    fontSize: 15,
    textAlign: 'center',
  },
});

export { HSignup };
