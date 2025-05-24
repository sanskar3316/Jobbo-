import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDwRXBevPpTcDroi-fnBplbFfBzcfZHrrM",
  authDomain: "jobbo-97cbe.firebaseapp.com",
  projectId: "jobbo-97cbe",
  storageBucket: "jobbo-97cbe.firebasestorage.app",
  messagingSenderId: "222721164229",
  appId: "1:222721164229:web:2ea54ddf0982ac347901ac"
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey) {
  throw new Error('Firebase API Key is missing. Please check your .env file.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Log successful initialization
console.log('Firebase initialized successfully'); 