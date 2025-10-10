import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDSxWPixjrbTc9sos5i9eY3Z4ugCjm2frw",
  authDomain: "haz-webapp.firebaseapp.com",
  projectId: "haz-webapp",
  storageBucket: "haz-webapp.firebasestorage.app",
  messagingSenderId: "186364985393",
  appId: "1:186364985393:web:158bf9093065e2e1475510",
  measurementId: "G-G8NNQYMWNB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
