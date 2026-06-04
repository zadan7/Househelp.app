import React, { useEffect } from 'react';
import { StyleSheet, Alert, AppRegistry } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native'; // FIXED: Added import
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
import { Hwallet } from './wallets/Hwallet';
import { Cwallet } from './wallets/Cwallet';

// --- APP CONFIG ---
import { name as appName } from './app.json';

const Stack = createNativeStackNavigator();

// FIXED: Created the global remote-control reference for navigation tree handles
const navigationRef = createNavigationContainerRef();

// 1. BACKGROUND HANDLER (Must stay outside the component)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  return Promise.resolve();
});

const navigateFromNotification = (remoteMessage, contextMessage) => {
  console.log(`Notification handled via: ${contextMessage}`, remoteMessage.data);
  
  if (remoteMessage?.data?.screen) {
    const targetScreen = remoteMessage.data.screen; 
    const targetJobId = remoteMessage.data.jobId;

    if (navigationRef.isReady()) {
      navigationRef.navigate(targetScreen, { jobId: targetJobId });
    } else {
      setTimeout(() => {
        if (navigationRef.isReady()) {
          navigationRef.navigate(targetScreen, { jobId: targetJobId });
        }
      }, 800);
    }
  }
};

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
      <Stack.Screen name="hwallet" component={Hwallet} />
      <Stack.Screen name="cwallet" component={Cwallet} />
    </Stack.Navigator>
  );
};

export default function App() {
  useEffect(() => {
    // SCENARIO A: Foreground message handler
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      Alert.alert(
        remoteMessage.notification?.title || 'Notification', 
        remoteMessage.notification?.body || 'New message received',
        [
          { text: 'Ignore', style: 'cancel' },
          { text: 'Open Details', onPress: () => navigateFromNotification(remoteMessage, "Foreground Click") }
        ]
      );
    });

    // FIXED: SCENARIO B: Background Click Handler (App minimized in notification tray)
    const unsubscribeBackgroundClick = messaging().onNotificationOpenedApp(remoteMessage => {
      navigateFromNotification(remoteMessage, "Background Notification Click");
    });

    // FIXED: SCENARIO C: Killed State Handler (App was completely closed out of RAM memory)
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          navigateFromNotification(remoteMessage, "Killed App Launch Click");
        }
      });

    return () => {
      unsubscribeForeground();
      unsubscribeBackgroundClick();
    };
  }, []);

  return (
    // FIXED: Attached the navigation reference link pointer onto the main layout shell boundary container
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="auto" />
      <MyStack />
    </NavigationContainer>
  );
}

AppRegistry.registerComponent(appName, () => App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});