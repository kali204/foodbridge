// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCwDGcS_rOIRI8xgGfZ5ZJL_YGvsc4LPK0",
  authDomain: "foodbridge-ad3cb.firebaseapp.com",
  projectId: "foodbridge-ad3cb",
  storageBucket: "foodbridge-ad3cb.firebasestorage.app",
  messagingSenderId: "112134378286",
  appId: "1:112134378286:web:398df5d90aace3e622a0bf",
  measurementId: "G-2KK9EC1ZLD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);