import React, { useEffect } from 'react';
import { StyleSheet, Alert, AppRegistry } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import messaging from '@react-native-firebase/messaging';

// --- ALL YOUR PAGE IMPORTS ---
import { Home } from './pages/Home';
import { Request } from './pages/Request';
import { CodeValidation, HSignup } from './pages/HSignup';
import { Login } from './pages/Login';
import { Fulltime } from './pages/request_type/fulltime';
import { SelectApartment } from './pages/request_type/partime/selectApartment';
import { SelectChores } from './pages/request_type/partime/selectChores';
import { PartDetails } from './pages/request_type/partime/PartDetails';
import { Signup } from './pages/Signup';
import { Guarantor } from './Guarantor/Guarantor';
import { HousehelpDashboard } from './Dashboard/HDashboard';
import { CSignup, CodeValidation2 } from './pages/CSignup';
import { ClientDashboard } from './Dashboard/CDashboard';
import { Profile } from './Dashboard/CDASHBOARD/Profile';
import { Csettings } from './Dashboard/CDASHBOARD/Settings';
import { MakeRequest } from './Dashboard/CDASHBOARD/Makerequest';
import { Arriving } from './Dashboard/CDASHBOARD/Arriving';
import { RequestConfirmation } from './Dashboard/CDASHBOARD/ConfirmingRequest';
import { HousehelpList, HousehelpDetail } from './Dashboard/CDASHBOARD/Househelplist';
import { HPartimeRequest } from './Dashboard/HDASHBOARD/HPartimeRequest';
import { CStartJob } from './Dashboard/CDASHBOARD/StartJob';
import { HcurrentJob } from './Dashboard/HDASHBOARD/HcurrentJob';
import { AwaitingConfirmationScreen } from './Dashboard/HDASHBOARD/AwaitingConfirmation';
import { HStartJob } from './Dashboard/HDASHBOARD/HStartJob';
import { ReferAndEarn } from './Dashboard/CDASHBOARD/ReferandEarn';
import { CMappage } from './Dashboard/CDASHBOARD/CMappage';
import { CcompletedJobs } from './Dashboard/CDASHBOARD/CcompletedJobs';
import { CFulltimelivein, CFulltimeliveout, CFulltimeSelection } from './Dashboard/CDASHBOARD/Cfulltime';
import { Hfulltime } from './Dashboard/HDASHBOARD/Hfulltime';
import { Hprofile } from './Dashboard/HDASHBOARD/Hprofile';
import { HappliedJobs } from './Dashboard/HDASHBOARD/HappliedJobs';

// --- APP CONFIG ---
import { name as appName } from './app.json';

const Stack = createNativeStackNavigator();

// 1. BACKGROUND HANDLER
// This must stay outside the component to work when the app is killed
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  return Promise.resolve();
});

const MyStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Request" component={Request} />
      <Stack.Screen name="HSignup" component={HSignup} />
      <Stack.Screen name="login" component={Login} />
      <Stack.Screen name="partime" component={SelectApartment} />
      <Stack.Screen name="fulltime" component={Fulltime} />
      <Stack.Screen name="selectchores" component={SelectChores} />
      <Stack.Screen name="Partdetails" component={PartDetails} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="Guarantor" component={Guarantor} />
      <Stack.Screen name="codevalidation" component={CodeValidation} />
      <Stack.Screen name="CSignup" component={CSignup} />
      <Stack.Screen name="codevalidation2" component={CodeValidation2} />
      <Stack.Screen name="hdashboard" component={HousehelpDashboard} />
      <Stack.Screen name="cdashboard" component={ClientDashboard} />
      <Stack.Screen name="cprofile" component={Profile} />
      <Stack.Screen name="csettings" component={Csettings} />
      <Stack.Screen name="cmakerequest" component={MakeRequest} />
      <Stack.Screen name="arriving" component={Arriving} />
      <Stack.Screen name="requestconfirmation" component={RequestConfirmation} />
      <Stack.Screen name="cHousehelplist" component={HousehelpList} />
      <Stack.Screen name="HousehelpDetail" component={HousehelpDetail} />
      <Stack.Screen name="hpartime" component={HPartimeRequest} />
      <Stack.Screen name="cstartjob" component={CStartJob} />
      <Stack.Screen name="hstartjob" component={HStartJob} />
      <Stack.Screen name="hcurrentjob" component={HcurrentJob} />
      <Stack.Screen name="awaitingconfirmation" component={AwaitingConfirmationScreen} />
      <Stack.Screen name="referandearn" component={ReferAndEarn} />
      <Stack.Screen name="cmappage" component={CMappage} />
      <Stack.Screen name="ccompletedjobs" component={CcompletedJobs} />
      <Stack.Screen name="cfulltimelivein" component={CFulltimelivein} />
      <Stack.Screen name="cfulltimeliveout" component={CFulltimeliveout} />
      <Stack.Screen name="cfulltimeselection" component={CFulltimeSelection} />
      <Stack.Screen name="hfulltime" component={Hfulltime} />
      <Stack.Screen name="hprofile" component={Hprofile} />
      <Stack.Screen name="happliedjobs" component={HappliedJobs} />
    </Stack.Navigator>
  );
};

export default function App() {
  useEffect(() => {
    // Handling foreground messages (while app is open)
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert(
        remoteMessage.notification?.title || 'Notification', 
        remoteMessage.notification?.body || 'New message received'
      );
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <MyStack />
    </NavigationContainer>
  );
}

// 2. REGISTER THE COMPONENT
// Since you aren't using index.js, you must call this at the bottom of App.js
AppRegistry.registerComponent(appName, () => App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});