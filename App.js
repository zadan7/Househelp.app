import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';


import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
// import { Home,About,Profile } from './pages/test';
// import { Signup } from './pages/Home';
import { HSignup } from './pages/HSignup';
import { Login } from './pages/Login';
import { Request } from './pages/Request';
import { Home } from './pages/Home';
import { Header } from './component/Header';
import { Fulltime } from './pages/request_type/fulltime';
import { SelectApartment } from './pages/request_type/partime/selectApartment';
import { SelectChores } from './pages/request_type/partime/selectChores';
const Stack = createNativeStackNavigator();

const MyStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>

        <Stack.Screen name="Home" component={Home}  options={{ headerShown: false }}/>
        <Stack.Screen name="Request" component={Request}  options={{ headerShown: false }}/>

        <Stack.Screen name="HSignup" component={HSignup}  options={{ headerShown: false }}/>
        <Stack.Screen name="Login" component={Login}  options={{ headerShown: false }}/>
        <Stack.Screen name="partime" component={SelectApartment}  options={{ headerShown: false }}/>
        <Stack.Screen name="fulltime" component={Fulltime}  options={{ headerShown: false }}/>
        <Stack.Screen name="selectchores" component={SelectChores}  options={{ headerShown: false }}/>







      </Stack.Navigator>
    </NavigationContainer>
  );
};




export default function App() {
  return (
    
      <MyStack></MyStack>
      
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});