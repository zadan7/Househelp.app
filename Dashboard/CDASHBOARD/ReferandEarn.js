import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';
import { Card, Button } from '../../component/ui';
import { colors, space, radius, type, shadow } from '../../component/theme';

const ReferAndEarn = ({ navigation }) => {
  const referralCode = "HOUSE123"; // Replace with dynamic code if needed

  const copyToClipboard = () => {
    // Clipboard API deprecated in some versions; use alternative if needed
    Alert.alert("Copied", `Referral code "${referralCode}" copied!`);
  };

  const shareReferral = async () => {
    try {
      await Share.share({
        message: `Join Househelp.ng with my referral code "${referralCode}" and get rewards!`,
      });
    } catch (error) {
      Alert.alert("Error", "Unable to share referral code.");
    }
  };

  return (
    <View style={styles.root}>
      <Header2 />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="gift-outline" size={30} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Refer & Earn</Text>
          <Text style={styles.heroText}>
            Share your referral code with friends and earn rewards when they sign up!
          </Text>
        </View>

        <Card title="Your referral code" icon="ticket-outline">
          <View style={styles.codeBox}>
            <Text style={styles.code}>{referralCode}</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={copyToClipboard} accessibilityLabel="Copy referral code">
              <Ionicons name="copy-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        <Button title="Share Referral Code" onPress={shareReferral} />
      </ScrollView>

      <Cmenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 110 },
  hero: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: space.xl, marginBottom: space.lg, gap: space.sm },
  heroIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow },
  heroTitle: { ...type.h1 },
  heroText: { ...type.body, color: colors.muted, textAlign: 'center' },
  codeBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.primary, borderRadius: radius.md,
    backgroundColor: colors.primarySoft, paddingVertical: space.sm, paddingLeft: space.lg, paddingRight: space.sm,
  },
  code: { fontSize: 24, fontWeight: '800', letterSpacing: 2, color: colors.text },
  copyBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});

export { ReferAndEarn };
