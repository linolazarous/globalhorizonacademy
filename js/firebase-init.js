// js/firebase-init.js
// Initialize Firebase with environment variables
firebase.initializeApp(window.APP_CONFIG.firebase);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
