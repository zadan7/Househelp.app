import * as React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { Header } from '../../../component/Header';
import { Footer } from '../../../component/Footer';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

function SelectChores({ navigation }) {
  const [selectedChores, setSelectedChores] = useState([]);
  const [totalCost, setTotalCost] = useState(0);

  const chores = [
    { id: 1, chore: 'Clean Living Room', price: 800 },
    { id: 2, chore: 'Wash Bathroom', price: 800 },
    { id: 3, chore: 'Clean Personal Room', price: 700 },
    { id: 4, chore: 'Clean Kitchen', price: 800 },
    { id: 5, chore: 'Wash Dishes', price: 1000 },
    { id: 6, chore: 'Wash Car', price: 2000 },
    { id: 7, chore: 'Wash Clothes', price: 3000 },
  ];

  useEffect(() => {
    const newTotal = selectedChores.reduce((sum, chore) => sum + chore.price, 0);
    setTotalCost(newTotal);
  }, [selectedChores]);

  const toggleChore = (chore) => {
    setSelectedChores((prev) =>
      prev.some((item) => item.id === chore.id)
        ? prev.filter((item) => item.id !== chore.id)
        : [...prev, chore]
    );
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Header navigation={navigation} />
        <Text style={{ color: 'green', fontWeight: 'bold' }}>Select Chores to be completed</Text>
        <View style={styles.buttonContainer}>
          <Text style={{ color: 'green', fontWeight: 'bold' }}>Amount {totalCost}</Text>
          {chores.map((chore) => (
            <Pressable
              key={chore.id}
              style={styles.Pressable}
              onPress={() => toggleChore(chore)}
            >
              <Text style={selectedChores.some((item) => item.id === chore.id) ? styles.activeButtonStyle : styles.inactiveButtonStyle}>
                {chore.chore}
              </Text>
            </Pressable>
          ))}
          <Pressable
            style={styles.Pressable}
            onPress={() => {
              console.log('Done', totalCost)
              var chores=[]
               selectedChores.map((element,index)=>{
                // console.log(`${element.chore} : ${element.price}`,index)
                chores.push(`${element.chore} : ${element.price},${index}`)
               
              
              });

              async function setchores(params) {
                  await AsyncStorage.setItem("chores",JSON.stringify(chores))
                  await AsyncStorage.setItem("total",`${totalCost}`)
              }
              console.log("chores" ,chores)
              setchores()
               navigation.navigate("Partdetails")
            }}
          >
            <Text style={styles.activeButtonStyle}>Done</Text>
          </Pressable>
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
    height: 'auto',
    fontFamily: 'Roboto',
    marginBottom: 50,
    paddingBottom: 50,
  },
  buttonContainer: {
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: 'green',
    borderRadius: 10,
    padding: 20,
    marginBottom: 100,
  },
  Pressable: {
    marginBottom: 20,
    marginTop: 20,
    width: '100%',
    borderRadius: 20,
  },
  activeButtonStyle: {
    backgroundColor: 'white',
    color: 'green',
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 15,
    textAlign: 'center',
    borderRadius: 5,
    borderColor: 'green',
    borderWidth: 1,
  },
  inactiveButtonStyle: {
    backgroundColor: 'green',
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 15,
    textAlign: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'green',
  },
});

export { SelectChores };
