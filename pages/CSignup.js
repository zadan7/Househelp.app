import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

import NigerianStateAndLGASelector from '../component/NigerianStateAndLGASelector';
import { Screen, ScreenHeader, Card, Field, Select, PhotoTile, Button, ErrorText } from '../component/ui';
import { colors, space, radius, type } from '../component/theme';
import { db } from './firebase';
import { generateVerificationCode, sendVerificationEmail } from '../services/verification';
import { registerForPushNotificationsAsync, registerForFcmToken } from '../services/notifications';
import { uploadPhoto, safeKey } from '../services/storage';
import { uploadToCloudinary } from '../component/CLoudinary';

const APARTMENT_SIZES = ['1 bedroom', '2 bedrooms', '3 bedrooms flat', '4 bedrooms flat'];
const GENDERS = ['Male', 'Female'];

const initialForm = {
  firstname: '',
  lastname: '',
  phone: '',
  email: '',
  password: '',
  Cpassword: '',
  address: '',
  apartmentsize: '',
  gender: '',
  state: '',
  lga: '',
  facePicture: '',
  frontview: '',
  insideview: '',
};

/* =====================================================================
   Step 1: client signup form
   ===================================================================== */
const CSignup = ({ navigation }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [location, setLocation] = useState(null);
  const [locStatus, setLocStatus] = useState('loading'); // loading | ok | denied
  const [submitting, setSubmitting] = useState(false);

  // Update one field and clear its error.
  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  // Stable callbacks for the state/LGA selector.
  const onState = useCallback((v) => {
    setForm((f) => ({ ...f, state: v }));
    setErrors((e) => ({ ...e, state: undefined }));
  }, []);
  const onLGA = useCallback((v) => {
    setForm((f) => ({ ...f, lga: v }));
    setErrors((e) => ({ ...e, lga: undefined }));
  }, []);

  const fetchLocation = useCallback(async () => {
    setLocStatus('loading');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocStatus('denied');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setLocation(pos.coords);
      setLocStatus('ok');
      setErrors((e) => ({ ...e, location: undefined }));
    } catch (err) {
      setLocStatus('denied');
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const takePhoto = async (key) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera needed', 'Please allow camera access to take this photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
    });
    if (!result.canceled) set(key)(result.assets[0].uri);
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
    if (!f.address.trim()) e.address = 'Enter your street address.';
    if (!f.apartmentsize) e.apartmentsize = 'Choose your apartment size.';
    if (!f.gender) e.gender = 'Select your gender.';
    if (!f.state) e.state = 'Select your state.';
    if (!f.lga) e.lga = 'Select your LGA.';
    if (!location) e.location = 'We need your location to match you with nearby househelps.';
    if (!f.facePicture) e.facePicture = 'A photo of your face is required.';
    if (!f.frontview) e.frontview = 'A photo of the front of your house is required.';
    if (!f.insideview) e.insideview = 'A photo inside your apartment is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) {
      Alert.alert('Almost there', 'Please fix the highlighted fields.');
      return;
    }
    setSubmitting(true);
    try {
      const email = form.email.trim().toLowerCase();

      // Only ask the database about THIS email instead of downloading every client.
      const dup = await db.collection('clients').where('email', '==', email).limit(1).get();
      if (!dup.empty) {
        setErrors((e) => ({ ...e, email: 'This email is already registered. Try logging in.' }));
        return;
      }

      const verificationCode = generateVerificationCode();
      await sendVerificationEmail({
        name: `${form.firstname.trim()} ${form.lastname.trim()}`,
        code: verificationCode,
        email,
      });

      // Same shape the rest of the app already expects (Cpassword is no longer stored).
      const newData = {
        facepicture: form.facePicture,
        frontview: form.frontview,
        insideview: form.insideview,
        location,
        state: form.state,
        lga: form.lga,
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        phone: form.phone.trim(),
        email,
        address: form.address.trim(),
        verificationCode,
        gender: form.gender,
        apartmentsize: form.apartmentsize,
        password: form.password,
        expotoken: null,
        fcmtoken: null,
      };
      await AsyncStorage.setItem('data', JSON.stringify(newData));
      navigation.navigate('codevalidation2');
    } catch (err) {
      Alert.alert(
        "Couldn't continue",
        'We could not send your verification email. Check your connection and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <ScreenHeader
        title="Create your account"
        subtitle="Tell us about you and your home so we can match you with verified househelps."
        onBack={() => navigation.goBack()}
        step={1}
        totalSteps={2}
      />

      <Card title="About you" icon="person-outline">
        <Field label="First name" value={form.firstname} onChangeText={set('firstname')} error={errors.firstname} autoCapitalize="words" />
        <Field label="Last name" value={form.lastname} onChangeText={set('lastname')} error={errors.lastname} autoCapitalize="words" />
        <Field label="Phone number" value={form.phone} onChangeText={set('phone')} error={errors.phone} keyboardType="phone-pad" placeholder="08012345678" />
        <Field label="Email" value={form.email} onChangeText={set('email')} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        <Select label="Gender" value={form.gender} onChange={set('gender')} items={GENDERS} placeholder="Select gender" error={errors.gender} />
      </Card>

      <Card title="Password" icon="lock-closed-outline">
        <Field label="Password" value={form.password} onChangeText={set('password')} error={errors.password} secure hint="At least 6 characters" autoCapitalize="none" />
        <Field label="Confirm password" value={form.Cpassword} onChangeText={set('Cpassword')} error={errors.Cpassword} secure autoCapitalize="none" />
      </Card>

      <Card title="Your home" icon="home-outline">
        <Field label="Street address" value={form.address} onChangeText={set('address')} error={errors.address} />
        <Select label="Apartment size" value={form.apartmentsize} onChange={set('apartmentsize')} items={APARTMENT_SIZES} placeholder="Select apartment size" error={errors.apartmentsize} />
        <NigerianStateAndLGASelector onStateChange={onState} onLGAChange={onLGA} />
        <ErrorText>{errors.state}</ErrorText>
        <ErrorText>{errors.lga}</ErrorText>

        <View style={[styles.locRow, locStatus === 'ok' && styles.locOk, locStatus === 'denied' && styles.locBad]}>
          <Ionicons
            name={locStatus === 'ok' ? 'checkmark-circle' : locStatus === 'denied' ? 'alert-circle' : 'locate'}
            size={20}
            color={locStatus === 'denied' ? colors.danger : colors.primary}
          />
          <Text style={styles.locText}>
            {locStatus === 'ok' && 'Location captured'}
            {locStatus === 'loading' && 'Getting your location…'}
            {locStatus === 'denied' && 'Location is off. We need it to show nearby househelps.'}
          </Text>
          {locStatus === 'denied' ? (
            <TouchableOpacity onPress={fetchLocation}>
              <Text style={styles.retry}>Retry</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <ErrorText>{errors.location}</ErrorText>
      </Card>

      <Card title="Photos" icon="camera-outline">
        <PhotoTile label="Your face" hint="Take a clear selfie" uri={form.facePicture} onPress={() => takePhoto('facePicture')} error={errors.facePicture} />
        <PhotoTile label="Front of your house" hint="Photo of the outside" uri={form.frontview} onPress={() => takePhoto('frontview')} error={errors.frontview} />
        <PhotoTile label="Inside your apartment" hint="Photo of the inside" uri={form.insideview} onPress={() => takePhoto('insideview')} error={errors.insideview} />
      </Card>

      <Button title="Continue" onPress={handleContinue} loading={submitting} />
      <TouchableOpacity onPress={() => navigation.navigate('login')} style={{ alignSelf: 'center', padding: space.lg }}>
        <Text style={{ color: colors.muted }}>
          Already have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Log in</Text>
        </Text>
      </TouchableOpacity>
    </Screen>
  );
};

/* =====================================================================
   Step 2: verify email code, upload photos, create the account
   ===================================================================== */
function CodeValidation2({ navigation }) {
  const [data, setData] = useState(null);
  const [ready, setReady] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('data');
        if (raw) setData(JSON.parse(raw));
      } catch (e) {
        // fall through to the "start again" state
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const withTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Operation timed out')),
        ms
      )
    ),
  ]);
};


