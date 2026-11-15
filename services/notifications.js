import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import messaging from '@react-native-firebase/messaging';

// Both helpers return null instead of throwing, so signup never breaks
// just because the user declined notifications.
export async function registerForPushNotificationsAsync() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    let finalStatus = status;
    if (status !== 'granted') {
      finalStatus = (await Notifications.requestPermissionsAsync()).status;
    }
    if (finalStatus !== 'granted') return null;
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
    const res = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    return res.data;
  } catch (e) {
    return null;
  }
}

export async function registerForFcmToken() {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (!enabled) return null;
    return await messaging().getToken();
  } catch (e) {
    return null;
  }
}
