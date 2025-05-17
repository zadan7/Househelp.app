import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_Xm0x7Xz4UqRh-q4ftiIx4-D8AjLpePE",
  authDomain: "househelporg.firebaseapp.com",
  projectId: "househelporg",
  storageBucket: "househelporg.appspot.com",
  messagingSenderId: "354870677540",
  appId: "1:354870677540:web:718bf40b9ec96b6840c8b1",
  measurementId: "G-SLELK741QB",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth with persistence for React Native (Hermes-compatible)
// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage),
// });

const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