const withRetry = async (fn, retries = 3, delay = 2000) => {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i < retries - 1) {
        await new Promise(resolve =>
          setTimeout(resolve, delay)
        );
      }
    }
  }

  throw lastError;
};

 const handleConfirm = async () => {
  if (!data) return;
  if (code.trim() !== data.verificationCode) {
    setError('That code is not correct. Check your email and try again.');
    return;
  }
  setError('');
  setLoading(true);

  let step = 'start';
  try {
    // 1. Push tokens: optional, never block signup
    step = 'tokens';
    const [expotoken, fcmtoken] = await Promise.all([
      withTimeout(registerForPushNotificationsAsync(), 8000).catch(() => null),
      withTimeout(registerForFcmToken(), 8000).catch(() => null),
    ]);

    // 2. Photos: one at a time, with retry, skipping ones already uploaded
    step = 'photos';
    const folder = `clients/${safeKey(data.email)}`;
    const uploaded = { ...(data.uploaded || {}) }; // cache across retries
    const photos = [
      ['facepicture', 'face.jpg'],
      ['frontview', 'front.jpg'],
      ['insideview', 'inside.jpg'],
    ];
    for (const [key, file] of photos) {
      if (uploaded[key]) continue;
      uploaded[key] = await withRetry(() =>
        withTimeout(uploadToCloudinary(data[key], `${folder}/${file}`), 600000)
      );
      // persist progress so a retry doesn't redo finished uploads
      const next = { ...data, uploaded };
      setData(next);
      await AsyncStorage.setItem('data', JSON.stringify(next));
    }

    // 3. Save account: use email as the doc ID so retries can't create duplicates
    step = 'save';
    const { uploaded: _drop, ...clean } = data;
    const record = {
      ...clean,
      ...uploaded,
      expotoken,
      fcmtoken,
      createdAt: new Date().toISOString(),
    };
    const docId = safeKey(data.email);
    await withRetry(() => db.collection('clients').doc(docId).set(record));
    await AsyncStorage.removeItem('data');

    Alert.alert('Welcome to Househelp', 'Your account is ready. Please log in.', [
      { text: 'Log in', onPress: () => navigation.navigate('login') },
    ]);
  } catch (err) {
    console.log('Signup failed at step:', step, err);
    Alert.alert(
      'Could not finish signup',
      step === 'photos'
        ? 'Your photos are taking too long to upload. Your progress is saved, so tap Confirm again.'
        : 'Your connection seems weak. Tap Confirm again to continue where you left off.'
    );
  } finally {
    setLoading(false);
  }
};

  const resend = async () => {
    if (!data) return;
    setResending(true);
    try {
      await sendVerificationEmail({
        name: `${data.firstname} ${data.lastname}`,
        code: data.verificationCode,
        email: data.email,
      });
      Alert.alert('Code sent', `We sent the code again to ${data.email}.`);
    } catch (e) {
      Alert.alert('Could not resend', 'Please try again in a moment.');
    } finally {
      setResending(false);
    }
  };

  if (ready && !data) {
    return (
      <Screen>
        <ScreenHeader title="Session expired" subtitle="We could not find your signup details. Please start again." onBack={() => navigation.navigate('CSignup')} />
        <Button title="Start again" onPress={() => navigation.navigate('CSignup')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        title="Verify your email"
        subtitle={data ? `Enter the 6-digit code we sent to ${data.email}.` : 'Loading…'}
        onBack={() => navigation.goBack()}
        step={2}
        totalSteps={2}
      />
      <Card>
        <Field
          label="Verification code"
          value={code}
          onChangeText={(t) => {
            setCode(t.replace(/[^0-9]/g, ''));
            setError('');
          }}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="••••••"
          error={error}
          textAlign="center"
          inputStyle={{ fontSize: 26, letterSpacing: 8, fontWeight: '700' }}
        />
        <Button title="Confirm and create account" onPress={handleConfirm} loading={loading} disabled={code.length < 6} />
        <Button title="Resend code" variant="secondary" onPress={resend} loading={resending} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
  },
  locOk: { backgroundColor: colors.primarySoft },
  locBad: { backgroundColor: colors.dangerSoft },
  locText: { ...type.body, flex: 1, fontSize: 13 },
  retry: { color: colors.primary, fontWeight: '700' },
});

export { CSignup, CodeValidation2 };
