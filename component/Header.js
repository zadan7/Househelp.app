import * as React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import logo from '../assets/Househelp.png';
import { colors, space } from './theme';

// Branded top bar used by the older screens. Works with or without the `navigation`
// prop (several dashboards render <Header2 /> with no props, which used to crash on tap).
const Bar = ({ navigation }) => {
  const hookNav = useNavigation();
  const nav = navigation || hookNav;
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + space.sm }]}>
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.8}
        onPress={() => nav.navigate('Home')}
        accessibilityLabel="Go to home"
      >
        <View style={styles.logoWrap}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.brand}>Househelp</Text>
      </TouchableOpacity>
    </View>
  );
};

const Header = ({ navigation }) => <Bar navigation={navigation} />;
const Header2 = ({ navigation }) => <Bar navigation={navigation} />;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingBottom: space.md,
    paddingHorizontal: space.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  logoWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: { width: 32, height: 32 },
  brand: { color: colors.white, fontSize: 20, fontWeight: '800', letterSpacing: 0.3 },
});

export { Header, Header2 };
