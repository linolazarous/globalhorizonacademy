// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';

// Firebase configuration - should be loaded from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app;
let db;
let storage;
let auth;
let realtimeDb;
let analytics;
let performance;

try {
  app = initializeApp(firebaseConfig);
  
  // Initialize Firestore with offline persistence
  db = getFirestore(app);
  
  // Enable offline persistence for Firestore
  if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser doesn\'t support persistence.');
      }
    });
  }

  // Initialize Storage
  storage = getStorage(app);
  
  // Initialize Auth with persistence
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Auth persistence error:', error);
  });

  // Initialize Realtime Database
  realtimeDb = getDatabase(app);

  // Initialize Analytics only if supported and in production
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  }

  // Initialize Performance Monitoring
  if (typeof window !== 'undefined') {
    performance = getPerformance(app);
  }

  // Connect to emulators in development
  if (process.env.NODE_ENV === 'development') {
    try {
      // Firestore emulator
      // connectFirestoreEmulator(db, 'localhost', 8080);
      
      // Storage emulator
      // connectStorageEmulator(storage, 'localhost', 9199);
      
      // Auth emulator
      // connectAuthEmulator(auth, 'http://localhost:9099');
      
      // Database emulator
      // connectDatabaseEmulator(realtimeDb, 'localhost', 9000);
      
      console.log('Development mode: Firebase emulators available');
    } catch (emulatorError) {
      console.warn('Emulator connection failed:', emulatorError);
    }
  }

} catch (error) {
  console.error('Firebase initialization failed:', error);
  throw new Error('Firebase services failed to initialize. Please check your configuration.');
}

// Export services with fallbacks
export { 
  app, 
  db, 
  storage, 
  auth, 
  realtimeDb, 
  analytics, 
  performance 
};

export default app;
