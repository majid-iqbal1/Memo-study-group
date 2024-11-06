import {initializeApp} from 'firebase/app';
import {getAuth, onAuthStateChanged, GoogleAuthProvider} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const app = initializeApp({
    apiKey: "REMOVED",
  authDomain: "study-group-36edd.firebaseapp.com",
  projectId: "study-group-36edd",
  storageBucket: "study-group-36edd.firebasestorage.app",
  messagingSenderId: "855896027198",
  appId: "1:855896027198:web:27a8bad3a656894cdd216f"
});

export const auth = getAuth(app);
const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

onAuthStateChanged(auth, (user) => {
    if (user !== null) {
        console.log('User is signed in');
    } else {
        console.log('User is signed out');
    }
});