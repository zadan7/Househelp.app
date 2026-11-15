import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, Animated, StyleSheet, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space, radius, shadow } from './theme';

const DRAWER_W = 290;

const CLIENT_ITEMS = [
  { label: 'Dashboard', icon: 'home-outline', route: 'cdashboard' },
  { label: 'Make request', icon: 'add-circle-outline', route: 'cmakerequest' },
  { label: 'Househelp list', icon: 'people-outline', route: 'cHousehelplist' },
  { label: 'Pending jobs', icon: 'clipboard-outline', route: 'requestconfirmation' },
  { label: 'Completed jobs', icon: 'checkmark-done-outline', route: 'ccompletedjobs' },
  { label: 'Map', icon: 'map-outline', route: 'cmappage' },
  { label: 'Balances', icon: 'wallet-outline', route: 'cwallet' },
  { label: 'Refer & earn', icon: 'gift-outline', route: 'referandearn' },
  { label: 'Profile', icon: 'person-outline', route: 'cprofile' },
  { label: 'Settings', icon: 'settings-outline', route: 'csettings' },
];

// The old househelp "Settings" entry pointed at a route that is not registered ("hsettings")
// and crashed on tap, so it is left out until that screen exists.
const HOUSEHELP_ITEMS = [
  { label: 'Dashboard', icon: 'home-outline', route: 'hdashboard' },
  { label: 'Fulltime requests', icon: 'briefcase-outline', route: 'hfulltime' },
  { label: 'Partime requests', icon: 'time-outline', route: 'hpartime' },
  { label: 'Applied jobs', icon: 'calendar-outline', route: 'happliedjobs' },
  { label: 'Wallet', icon: 'wallet-outline', route: 'hwallet' },
  { label: 'Profile', icon: 'person-outline', route: 'hprofile' },
];

const Drawer = ({ navigation, items, storageKey, roleLabel, fabStyle }) => {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const slide = useRef(new Animated.Value(-DRAWER_W)).current;

  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then((raw) => raw && setProfile(JSON.parse(raw)))
      .catch(() => {});
  }, [storageKey]);

  const toggle = (to) => {
    Animated.timing(slide, { toValue: to ? 0 : -DRAWER_W, duration: 250, useNativeDriver: true }).start();
    setOpen(to);
  };

  const state = navigation?.getState?.();
  const current = state?.routes?.[state.index]?.name;

  const go = (route) => {
    toggle(false);
    if (route !== current) navigation.navigate(route);
  };

  const logout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'login' }] }));
        },
      },
    ]);
  };

  const name = profile
    ? profile.firstname
      ? `${profile.firstname} ${profile.lastname || ''}`.trim()
      : profile.name || 'Welcome'
    : 'Welcome';
  const photo = profile?.facepicture || profile?.url;

  return (
    <>
      <TouchableOpacity
        style={[styles.fab, fabStyle || { bottom: 28 + insets.bottom }]}
        onPress={() => toggle(true)}
        accessibilityLabel="Open menu"
        activeOpacity={0.85}
      >
        <Ionicons name="menu" size={28} color={colors.white} />
      </TouchableOpacity>

      {open ? <Pressable style={styles.backdrop} onPress={() => toggle(false)} /> : null}

      <Animated.View
        style={[styles.drawer, { paddingTop: insets.top + space.lg, transform: [{ translateX: slide }] }]}
        pointerEvents={open ? 'auto' : 'none'}
      >
        <View style={styles.profile}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarEmpty]}>
              <Ionicons name="person" size={26} color={colors.primary} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <Text style={styles.role}>{roleLabel}</Text>
          </View>
          <TouchableOpacity onPress={() => toggle(false)} accessibilityLabel="Close menu">
            <Ionicons name="close" size={24} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          {items.map((it) => {
            const active = it.route === current;
            return (
              <TouchableOpacity
                key={it.route}
                onPress={() => go(it.route)}
                style={[styles.item, active && styles.itemActive]}
                activeOpacity={0.7}
              >
                <Ionicons name={it.icon} size={21} color={active ? colors.primary : colors.muted} />
                <Text style={[styles.itemText, active && { color: colors.primary, fontWeight: '700' }]}>{it.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity onPress={logout} style={[styles.item, styles.logout, { marginBottom: insets.bottom + space.md }]}>
          <Ionicons name="log-out-outline" size={21} color={colors.danger} />
          <Text style={[styles.itemText, { color: colors.danger }]}>Log out</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

const Cmenu = ({ navigation, fabStyle }) => (
  <Drawer navigation={navigation} items={CLIENT_ITEMS} storageKey="clientdata" roleLabel="Client" fabStyle={fabStyle} />
);

const Hmenu = ({ navigation, fabStyle }) => (
  <Drawer navigation={navigation} items={HOUSEHELP_ITEMS} storageKey="househelpdata" roleLabel="Househelp" fabStyle={fabStyle} />
);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    ...shadow,
    elevation: 6,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 20, 14, 0.5)',
    zIndex: 1500,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_W,
    backgroundColor: colors.white,
    paddingHorizontal: space.lg,
    zIndex: 2000,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingBottom: space.lg,
    marginBottom: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarEmpty: { backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  role: { fontSize: 12, color: colors.muted, marginTop: 2 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: 12,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    marginBottom: 2,
  },
  itemActive: { backgroundColor: colors.primarySoft },
  itemText: { fontSize: 15, color: colors.text },
  logout: { borderTopWidth: 1, borderTopColor: colors.border, borderRadius: 0, paddingTop: space.lg },
});

export { Cmenu, Hmenu };
