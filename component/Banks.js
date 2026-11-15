import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors, space, radius, type } from './theme';

const BankPicker = ({ onBankSelect }) => {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [loading, setLoading] = useState(true);

   const fetchBanks = async () => {
    try {
      // Flutterwave API to get Nigerian banks
      const response = await fetch('https://api.flutterwave.com/v3/banks/NG', {
        headers: {
          Authorization: `Bearer FLWSECK_TEST-450e87bd5ed43bc7de04ad17f8c42cd3-X`, // Use your Secret Key here
        },
      }); 
      const json = await response.json();
      if (json.status === 'success') {
        // Sort banks alphabetically by name
        const sortedBanks = json.data.sort((a, b) => a.name.localeCompare(b.name));
        setBanks(sortedBanks);
      }
    } catch (error) {
      console.error("Error fetching banks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

 

  return (
    <View style={styles.container}>
      <Text style={type.label}>Select Your Bank</Text>
      
      {loading ? (
        <View style={[styles.pickerWrapper, { paddingHorizontal: space.md }]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Loading banks...</Text>
        </View>
      ) : (
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedBank}
            onValueChange={(itemValue, itemIndex) => {
              setSelectedBank(itemValue);
              // Pass the code and name back to your registration form
              onBankSelect(itemValue); 
            }}
            style={{ flex: 1, color: colors.text }}
          >
            <Picker.Item label="Choose a bank..." value="" color="#9AABA2" />
            {banks.map((bank) => (
              <Picker.Item 
                key={bank.id} 
                label={bank.name} 
                value={bank.code} 
              />
            ))}
          </Picker>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', gap: 6 },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    overflow: 'hidden',
    paddingHorizontal: 0,
  },
  loadingText: { marginLeft: space.sm, color: colors.muted, fontSize: 14 },
});

export default BankPicker;
