import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View,ScrollView } from 'react-native';
import { Footer } from '../../component/Footer';
import { Header } from '../../component/Header';
import { useState } from 'react';
function Fulltime({ navigation }) {
  let  button1={}
  let  button2={}
    // const [buttoncolor,setbuttoncolor]=useState({})

  return (
    <ScrollView >
        <View style={styles.container}>
      <Header navigation={navigation} />

      {/* <Text style={styles.titleText}>Start Earning With us ($)</Text> */}

      <View style={styles.buttonContainer}>
      {/* <Text style={{color:"green",fontSize:30,fontWeight:"bold"}}>Welcome</Text> */}
        <Pressable style={styles.buttoncolor} onPress={() => {
            
            // setbuttoncolor
            navigation.navigate('SelectApartment')}}>
          <Text style={styles.buttonText}>Fulltime Partime Househelp</Text>
        </Pressable>
        {/* <Text>or</Text> */}

      
        {/* <Text>Click to order househelp</Text>? */}
        <Pressable style={styles.Pressable} onPress={() => navigation.navigate('')}>
          <Text style={styles.buttonText}>Fulltime Fulltime live in Househelp</Text>
        </Pressable>
        
        
      </View>
     
        <Footer></Footer>
     
      </View>
      {/* <Footer></Footer> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    height:800,
    fontFamily:"Roboto",
  },
  titleText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginVertical: 5, // Added some margin around the title
  },
  buttonContainer: {
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,             // Border width for the container
    borderColor: 'green',       // Border color
    borderRadius: 10,           // Rounded corners for the container
    padding: 20,                // Padding inside the container
  },
  buttonText: {
    backgroundColor: 'green',
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 15,
    textAlign: 'center',
    borderRadius: 5, // Added border radius for better button appearance
  },
  buttonText2: {
    backgroundColor: 'white',
    color: 'green',
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 15,
    textAlign: 'center',
    borderRadius: 5, // Added border radius for better button appearance
    borderWidth: 1,             // Border width for the container
    borderColor: 'green',       // Border color
    borderRadius: 10,  
  },
  Pressable: {
    backgroundColor: 'green',
    color: 'white',
    // paddingVertical: 10,
    // paddingHorizontal: 20,
    marginBottom:20,
    marginTop:20,
    width:"100%",

    fontSize: 15,
    textAlign: 'center',
    borderRadius: 20, // Added border radius for better button appearance
  },
});

export { Fulltime };
