import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';


import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
// import { Home,About,Profile } from './pages/test';
// import { Signup } from './pages/Home';
import { CodeValidation, HSignup } from './pages/HSignup';
import { Login } from './pages/Login';
import { Request } from './pages/Request';
import { Home } from './pages/Home';
import { Header } from './component/Header';
import { Fulltime } from './pages/request_type/fulltime';
import { SelectApartment } from './pages/request_type/partime/selectApartment';
import { SelectChores } from './pages/request_type/partime/selectChores';
import { PartDetails } from './pages/request_type/partime/PartDetails';
import { MapPage } from './pages/request_type/partime/mapPage';
import { Signup } from './pages/Signup';
import { Guarantor } from './Guarantor/Guarantor';
// import { Login2 } from './pages/Login2';
import { Login2 } from './pages/Login2';
import { HousehelpDashboard } from './Dashboard/HDashboard';
import { CSignup ,CodeValidation2} from './pages/CSignup';
import { ClientDashboard } from './Dashboard/CDashboard';
import { Cmenu } from './component/Menu';
// import { Profile } from './Dashboard/CDASHBOARD/Profile';
import { Profile } from './Dashboard/CDASHBOARD/Profile';
import { Csettings } from './Dashboard/CDASHBOARD/Settings';
import { MakeRequest } from './Dashboard/CDASHBOARD/Makerequest';
// import { Arriving } from './Dashboard/CDASHBOARD/arriving';?
import { Arriving } from './Dashboard/CDASHBOARD/Arriving';
import { RequestConfirmation } from './Dashboard/CDASHBOARD/ConfirmingRequest';
import { HousehelpList } from './Dashboard/CDASHBOARD/Househelplist';
import { HousehelpDetail } from './Dashboard/CDASHBOARD/Househelplist';
import { HPartimeRequest } from './Dashboard/HDASHBOARD/HPartimeRequest';
import { CStartJob } from './Dashboard/CDASHBOARD/StartJob';
import { HcurrentJob } from './Dashboard/HDASHBOARD/HcurrentJob';
import { AwaitingConfirmationScreen } from './Dashboard/HDASHBOARD/AwaitingConfirmation';
import { HStartJob } from './Dashboard/HDASHBOARD/HStartJob';
import { ReferAndEarn } from './Dashboard/CDASHBOARD/ReferandEarn';
// import ReferAndEarn from './Dashboard/CDASHBOARD/ReferandEarn';
import { CMappage } from './Dashboard/CDASHBOARD/CMappage';
import { CcompletedJobs } from './Dashboard/CDASHBOARD/CcompletedJobs';
import { CFulltimelivein,CFulltimeliveout,CFulltimeSelection } from './Dashboard/CDASHBOARD/Cfulltime';


// import {    UploadScreen} from './pages/upload';
const Stack = createNativeStackNavigator();




const MyStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>

        <Stack.Screen name="Home" component={Home}  options={{ headerShown: false }}/>
        <Stack.Screen name="Request" component={Request}  options={{ headerShown: false }}/>
        <Stack.Screen name="HSignup" component={HSignup}  options={{ headerShown: false }}/>
        <Stack.Screen name="login" component={Login}  options={{ headerShown: false }}/>
        <Stack.Screen name="partime" component={SelectApartment}  options={{ headerShown: false }}/>
        <Stack.Screen name="fulltime" component={Fulltime}  options={{ headerShown: false }}/>
        <Stack.Screen name="selectchores" component={SelectChores}  options={{ headerShown: false }}/>
        <Stack.Screen name="Partdetails" component={PartDetails}  options={{ headerShown: false }}/>
        {/* <Stack.Screen name="mappage" component={MapPage}  options={{ headerShown: false }}/> */}
        <Stack.Screen name="Signup" component={Signup}  options={{ headerShown: false }}/>
        <Stack.Screen name="Guarantor" component={Guarantor}  options={{ headerShown: false }}/>
        <Stack.Screen name="codevalidation" component={CodeValidation}  options={{ headerShown: false }}/>
        <Stack.Screen name="CSignup" component={CSignup}  options={{ headerShown: false }}/>
        <Stack.Screen name="codevalidation2" component={CodeValidation2}  options={{ headerShown: false }}/>
        {/* <Stack.Screen name="Login2" component={Login2}  options={{ headerShown: false }}/> */}
        <Stack.Screen name="hdashboard" component={HousehelpDashboard}  options={{ headerShown: false }}/>
        <Stack.Screen name="cdashboard" component={ClientDashboard}  options={{ headerShown: false }}/>
        <Stack.Screen name="cprofile" component={Profile}  options={{ headerShown: false }}/> 
      <Stack.Screen name="csettings" component={Csettings}  options={{ headerShown: false }}/>
      <Stack.Screen name="cmakerequest" component={MakeRequest}  options={{ headerShown: false }}/>
      <Stack.Screen name="arriving" component={Arriving}  options={{ headerShown: false }}/>     
      <Stack.Screen name="requestconfirmation" component={RequestConfirmation} options={{ headerShown: false }} />
      <Stack.Screen name="cHousehelplist" component={HousehelpList}  options={{ headerShown: false }}/>
      <Stack.Screen name="HousehelpDetail" component={HousehelpDetail}  options={{ headerShown: false }}/> 
      <Stack.Screen name="hpartime" component={HPartimeRequest}  options={{ headerShown: false }}/> 
      <Stack.Screen name="cstartjob" component={CStartJob}  options={{ headerShown: false }}/> 
      <Stack.Screen name="hstartjob" component={HStartJob}  options={{ headerShown: false }}/> 
      <Stack.Screen name="hcurrentjob" component={HcurrentJob}  options={{ headerShown: false }}/> 
      <Stack.Screen name="awaitingconfirmation" component={AwaitingConfirmationScreen}  options={{ headerShown: false }}/> 
      <Stack.Screen name="referandearn" component={ReferAndEarn}  options={{ headerShown: false }}/> 
      <Stack.Screen name="cmappage" component={CMappage}  options={{ headerShown: false }}/> 
      <Stack.Screen name="ccompletedjobs" component={CcompletedJobs}  options={{ headerShown: false }}/>  
      <Stack.Screen name="cfulltimelivein" component={CFulltimelivein}  options={{ headerShown: false }}/>  
      <Stack.Screen name="cfulltimeliveout" component={CFulltimeliveout}  options={{ headerShown: false }}/>  
      <Stack.Screen name="cfulltimeselection" component={CFulltimeSelection}  options={{ headerShown: false }}/>  




      


        





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
