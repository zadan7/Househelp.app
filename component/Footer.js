import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, space } from './theme';

const Footer = () => (
  <View style={styles.container}>
    {/* <Text style={styles.text}>© {new Date().getFullYear()} Owned by Zextras Househelp Services </Text> */}
    <Text style={[styles.text, { textAlign: 'center' }]}>© {new Date().getFullYear()} Owned by Zextras Househelp Services All rights reserved.</Text>

  </View>
);

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: space.xl, paddingBottom: 90 },
  text: { color: colors.muted, fontSize: 12 },
});

export { Footer };
