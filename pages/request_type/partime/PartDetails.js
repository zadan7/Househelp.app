import * as React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { Header } from '../../../component/Header';
import { Footer } from '../../../component/Footer';
import { useState } from 'react';
import { useEffect } from 'react';
import { TextInput } from 'react-native-web';

function PartDetails({ navigation }) {

let selectedbuttons =[]
  const [selectedButtons, setSelectedButtons] = useState([]);
  const[totalcost, settotalcost]=useState(0);
  
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
  const [Buttons, setbuttons]=useState({
    btn1:{
      id:1,
      chore:"clean living room",
      style:inactiveButtonStyle,
      price:800
    },
    btn2:{
      id:2,
      chore:"wash bathroom",
      style:inactiveButtonStyle,
      price:800,
    },
    btn3:{
      id:3,
      chore:"clean personal room",
      style:inactiveButtonStyle,
      price:700,
    }
    ,
    btn4:{
      id:4,

      chore:"clean kitchen",
      style:inactiveButtonStyle,
      price:800,
    }
    ,
    btn5:{
      id:5,
      chore:"wash dishes",
      style:inactiveButtonStyle,
      price:1000,
    },
    btn6:{
      id:6,
      chore:"wash Car",
      style:inactiveButtonStyle,
      price:2000,
    },
    btn7:{
      id:7,
      chore:"wash clothes",
      style:inactiveButtonStyle,
      price:3000,
    }
  }
)





useEffect(()=>{

console.log(Buttons)
},[])



  return (
    <ScrollView>
      <View style={styles.container}>
        <Header navigation={navigation} />

      <Text style={{color:"green",fontWeight:"bold"}}>Enter your Information</Text>

        <View style={styles.buttonContainer}>
          <View style={styles.inputContainer}>
            <Text style={{fontSize:"15",textAlign:"center"}}>Enter your names </Text>
            <TextInput style={styles.pinput} onChangeText={(text)=>{console.log(text)}}></TextInput>
      
          </View>
          
        </View>

        <Footer />
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    height: 800,
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
    // backgroundColor:"green"
  },
  Pressable: {
    marginBottom: 20,
    marginTop: 20,
    width: '100%',
    borderRadius: 20,
    backgroundColor:"green",
    color:"white",
    padding:"10",
  },
  btntext:{
    color:"white",

  },
  pinput:{
    padding:5,
    borderColor:"green",
    borderWidth:1,
    textAlign:"center",
    margin:3,
  },
  inputContainer:{
    textAlign:"center",
    padding:"5"

  }
});


export { PartDetails };
