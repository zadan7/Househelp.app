import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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

// Initialize Firebase (Prevent duplicate initialization)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Correct way to get Firestore, Auth, and Storage references
const auth = getAuth(app);
const db = getFirestore(app); // ✅ FIXED Firestore instance
const storage = getStorage(app);

export { auth, db, storage };
  