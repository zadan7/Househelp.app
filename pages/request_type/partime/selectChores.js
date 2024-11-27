import * as React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { Header } from '../../../component/Header';
import { Footer } from '../../../component/Footer';
import { useState } from 'react';

function SelectChores({ navigation }) {
  // State to track which buttons are selected and total price
  const [selectedButtons, setSelectedButtons] = useState([]);
  const [selectedChores, setSelectedChores] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const pricePerChore = 1000; // Price for each chore

  // Style for active and inactive buttons
  const activeButtonStyle = {
    backgroundColor: 'white',
    color: 'green',
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 15,
    textAlign: 'center',
    borderRadius: 5,
    borderColor: 'green',
    borderWidth: 1,
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
  function toggleButton(buttonIndex, selectedChore,stp) {
    console.log(buttonIndex,selectedChore,stp)
    if (selectedButtons.includes(buttonIndex)) {
      // Remove the button from the selected array and subtract its price
      setSelectedButtons(prevState => prevState.filter(index => index !== buttonIndex));
      setSelectedChores(prevState => prevState.filter(chore => chore !== selectedChore));
      setTotalPrice(prevPrice => prevPrice - pricePerChore);
    } else {
      // Add the button to the selected array and add its price
      setSelectedButtons(prevState => [...prevState, buttonIndex]);
      setSelectedChores(prevState => [...prevState, selectedChore]);
      setTotalPrice(prevPrice => prevPrice + pricePerChore);
    }
  }

  // Function to handle when DONE is clicked
  function handleDone() {
    // Display the total price in an alert
    Alert.alert('Total Price', `The total cost of selected chores is ₦${totalPrice}`);
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <Header navigation={navigation} />

        <Text style={{ color: 'green', fontWeight: 'bold' }}>Select chores to be completed</Text>

        <View style={styles.buttonContainer}>
          <Text>amount:{totalPrice}</Text>
          <Pressable style={styles.Pressable} onPress={() => toggleButton(1, 'cleanlivingroom',1500)}>
            <Text >
              Clean living room - ₦1500
            </Text>
          </Pressable>

          <Pressable style={styles.Pressable} onPress={() => toggleButton(2, 'washbathroom')}>
            <Text >
              Wash bathroom - ₦1000
            </Text>
          </Pressable>

          <Pressable style={styles.Pressable} onPress={() => toggleButton(3, 'cleanrooms')}>
            <Text >
              Clean personal rooms - ₦1000
            </Text>
          </Pressable>

          <Pressable style={styles.Pressable} onPress={() => toggleButton(4, 'cleankitchen')}>
            <Text >
              Clean kitchen - ₦1500
            </Text>
          </Pressable>

          <Pressable style={styles.Pressable} onPress={() => toggleButton(5, 'washdishes')}>
            <Text >
              Wash dishes - ₦700
            </Text>
          </Pressable>

          <Pressable style={styles.Pressable} onPress={() => toggleButton(6, 'washclothes')}>
            <Text >
              Wash clothes (max 20 pieces) - N3000
            </Text>
          </Pressable>

          <Pressable style={styles.Pressable} onPress={() => toggleButton(7, 'washcar')}>
            <Text >
              Wash car - ₦2,500
            </Text>
          </Pressable>

          {/* DONE Button */}
          <Pressable style={styles.Pressable} onPress={()=>{handleDone}}>
            <Text >
              DONE
            </Text>
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
  },
  Pressable: {
    marginBottom: 20,
    marginTop: 20,
    width: '100%',
    borderRadius: 20,
  },
});

export { SelectChores };
