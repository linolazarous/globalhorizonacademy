// netlify/functions/create-payment-intent.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
  maxNetworkRetries: 3,
  timeout: 20000
});
const { validateAuth, validatePaymentRequest } = require('../utils/validators');
const { logEvent, logError } = require('../utils/logger');
const { getFirestore, doc, getDoc } = require('firebase/firestore');
const { initializeApp } = require('firebase/app');

// Initialize Firebase
const app = initializeApp(JSON.parse(process.env.FIREBASE_CONFIG));
const db = getFirestore(app);

exports.handler = async (event, context) => {
  try {
    // Validate authentication
    const user = await validateAuth(event);
    
    // Validate and parse request
    const { courseId } = validatePaymentRequest(JSON.parse(event.body));

    // Verify course exists and get price
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (!courseSnap.exists()) {
      throw new CustomError('Course not found', 404);
    }

    const courseData = courseSnap.data();
    const amount = courseData.price || 29900; // Default to $299 if no price set

    // Check if user already purchased
    const purchaseRef = doc(db, `users/${user.id}/purchases`, courseId);
    const purchaseSnap = await getDoc(purchaseRef);
    
    if (purchaseSnap.exists()) {
      throw new CustomError('You already purchased this course', 400);
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        courseId,
        userId: user.id,
        environment: process.env.NODE_ENV
      },
      description: `Payment for course: ${courseData.title}`,
      receipt_email: user.email,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Log payment intent creation
    await logEvent('payment_intent_created', {
      userId: user.id,
      courseId,
      amount,
      intentId: paymentIntent.id
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        amount,
        currency: paymentIntent.currency,
        course: {
          id: courseId,
          title: courseData.title
        }
      })
    };
  } catch (error) {
    await logError('payment_intent_error', error, event.body);
    
    return {
      statusCode: error.statusCode || 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.publicMessage || 'Payment processing failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
