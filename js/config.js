// js/config.js
const CONFIG = {
  // Firebase Configuration
  firebase: {
    apiKey: window.__NETLIFY_ENV__?.FIREBASE_API_KEY || 'fallback-api-key',
    authDomain: window.__NETLIFY_ENV__?.FIREBASE_AUTH_DOMAIN || 'fallback-auth-domain',
    projectId: window.__NETLIFY_ENV__?.FIREBASE_PROJECT_ID || 'fallback-project-id',
    storageBucket: window.__NETLIFY_ENV__?.FIREBASE_STORAGE_BUCKET || 'fallback-storage-bucket',
    messagingSenderId: window.__NETLIFY_ENV__?.FIREBASE_MESSAGING_SENDER_ID || 'fallback-sender-id',
    appId: window.__NETLIFY_ENV__?.FIREBASE_APP_ID || 'fallback-app-id'
  },
  
  // Stripe
  stripe: {
    publishableKey: window.__NETLIFY_ENV__?.STRIPE_PUBLISHABLE_KEY || 'pk_test_fallback_key'
  },
  
  // OpenAI
  openai: {
    apiKey: window.__NETLIFY_ENV__?.OPENAI_API_KEY || 'sk-fallback-key'
  }
};

// Make config globally available
window.APP_CONFIG = CONFIG;
