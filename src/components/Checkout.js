import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { auth } from '../firebase';
import { useToast } from '../hooks/useToast';
import { trackEvent } from '../utils/analytics';

// Load Stripe with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PaymentStatus = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed'
};

const CheckoutForm = ({ course, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentStatus, setPaymentStatus] = useState(PaymentStatus.IDLE);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setPaymentStatus(PaymentStatus.PROCESSING);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Authentication required');
      }

      const idToken = await user.getIdToken();
      
      // Create payment intent
      const response = await fetch('/.netlify/functions/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ 
          courseId: course.id,
          userId: user.uid 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment processing failed');
      }
      
      const { clientSecret } = await response.json();
      
      // Confirm card payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: user.displayName || 'Course Student',
              email: user.email
            }
          }
        }
      );
      
      if (stripeError) {
        throw new Error(stripeError.message);
      }
      
      if (paymentIntent.status === 'succeeded') {
        setPaymentStatus(PaymentStatus.SUCCEEDED);
        showToast('Payment successful!', 'success');
        trackEvent('payment_succeeded', {
          courseId: course.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency
        });
        
        // Call success handler if provided
        if (onSuccess) {
          onSuccess(paymentIntent);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus(PaymentStatus.FAILED);
      setError(error.message);
      showToast(error.message || 'Payment failed', 'error');
      trackEvent('payment_failed', {
        courseId: course.id,
        error: error.message
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
        
        <div className="mb-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
            className="p-3 border border-gray-300 rounded-md"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex justify-between items-center border-t border-gray-200 pt-4">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-semibold text-gray-900">
              ${(course.price / 100).toFixed(2)}
            </p>
          </div>
          <button
            type="submit"
            disabled={!stripe || paymentStatus === PaymentStatus.PROCESSING}
            className={`py-2 px-6 rounded-md text-white font-medium ${
              !stripe || paymentStatus === PaymentStatus.PROCESSING 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors shadow-sm`}
          >
            {paymentStatus === PaymentStatus.PROCESSING ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Pay Now'
            )}
          </button>
        </div>
      </div>

      {paymentStatus === PaymentStatus.SUCCEEDED && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-lg font-medium text-green-800 mb-2">Payment Successful!</h3>
          <p className="text-green-700">You now have full access to the course.</p>
          <a
            href={`/courses/${course.id}`}
            className="mt-2 inline-block text-green-600 hover:text-green-800 font-medium"
          >
            Go to Course →
          </a>
        </div>
      )}
    </form>
  );
};

const Checkout = ({ course, onSuccess }) => {
  return (
    <Elements stripe={stripePromise}>
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h2>
          <p className="text-gray-600">Complete your purchase of <span className="font-medium">{course.title}</span></p>
        </div>
        <CheckoutForm course={course} onSuccess={onSuccess} />
      </div>
    </Elements>
  );
};

export default Checkout;