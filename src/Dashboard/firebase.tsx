// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAu2mFcjVKLj2cv5ubWq0LWjNTEeXNI0Ck",
  authDomain: "valmart-d3bbb.firebaseapp.com",
  projectId: "valmart-d3bbb",
  storageBucket: "valmart-d3bbb.firebasestorage.app",
  messagingSenderId: "673285210542",
  appId: "1:673285210542:web:ed355d2883d0dffbc3083f",
  measurementId: "G-EF6JRJBPYT",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  db,
  addDoc,
  collection,
};
