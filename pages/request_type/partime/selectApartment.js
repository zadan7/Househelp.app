import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
// import { Header } from '../../../component/Header';
import { Header } from '../../../component/Header';
import { Footer } from '../../../component/Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';

function SelectApartment({ navigation }) {
  // State to track which button is selected
  const [selectedButton, setSelectedButton] = useState(null);
  const [selectedApartment, setselectedApartment] = useState("");


  // Style for active and inactive buttons
  const activeButtonStyle = {
    backgroundColor: 'white',
    color: 'green',
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 15,
    textAlign: 'center',
    borderRadius: 5,
    borderColor:"green",
    borderWidth:1,
  };

  const inactiveButtonStyle = {
    backgroundColor: 'green',
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 15,
    textAlign: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'green',
  };

  // Function to check which button is clicked and toggle styles
  function toggleButton(buttonIndex,selectedApartment) {
    console.log(selectedApartment)
    setselectedApartment(selectedApartment)
    setSelectedButton(buttonIndex);
    async function storeApartment() {
      await AsyncStorage.setItem("apartmenttype",selectedApartment)
      
    }
    storeApartment()
    navigation.navigate("selectchores")
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <Header navigation={navigation} />

      <Text style={{color:"green",fontWeight:"bold"}}>Select Apartment type</Text>

        <View style={styles.buttonContainer}>
          <Pressable style={styles.Pressable} onPress={() => toggleButton(1,"One bedroom flat")}>
            <Text style={selectedButton === 1 ? activeButtonStyle : inactiveButtonStyle}>One bedroom flat</Text>
          </Pressable>

          <Pressable style={styles.Pressable} onPress={() => toggleButton(2,"Two bedroom flat")}>
            <Text style={selectedButton === 2 ? activeButtonStyle : inactiveButtonStyle}>Two bedroom flat</Text>
          </Pressable>

          <Pressable style={styles.Pressable} onPress={() => toggleButton(3,"Three bedroom flat")}>
            <Text style={selectedButton === 3 ? activeButtonStyle : inactiveButtonStyle}>Three bedroom flat</Text>
          </Pressable>

          <Pressable style={styles.Pressable} onPress={() => toggleButton(4,"Three bedroom duplex")}>
            <Text style={selectedButton === 4 ? activeButtonStyle : inactiveButtonStyle}>Three bedroom duplex</Text>
          </Pressable>

          <Pressable style={styles.Pressable} onPress={() => toggleButton(5,"Four bedroom flat")}>
            <Text style={selectedButton === 5 ? activeButtonStyle : inactiveButtonStyle}>Four bedroom flat</Text>
          </Pressable>

          <Pressable style={styles.Pressable} onPress={() => toggleButton(6,"Five bedroom duplex")}>
            <Text style={selectedButton === 6 ? activeButtonStyle : inactiveButtonStyle}>Five bedroom duplex</Text>
          </Pressable>

         
        </View>

        <Footer />
      </View>
    </ScrollView>
  );
}





const SelectChorespage=({navigation})=>{
  

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    // height: 800,
    fontFamily: 'Roboto',
  },
  buttonContainer: {
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: 'green',
    borderRadius: 10,
    padding: 20,
  },
  Pressable: {
    marginBottom: 20,
    marginTop: 20,
    width: '100%',
    borderRadius: 20,
  },
});

export { SelectApartment };
