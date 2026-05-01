// // import 'react-native-get-random-values';
// import { initializeApp, getApps, getApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { initializeFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB43keeLt_07HXfNp9xvXpOk6ckX_iUvh4",
  authDomain: "househelporg-7c2cd.firebaseapp.com",
  projectId: "househelporg-7c2cd",
  storageBucket: "househelporg-7c2cd.firebasestorage.app",
  messagingSenderId: "989310710388",
  appId: "1:989310710388:web:894c817be377af9f5a1721",
  measurementId: "G-BK7XQH32CM"
};

// // Initialize Firebase (prevent duplicate initialization)
// const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
// console.log("Firebase app initialized:", app.name);

// // ✅ React Native–safe Firestore
// const db = initializeFirestore(app, {
//   // experimentalForceLongPolling: true,
//    experimentalAutoDetectLongPolling: true,
//   useFetchStreams: false,
// });

// // Other services
// const auth = getAuth(app);
// const storage = getStorage(app);

// console.log("Firebase services initialized: auth, db, storage");

// export { auth, db, storage };

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';


// In the Native SDK, the app initializes itself automatically 
// using the 'google-services.json' file linked in your app.json.

// Initialize Firestore with local persistence enabled (very stable on mobile)
const db = firestore();

// Optional: You can customize settings here if needed
// db.settings({ persistence: true }); 

const authInstance = auth();
const storageInstance = storage();

console.log("✅ Native Firebase Services Initialized (Android)");

// Export with the same names you used before so your other files don't break
export { authInstance as auth, db, storageInstance as storage };
