// src/services/payment.js
import { loadStripe } from '@stripe/stripe-js';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import analytics from './analytics';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

class PaymentService {
  constructor() {
    this.createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
    this.createSubscription = httpsCallable(functions, 'createSubscription');
  }

  async processCoursePayment(courseId, amount) {
    try {
      const result = await this.createPaymentIntent({
        courseId,
        amount,
        currency: 'usd'
      });

      const stripe = await stripePromise;
      const { error } = await stripe.confirmCardPayment(result.data.clientSecret);

      if (error) {
        analytics.trackEvent('payment_failed', {
          courseId,
          error: error.message
        });
        throw error;
      }

      analytics.trackEvent('payment_success', {
        courseId,
        amount
      });

      return { success: true };
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  }

  async createEnterpriseSubscription(planData) {
    try {
      const result = await this.createSubscription(planData);
      
      analytics.trackEvent('subscription_created', {
        plan: planData.planId,
        amount: planData.amount
      });

      return result.data;
    } catch (error) {
      console.error('Subscription error:', error);
      throw error;
    }
  }
}

export default new PaymentService();
