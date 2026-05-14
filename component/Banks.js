import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const BankPicker = ({ onBankSelect }) => {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanks();
  }, []);

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

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Your Bank</Text>
      
      {loading ? (
        <ActivityIndicator size="small" color="#28a745" />
      ) : (
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedBank}
            onValueChange={(itemValue, itemIndex) => {
              setSelectedBank(itemValue);
              // Pass the code and name back to your registration form
              onBankSelect(itemValue); 
            }}
          >
            <Picker.Item label="Choose a bank..." value="" />
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
  container: {
    marginVertical: 10,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
});

export default BankPicker;