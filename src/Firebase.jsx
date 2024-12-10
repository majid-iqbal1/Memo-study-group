/*****************************************************************************
*                 Firebase Configuration and Integration                     *
******************************************************************************
*                                                                            *
* Purpose: Initialize Firebase app and retrieve references to core           *
*          Firebase services for use throughout the application.             *
*                                                                            * 
* Created: November 2024                                                     *
* Updated: December 2024                                                     *
* Authors: Majid Iqbal, Sulav Shakya, Bruce Duong, Ethan Humrich             *
*                                                                            *
* Features:                                                                  *
*   - Firebase app initialization with environment-based configuration       *
*   - Access to Firebase Authentication, Firestore, and Storage services     *
*   - Authentication state change listener for user management               *
*                                                                            *
*****************************************************************************/

// Importing the necessary Firebase SDK functions
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Define the Firebase configuration using environment variables
const firebaseConfig = {
    apiKey: process.env.REACT_APP_apiKey,
    authDomain: process.env.REACT_APP_authDomain,
    projectId: process.env.REACT_APP_projectId,
    storageBucket: process.env.REACT_APP_storageBucket,
    messagingSenderId: process.env.REACT_APP_messagingSenderId,
    appId: process.env.REACT_APP_appId,
};

// Initialize the Firebase app with the provided configuration
const app = initializeApp(firebaseConfig);

// Get references to the Firebase Authentication, Firestore, and Storage services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

onAuthStateChanged(auth, (user) => {
    if (user !== null) {
        console.log('User is signed in');
    } else {
        console.log('User is signed out');
    }
});
