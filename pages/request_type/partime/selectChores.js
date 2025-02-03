import * as React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { Header } from '../../../component/Header';
import { Footer } from '../../../component/Footer';
import { useState } from 'react';
import { useEffect } from 'react';

function SelectChores({ navigation }) {

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

function toggleButton(btn,id,color) {
  console.log(btn,"this is the button you clicked")
var totalprice=totalcost;


  switch (id){
    case 1:{
      if (Buttons.btn1.style.color=="white"){
        selectedbuttons.push(btn.chore)
        setbuttons({...Buttons,btn1:{style:activeButtonStyle,price:btn.price,chore:"clean living room"}})
        // console.log(btn,btn.style)
        totalprice=totalprice+btn.price
        settotalcost(totalprice)
        console.log(totalprice)
       
    
    
      }else if (color=="green"){
        selectedbuttons.pop(btn.chore)

        setbuttons({...Buttons,btn1:{style:inactiveButtonStyle,price:btn.price,chore:"clean living room"}})
        console.log(btn)
        console.log(totalprice)
        totalprice=totalprice-btn.price
        settotalcost(totalprice)
    
      }
      break;
    }
    case 2:{
      if (Buttons.btn2.style.color=="white"){
        selectedbuttons.push(btn)

        setbuttons({...Buttons,btn2:{id:2,style:activeButtonStyle,price:btn.price,chore:"wash bathroom"}})
        console.log(btn,btn.style)
        totalprice=totalprice+Buttons.btn2.price
        settotalcost(totalprice)
    
    
      }else if (color=="green"){
        selectedbuttons.pop(btn)
        

        setbuttons({...Buttons,btn2:{style:inactiveButtonStyle,price:btn.price,chore:"wash bathroom"}})
        console.log(btn,btn.style)
        totalprice=totalprice-Buttons.btn2.price
        settotalcost(totalprice)
    
      }
        break;
    }
    case 3:{
      if (Buttons.btn3.style.color=="white"){
        setbuttons({...Buttons,btn3:{id:2,style:activeButtonStyle,price:btn.price,chore:"clean personal room"}})
        console.log(btn,btn.style)
        totalprice=totalprice+btn.price
        settotalcost(totalprice)
    
    
      }else if (color=="green"){
        setbuttons({...Buttons,btn3:{style:inactiveButtonStyle,price:btn.price,chore:"clean personal room"}})
        console.log(btn,btn.style)
        totalprice=totalprice-btn.price
        settotalcost(totalprice)
    
      }
      break
    }
    case 4:{
      if (Buttons.btn4.style.color=="white"){
        setbuttons({...Buttons,btn4:{id:2,style:activeButtonStyle,price:btn.price,chore:"clean kitchen"}})
        console.log(btn,btn.style)
        totalprice=totalprice+btn.price
        settotalcost(totalprice)
    
    
      }else if (color=="green"){
        setbuttons({...Buttons,btn4:{style:inactiveButtonStyle,price:btn.price,chore:"clean kitchen"}})
        console.log(btn,btn.style)
        totalprice=totalprice-btn.price
        settotalcost(totalprice)
    
      }
      break;
    }
    case 5:{
      if (Buttons.btn5.style.color=="white"){
        setbuttons({...Buttons,btn5:{id:2,style:activeButtonStyle,price:800,chore:"wash dishes"}})
        console.log(btn,btn.style)
        totalprice=totalprice+btn.price
        settotalcost(totalprice)
    
    
      }else if (color=="green"){
        setbuttons({...Buttons,btn5:{style:inactiveButtonStyle,price:800,chore:btn.chore}})
        console.log(btn,btn.style)
        totalprice=totalprice-btn.price
        settotalcost(totalprice)
    
      }
      break;
    }
    case 6:{
      if (Buttons.btn6.style.color=="white"){
        setbuttons({...Buttons,btn6:{id:2,style:activeButtonStyle,price:btn.price,chore:"wash car"}})
        console.log(btn,btn.style)
        totalprice=totalprice+btn.price
        settotalcost(totalprice)
    
    
      }else if (color=="green"){
        setbuttons({...Buttons,btn6:{style:inactiveButtonStyle,price:btn.price,chore:btn.chore}})
        console.log(btn,btn.style)
        totalprice=totalprice-btn.price
        settotalcost(totalprice)
    
      }
      break
    }
    case 7:{
      if (Buttons.btn7.style.color=="white"){
        setbuttons({...Buttons,btn7:{id:2,style:activeButtonStyle,price:btn.price,chore:btn.chore}})
        console.log(btn,btn.style)
        totalprice=totalprice+btn.price
        settotalcost(totalprice)
    
    
      }else if (color=="green"){
        setbuttons({...Buttons,btn7:{style:inactiveButtonStyle,price:btn.price,chore:btn.chore}})
        console.log(btn,btn.style)
        totalprice=totalprice-btn.price
        settotalcost(totalprice)
    
      }
      break
    }
    console.log(selectedbuttons)
  }
  console.log(selectedbuttons)
 
 
 
}




useEffect(()=>{

console.log(Buttons)
},[])



  return (
    <ScrollView>
      <ScrollView>
      <View style={styles.container}>
        <Header navigation={navigation} />

      <Text style={{color:"green",fontWeight:"bold"}}>Select Chores to be completed</Text>

        <View style={styles.buttonContainer}>
          <Text  style={{color:"green",fontWeight:"bold"}}>Amount {totalcost}</Text>
          <Pressable style={styles.Pressable}
           onPress={() => toggleButton(Buttons.btn1,1,Buttons.btn1.style.color)}>
            <Text style={Buttons.btn1.style}>{Buttons.btn1.chore}</Text>
          </Pressable>

          <Pressable style={styles.Pressable} onPress={() =>{toggleButton(Buttons.btn2,2,Buttons.btn2.style.color,Buttons.btn2)}}>
            <Text style={Buttons.btn2.style}>{Buttons.btn2.chore}</Text>
          </Pressable>

          <Pressable style={styles.Pressable} onPress={() => {toggleButton(Buttons.btn3,3,Buttons.btn3.style.color)}}>
            <Text style={Buttons.btn3.style}>{Buttons.btn3.chore}</Text>
          </Pressable>

          <Pressable style={styles.Pressable} onPress={() => {toggleButton(Buttons.btn4,4,Buttons.btn4.style.color)}}>
            <Text style={Buttons.btn4.style}>{Buttons.btn4.chore}</Text>
          </Pressable>

          <Pressable style={styles.Pressable} onPress={() => {toggleButton(Buttons.btn5,5,Buttons.btn5.style.color)}}>
            <Text style={Buttons.btn5.style}>{Buttons.btn5.chore}</Text>
          </Pressable>

          <Pressable style={styles.Pressable} onPress={() => {toggleButton(Buttons.btn6,6,Buttons.btn6.style.color)}}>
            <Text style={Buttons.btn6.style}>{Buttons.btn6.chore}</Text>
          </Pressable>


          <Pressable style={styles.Pressable} onPress={() => {toggleButton(Buttons.btn7,7,Buttons.btn7.style.color)}}>
            <Text style={Buttons.btn7.style}>{Buttons.btn7.chore}</Text>
          </Pressable>

          <Pressable style={styles.Pressable} onPress={() => 
          {
            
            console.log("done",totalcost,)
            navigation.navigate("Partdetails")

          }}>
            <Text style={activeButtonStyle}>Done</Text>
          </Pressable>

         
        </View>

        <Footer />
      </View>
      </ScrollView>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    height: "auto",
    fontFamily: 'Roboto',
    marginBottom:50,
    paddingBottom:50,
  },
  buttonContainer: {
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: 'green',
    borderRadius: 10,
    padding: 20,
    marginBottom:100,
    paddingBottom:"auto",
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

  }
});


export { SelectChores };
