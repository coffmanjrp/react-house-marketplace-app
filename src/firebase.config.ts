import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAAyce34yZBuLWB0Dxls7ITVTSjSW5jyL4',
  authDomain: 'react-house-marketplace-app.firebaseapp.com',
  projectId: 'react-house-marketplace-app',
  storageBucket: 'react-house-marketplace-app.appspot.com',
  messagingSenderId: '937695450716',
  appId: '1:937695450716:web:c3f874af6874ad2c66b899',
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();
