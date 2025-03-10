
// ClientDashboard.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ClientDashboard = () => {
  const navigation = useNavigation();
  const [requests, setRequests] = useState([
    { id: '1', type: 'Full-time', status: 'Pending' },
    { id: '2', type: 'Part-time', status: 'Accepted' }
  ]);

  const navigateTo = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Client Dashboard</Text>
      
      {/* Request a Househelp */}
      <TouchableOpacity style={styles.button} onPress={() => navigateTo('Request')}>
        <Text style={styles.buttonText}>Request a Househelp</Text>
      </TouchableOpacity>
      
      {/* View Requests */}
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.requestItem}>
            <Text>{item.type} - {item.status}</Text>
          </View>
        )}
      />
      
      {/* Navigation Buttons */}
      <TouchableOpacity style={styles.button} onPress={() => navigateTo('Payment')}>
        <Text style={styles.buttonText}>Make a Payment</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={() => navigateTo('Notifications')}>
        <Text style={styles.buttonText}>View Notifications</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={() => navigateTo('Profile')}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  button: { backgroundColor: '#28a745', padding: 15, marginVertical: 5, borderRadius: 5 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  requestItem: { padding: 10, backgroundColor: '#fff', marginVertical: 5, borderRadius: 5 }
});

export default ClientDashboard;
