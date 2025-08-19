const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');
const { initializeApp } = require('firebase/app');

const app = initializeApp(JSON.parse(process.env.FIREBASE_CONFIG));
const db = getFirestore(app);

const logEvent = async (eventType, data) => {
  try {
    await setDoc(doc(db, 'events', `${eventType}-${Date.now()}`), {
      type: eventType,
      data,
      timestamp: serverTimestamp(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Failed to log event:', error);
  }
};

const logError = async (errorType, error, context) => {
  try {
    await setDoc(doc(db, 'errors', `${errorType}-${Date.now()}`), {
      type: errorType,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      timestamp: serverTimestamp(),
      environment: process.env.NODE_ENV
    });
  } catch (loggingError) {
    console.error('Failed to log error:', loggingError);
  }
};

module.exports = {
  logEvent,
  logError
};