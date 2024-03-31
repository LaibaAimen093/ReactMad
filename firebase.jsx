// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDbvDXhKbPavZjfhZeToYIkkn62usJErN0",
  authDomain: "readrhyme.firebaseapp.com",
  projectId: "readrhyme",
  storageBucket: "readrhyme.appspot.com",
  messagingSenderId: "482805809128",
  appId: "1:482805809128:web:2abfc394ab4710379bae5d",
  measurementId: "G-S9GXQK4C35"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// const analytics = getAnalytics(app);

export {app,auth};