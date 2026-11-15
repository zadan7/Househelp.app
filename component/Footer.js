import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, space } from './theme';

const Footer = () => (
  <View style={styles.container}>
    <Text style={styles.text}>© {new Date().getFullYear()} Househelp.ng. All rights reserved.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: space.xl, paddingBottom: 90 },
  text: { color: colors.muted, fontSize: 12 },
});

export { Footer };
