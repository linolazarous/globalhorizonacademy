// js/config.js
const CONFIG = {
  STRIPE_PUBLISHABLE_KEY: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key',
  OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY || 'sk-your-openai-key'
};

// Make available globally
window.APP_CONFIG = CONFIG;
