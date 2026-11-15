import React, { useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen, ScreenHeader, Card, Field, Button } from '../../../component/ui';
import NigerianStateAndLGASelector from '../../../component/NigerianStateAndLGASelector';

function PartDetails({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('');
  const [LGA, setLga] = useState('');
  const [errors, setErrors] = useState({});

  const clear = (k) => errors[k] && setErrors((p) => ({ ...p, [k]: undefined }));

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Name is required.';
    if (!/^\d{10,15}$/.test(phone.trim())) e.phone = 'Phone number must be 10-15 digits.';
    if (!address.trim()) e.address = 'Address is required.';
    if (!/\S+@\S+\.\S+/.test(email.trim())) e.email = 'Invalid email format.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const done = async () => {
    if (!validate()) return Alert.alert('Check your details', 'Please correct the highlighted fields.');
    try {
      await AsyncStorage.multiSet([
        ['name', name.trim()],
        ['phone', phone.trim()],
        ['address', address.trim()],
        ['email', email.trim()],
        ['state', state || ''],
        ['lga', LGA || ''],
      ]);
      // The old code navigated to 'mappage', which is not a registered route (crash).
      // Requests need an account, so continue to login.
      navigation.navigate('login');
    } catch (e) {
      Alert.alert('Error', 'Could not save your details. Please try again.');
    }
  };

  return (
    <Screen>
      <ScreenHeader title="Your information" subtitle="Tell us how to reach you." onBack={() => navigation.goBack()} />
      <Card>
        <Field label="Full name" value={name} onChangeText={(t) => { setName(t); clear('name'); }} error={errors.name} />
        <Field label="Phone number" value={phone} onChangeText={(t) => { setPhone(t); clear('phone'); }} error={errors.phone} keyboardType="phone-pad" />
        <NigerianStateAndLGASelector state={state} lga={LGA} onStateChange={setState} onLGAChange={setLga} />
        <Field label="Address" value={address} onChangeText={(t) => { setAddress(t); clear('address'); }} error={errors.address} />
        <Field label="Email" value={email} onChangeText={(t) => { setEmail(t); clear('email'); }} error={errors.email} keyboardType="email-address" autoCapitalize="none" />
      </Card>
      <Button title="Done" onPress={done} />
    </Screen>
  );
}

export { PartDetails };
