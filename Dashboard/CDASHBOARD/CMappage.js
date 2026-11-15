import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Animated } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../../pages/firebase';
import { Header2 } from '../../component/Header';
import { Cmenu } from '../../component/Menu';
import { Button } from '../../component/ui';
import { colors, space, radius, type, shadow } from '../../component/theme';

const CMappage = ({ navigation }) => {
  useKeepAwake(); // keep the screen on while tracking
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState(null);
  const [househelps, setHousehelps] = useState([]);
  const [requestData, setRequestData] = useState(null);
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobId, setJobId] = useState(null);
  const [problem, setProblem] = useState('');
  const bounceValue = useRef(new Animated.Value(1)).current;

  // 1. Initial data and location
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const request = await AsyncStorage.getItem('requestdata');
        const storedJobId = await AsyncStorage.getItem('jobId');
        if (!request) {
          setProblem('No request found. Make a request first, then open the map.');
          return;
        }
        const parsedRequest = JSON.parse(request);
        setRequestData(parsedRequest);
        setJobId(storedJobId || parsedRequest.id);

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setProblem('Location access is required to show nearby househelps.');
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation(loc.coords);

        // Never keep other people's passwords; the selected househelp's record is later written
        // into the job document, so the password must not be in it.
        const snap = await db.collection('househelps').get();
        setHousehelps(
          snap.docs.map((d) => {
            const { password, ...safe } = d.data();
            return { id: d.id, ...safe };
          })
        );
      } catch (e) {
        setProblem('We could not load the map. Check your connection and try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2. Live job updates (e.g. househelps accepting)
  useEffect(() => {
    if (!jobId) return;
    const unsubscribe = db
      .collection('partimeRequest')
      .doc(jobId)
      .onSnapshot(
        (snap) => {
          if (snap.exists) setRequestData({ id: snap.id, ...snap.data() });
        },
        () => {}
      );
    return () => unsubscribe();
  }, [jobId]);

  // 3. Pop animation when a househelp is selected
  useEffect(() => {
    if (selectedHelper) {
      Animated.sequence([
        Animated.timing(bounceValue, { toValue: 1.5, duration: 200, useNativeDriver: true }),
        Animated.spring(bounceValue, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();
    }
  }, [selectedHelper]);

  // 4. Notify househelps in the same LGA
  const handleSendPushNotification = async () => {
    if (!requestData?.clientData) return;
    try {
      let sent = 0;
      for (const help of househelps) {
        if (help.lga === requestData.clientData.lga && help.fcmtoken) {
          await fetch('https://househelp-app-h28t.vercel.app/sendNotificationToUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: help.fcmtoken,
              title: `New Job in ${requestData.clientData.lga}`,
              jobId: requestData.id,
              body: `Job: ${requestData.chores?.map((c) => c.chore).join(', ')} \nPay: ₦${requestData.totalCost}
             \n Client: Mr ${requestData.clientData.firstname} Apartment Size:${requestData.clientData.apartmentsize}`,
            }),
          });
          sent++;
        }
      }
      Alert.alert('Sent', `${sent} nearby househelps have been notified.`);
    } catch (e) {
      Alert.alert('Not sent', 'We could not notify nearby househelps. Try again.');
    }
  };

  useEffect(() => {
    handleSendPushNotification();
  }, [househelps]);

  const handleConfirm = async () => {
    if (!selectedHelper || !requestData) return;
    try {
      await AsyncStorage.setItem(jobId, JSON.stringify(requestData.id));
      await db.collection('partimeRequest').doc(requestData.id).update({
        househelpName: selectedHelper.househelpName,
        househelpId: selectedHelper.househelpId,
        househelpdata: selectedHelper.househelpdata,
        status: 'confirmed',
      });
      await AsyncStorage.setItem('jobId', requestData.id);
      await AsyncStorage.setItem('requestdata', JSON.stringify(requestData));
      navigation.navigate('arriving', { clientId: requestData.clientId, jobId: requestData.id });
    } catch (error) {
      Alert.alert('Error', 'Failed to confirm selection.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.centerText}>Setting up the map…</Text>
      </View>
    );
  }

  // Previously this screen spun forever when location was denied or no request existed.
  if (!location || !location.latitude) {
    return (
      <View style={styles.root}>
        <Header2 />
        <View style={styles.center}>
          <Ionicons name="location-outline" size={42} color={colors.muted} />
          <Text style={[styles.centerText, { textAlign: 'center', paddingHorizontal: space.xl }]}>
            {problem || 'We could not get your location.'}
          </Text>
          <Button title="Back" variant="secondary" onPress={() => navigation.goBack()} style={{ marginTop: space.lg, alignSelf: 'stretch', marginHorizontal: space.xl }} />
        </View>
        <Cmenu navigation={navigation} />
      </View>
    );
  }

  const accepted = requestData?.acceptedHelpers || [];

  return (
    <View style={styles.root}>
      <Header2 />
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} title="My location" pinColor="green" />

        {househelps.map((helper, index) => {
          try {
            if (!helper.location) return null;
            const loc = typeof helper.location === 'string' ? JSON.parse(helper.location) : helper.location;
            if (!loc?.latitude || !loc?.longitude) return null;
            const isSelected = selectedHelper?.househelpId === helper.id;
            // The old marker showed 4 stars for everyone; stars now only appear for a real rating.
            const rating = typeof helper.rating === 'number' ? helper.rating : null;
            return (
              <Marker
                key={helper.id || index}
                coordinate={{ latitude: parseFloat(loc.latitude), longitude: parseFloat(loc.longitude) }}
                title={helper.name}
                onPress={() =>
                  setSelectedHelper({ househelpId: helper.id, househelpName: helper.name, househelpdata: helper })
                }
              >
                <Animated.View style={{ transform: [{ scale: isSelected ? bounceValue : 1 }], alignItems: 'center' }}>
                  <View style={styles.marker}>
                    <FontAwesome name="user-circle" size={30} color={isSelected ? colors.primary : '#555'} />
                    {rating !== null ? (
                      <View style={{ flexDirection: 'row' }}>
                        {[...Array(5)].map((_, i) => (
                          <FontAwesome key={i} name={i < Math.round(rating) ? 'star' : 'star-o'} size={10} color="#f1c40f" />
                        ))}
                      </View>
                    ) : null}
                  </View>
                </Animated.View>
              </Marker>
            );
          } catch (e) {
            return null;
          }
        })}
      </MapView>

      <View style={[styles.sheet, { paddingBottom: space.lg + insets.bottom }]}>
        <View style={styles.handle} />
        {accepted.length > 0 ? (
          <View style={{ marginBottom: space.md }}>
            <Text style={type.h2}>Househelps who accepted</Text>
            {accepted.map((helper, idx) => {
              const on = selectedHelper?.househelpId === helper.househelpId;
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedHelper(helper)}
                  style={[styles.helperRow, on && styles.helperRowOn]}
                  activeOpacity={0.8}
                >
                  <Ionicons name={on ? 'checkmark-circle' : 'person-circle-outline'} size={22} color={on ? colors.white : colors.primary} />
                  <Text style={[styles.helperText, on && { color: colors.white }]}>{helper.househelpName}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <Text style={styles.hint}>
            {selectedHelper ? `Selected: ${selectedHelper.househelpName}` : 'Tap a househelp on the map to select them.'}
          </Text>
        )}
        <Button title="Confirm selected househelp" onPress={handleConfirm} disabled={!selectedHelper} />
        <TouchableOpacity onPress={handleSendPushNotification} style={styles.alertBtn}>
          <Text style={styles.alertText}>Alert nearby househelps</Text>
        </TouchableOpacity>
      </View>

      {/* The bottom sheet fills the bottom of this screen, so the menu button sits at the top. */}
      <Cmenu navigation={navigation} fabStyle={{ top: insets.top + 76, right: 16 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  centerText: { color: colors.muted, marginTop: space.md },
  marker: { alignItems: 'center', backgroundColor: colors.white, padding: 5, borderRadius: radius.md, elevation: 3 },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: space.lg,
    ...shadow,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: space.md },
  hint: { color: colors.muted, textAlign: 'center', marginBottom: space.md },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    marginTop: space.sm,
  },
  helperRowOn: { backgroundColor: colors.primary },
  helperText: { fontSize: 15, fontWeight: '600', color: colors.text },
  alertBtn: { padding: space.md, alignItems: 'center', marginTop: space.xs },
  alertText: { color: colors.primary, fontWeight: '700' },
});

export { CMappage };
