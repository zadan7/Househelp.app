import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
// import { db } from './../pages/firebase';
// import { db } from "../../pages/firebase"
import { db } from '../../pages/firebase';
// import { Header2 } from '../component/Header';
// import { Cmenu } from '../component/Menu';
// import { Cmenu } from '../component/Menu';
import { Cmenu } from '../../component/Menu';
import { Header2 } from '../../component/Header';

const MakeRequest = ({navigation}) => {

  return (
    <View style={styles.container}>
      <Header2 />
      
      {/* Floating Menu */}
      <Cmenu navigation={navigation}/>

      <ScrollView>
        <Text style={styles.header}>Client Dashboard</Text>
       
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
  jobCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 5,
  },
  jobAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
  },
  jobInfo: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  choreItem: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  acceptButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export { MakeRequest };
