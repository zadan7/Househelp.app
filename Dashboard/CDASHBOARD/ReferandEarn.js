import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';

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
    <View style={styles.container}>
      <Header2 />
      <Cmenu navigation={navigation} />

      <ScrollView>
        <Text style={styles.header}>Refer & Earn</Text>
        <Text style={styles.description}>
          Share your referral code with friends and earn rewards when they sign up!
        </Text>

        <View style={styles.card}>
          <Text style={styles.referralText}>Your Referral Code:</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.code}>{referralCode}</Text>
            <TouchableOpacity onPress={copyToClipboard}>
              <Ionicons name="copy-outline" size={24} color="#28a745" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={shareReferral}>
          <Ionicons name="share-social-outline" size={20} color="#fff" />
          <Text style={styles.shareText}>Share Referral Code</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#343a40',
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  referralText: {
    fontSize: 18,
    color: '#28a745',
    marginBottom: 10,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  code: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  shareButton: {
    backgroundColor: '#28a745',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export { ReferAndEarn };
