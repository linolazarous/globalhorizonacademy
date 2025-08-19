// src/config/gdpr.js
export const GDPR_CONFIG = {
  // Data retention periods (in days)
  retentionPeriods: {
    userData: 730, // 2 years
    analytics: 365, // 1 year
    financial: 1825, // 5 years (legal requirement)
    cookies: 365,
    backups: 30
  },

  // Data processing purposes
  processingPurposes: {
    essential: 'Essential site functionality',
    analytics: 'Analytics and performance monitoring',
    marketing: 'Marketing and communications',
    personalization: 'Content personalization',
    payment: 'Payment processing',
    support: 'Customer support'
  },

  // Third-party processors
  dataProcessors: [
    {
      name: 'Google Analytics',
      purpose: 'analytics',
      country: 'United States',
      privacyPolicy: 'https://policies.google.com/privacy'
    },
    {
      name: 'Stripe',
      purpose: 'payment',
      country: 'United States',
      privacyPolicy: 'https://stripe.com/privacy'
    },
    {
      name: 'OpenAI',
      purpose: 'content_generation',
      country: 'United States',
      privacyPolicy: 'https://openai.com/privacy'
    }
  ],

  // Default consent settings
  defaultConsent: {
    essential: true, // Cannot be declined
    analytics: false,
    marketing: false,
    personalization: false
  }
};

export const GDPR_COOKIES = {
  essential: [
    'auth_token',
    'session_id',
    'csrf_token'
  ],
  analytics: [
    '_ga',
    '_gid',
    '_gat'
  ],
  marketing: [
    'fbp',
    '_fbp'
  ],
  personalization: [
    'user_preferences',
    'theme_settings'
  ]
};
