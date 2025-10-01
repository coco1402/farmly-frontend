import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjfLakXc8PQmrtNZtqaaFaFNpPw5CrsOc",
  authDomain: "coco-s-farmly-project.firebaseapp.com",
  projectId: "coco-s-farmly-project",
  storageBucket: "coco-s-farmly-project.firebasestorage.app",
  messagingSenderId: "174338821953",
  appId: "1:174338821953:web:8650e6db05a9cd63981bc0"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = initializeFirestore(app, {experimentalForceLongPolling: true});

export {db, auth}