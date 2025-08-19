// netlify/functions/create-checkout-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
  maxNetworkRetries: 3,
  timeout: 20000
});
const { validateAuth, validateSubscriptionRequest } = require('../utils/validators');
const { logEvent, logError } = require('../utils/logger');
const { getFirestore, doc, getDoc } = require('firebase/firestore');
const { initializeApp } = require('firebase/app');

// Initialize Firebase
const app = initializeApp(JSON.parse(process.env.FIREBASE_CONFIG));
const db = getFirestore(app);

// Plan configuration - should match your Stripe products
const PLANS = {
  'premium-monthly': {
    stripePriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    name: 'Premium Monthly',
    type: 'recurring'
  },
  'premium-annual': {
    stripePriceId: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID,
    name: 'Premium Annual',
    type: 'recurring'
  },
  'course-lifetime': {
    stripePriceId: process.env.STRIPE_COURSE_LIFETIME_PRICE_ID,
    name: 'Course Lifetime Access',
    type: 'one_time'
  }
};

exports.handler = async (event, context) => {
  try {
    // Validate method
    if (event.httpMethod !== 'POST') {
      throw new CustomError('Method Not Allowed', 405);
    }

    // Validate authentication
    const user = await validateAuth(event);
    
    // Validate and parse request
    const { planId, coupon } = validateSubscriptionRequest(
      JSON.parse(event.body)
    );

    // Verify plan exists
    const plan = PLANS[planId];
    if (!plan) {
      throw new CustomError('Invalid plan ID', 400);
    }

    // Check for existing subscription
    const userRef = doc(db, 'users', user.id);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists() && userSnap.data().subscription?.status === 'active') {
      throw new CustomError('You already have an active subscription', 400);
    }

    // Create Stripe session
    const sessionParams = {
      payment_method_types: ['card'],
      line_items: [{
        price: plan.stripePriceId,
        quantity: 1,
      }],
      mode: plan.type === 'recurring' ? 'subscription' : 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/canceled`,
      client_reference_id: user.id,
      metadata: {
        planId,
        userId: user.id,
        environment: process.env.NODE_ENV
      },
      customer_email: user.email,
      allow_promotion_codes: true
    };

    // Add coupon if provided
    if (coupon) {
      sessionParams.discounts = [{ coupon }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Log session creation
    await logEvent('checkout_session_created', {
      userId: user.id,
      planId,
      sessionId: session.id,
      amount: session.amount_total,
      currency: session.currency
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: session.id,
        url: session.url,
        expiresAt: new Date(session.expires_at * 1000).toISOString(),
        amount: session.amount_total,
        currency: session.currency
      })
    };

  } catch (error) {
    await logError('checkout_session_error', error, event.body);
    
    return {
      statusCode: error.statusCode || 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.publicMessage || 'Checkout session creation failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
