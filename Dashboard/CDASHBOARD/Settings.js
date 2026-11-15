import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import { Card, Field, Button, InfoRow } from '../../component/ui';
import { colors, space, radius, type, shadow } from '../../component/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { storage, db } from '../../pages/firebase'; // native Firebase storage and db

const IMAGE_ACTIONS = [
  { key: 'profilePic', label: 'Change Profile Picture', icon: 'person-circle-outline' },
  { key: 'apartmentInside', label: 'Change Apartment Inside Image', icon: 'bed-outline' },
  { key: 'houseFront', label: 'Change House Front Image', icon: 'home-outline' },
];

const Csettings = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await AsyncStorage.getItem('clientdata');
        if (data) {
          const parsedData = JSON.parse(data);
          setUser(parsedData);
          setUpdatedUser(parsedData); // Initialize updatedUser state with fetched data
        }
      } catch (error) {
        console.error('Error fetching client data: ', error);
      }
    };
    fetchData();
  }, []);

  // Function to handle image selection
  const pickImage = (imageType) => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.errorCode || !response.assets || !response.assets.length) {
        return;
      }

      const source = response.assets[0];
      uploadImageToFirebase(source.uri, imageType);
    });
  };

  // Function to upload image to Firebase Storage.
  // Fixed: this used the web modular API (ref/uploadBytes/doc/updateDoc) on the native
  // @react-native-firebase instances exported by pages/firebase, which throws at runtime.
  const uploadImageToFirebase = async (uri, imageType) => {
    setLoading(true);
    try {
      const imageRef = storage.ref(`clients/${user.id}/${imageType}`);
      await imageRef.putFile(uri.replace('file://', ''));
      const downloadURL = await imageRef.getDownloadURL();

      // Update the Firestore document with the new image URL
      await db.collection('clients').doc(user.id).update({
        [imageType]: downloadURL,
      });

      // Update user data locally and in AsyncStorage
      const newUser = { ...user, [imageType]: downloadURL };
      setUser(newUser);
      setUpdatedUser(prevUser => ({ ...prevUser, [imageType]: downloadURL }));
      await AsyncStorage.setItem('clientdata', JSON.stringify(newUser));

      Alert.alert('Success', 'Image updated successfully!');
    } catch (error) {
      console.error('Error uploading image: ', error);
      Alert.alert('Error', 'Failed to update image.');
    } finally {
      setLoading(false);
    }
  };

  // Handle field changes
  const handleInputChange = (field, value) => {
    setUpdatedUser(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  // Function to save updated user data to Firebase and AsyncStorage
  const saveData = async () => {
    setSaving(true);
    try {
      await db.collection('clients').doc(user.id).update(updatedUser);

      await AsyncStorage.setItem('clientdata', JSON.stringify(updatedUser));
      setUser(updatedUser);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile: ', error);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.root}>
        <Header2 />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.muted}>Loading...</Text>
        </View>
        <Cmenu navigation={navigation} />
      </View>
    );
  }

  const loc = updatedUser.location;
  const locationText = loc && loc.latitude != null ? `Lat: ${loc.latitude}, Lon: ${loc.longitude}` : '';
  const created = user.createdAt ? new Date(user.createdAt) : null;

  return (
    <View style={styles.root}>
      <Header2 />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={[type.h1, { marginBottom: space.lg }]}>Settings</Text>

        <Card title="Profile" icon="person-outline">
          <View style={styles.avatarRow}>
            {user.profilePic ? (
              <Image source={{ uri: user.profilePic }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarEmpty]}>
                <Ionicons name="person" size={36} color={colors.primary} />
              </View>
            )}
            {loading ? <ActivityIndicator color={colors.primary} /> : null}
          </View>
          <Field label="Name" value={updatedUser.name} onChangeText={(text) => handleInputChange('name', text)} placeholder="Name" />
          <Field label="Email" value={updatedUser.email} onChangeText={(text) => handleInputChange('email', text)} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
          <Field label="Phone" value={updatedUser.phone} onChangeText={(text) => handleInputChange('phone', text)} placeholder="Phone" keyboardType="phone-pad" />
        </Card>

        <Card title="Update Images" icon="images-outline">
          {IMAGE_ACTIONS.map((a) => (
            <TouchableOpacity key={a.key} style={styles.imageButton} onPress={() => pickImage(a.key)} disabled={loading} activeOpacity={0.85}>
              <Ionicons name={a.icon} size={22} color={colors.primary} />
              <Text style={styles.imageButtonText}>{a.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </TouchableOpacity>
          ))}
        </Card>

        <Card title="Personal Details" icon="document-text-outline">
          <Field label="Address" value={updatedUser.address} onChangeText={(text) => handleInputChange('address', text)} placeholder="Address" />
          <Field label="Apartment Type" value={updatedUser.apartmentType} onChangeText={(text) => handleInputChange('apartmentType', text)} placeholder="Apartment Type" />
          <Field label="LGA" value={updatedUser.lga} onChangeText={(text) => handleInputChange('lga', text)} placeholder="LGA" />
          <Field label="State" value={updatedUser.state} onChangeText={(text) => handleInputChange('state', text)} placeholder="State" />
          <Field label="Location" value={locationText} editable={false} />
          <InfoRow label="Account Created" value={created && !isNaN(created) ? created.toLocaleString() : ''} last />
        </Card>

        <Button title="Save Changes" onPress={saveData} loading={saving} disabled={loading} />
      </ScrollView>

      <Cmenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 110 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md },
  muted: { color: colors.muted },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: colors.primarySoft },
  avatarEmpty: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  imageButton: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 52,
    paddingHorizontal: space.md, borderRadius: radius.md, backgroundColor: colors.primarySoft,
  },
  imageButtonText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
});

export { Csettings };
