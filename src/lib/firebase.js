import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "mychatapp-c2891.firebaseapp.com",
  projectId: "mychatapp-c2891",
  storageBucket: "mychatapp-c2891.appspot.com",
  messagingSenderId: "360784591676",
  appId: "1:360784591676:web:3c6360212e44d5b5e6fc39"
};
const app = initializeApp(firebaseConfig);
export const auth=getAuth();
export const db=getFirestore();
export const storage=getStorage;
