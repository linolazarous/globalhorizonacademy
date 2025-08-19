// src/components/monetization/PricingTiers.js
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../Checkout';
import analytics from '../../services/analytics';
import { useLocalization } from '../../hooks/useLocalization';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PricingTiers = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { t, formatCurrency } = useLocalization();

  const pricingPlans = {
    basic: {
      monthly: 990,
      annual: 9900,
      features: ['access_courses', 'community_forum', 'basic_support']
    },
    premium: {
      monthly: 1990,
      annual: 19900,
      features: ['all_courses', 'certificates', 'priority_support', 'download_content']
    },
    enterprise: {
      custom: true,
      features: ['sso_integration', 'custom_content', 'dedicated_support', 'analytics_dashboard']
    }
  };

  const handlePlanSelect = (plan, period) => {
    setSelectedPlan({ plan, period });
    analytics.trackEvent('plan_selected', { plan, period });
  };

  return (
    <div className="pricing-container">
      <h2>{t('pricing.title')}</h2>
      
      <div className="pricing-tiers">
        {Object.entries(pricingPlans).map(([planKey, planData]) => (
          <div key={planKey} className={`pricing-tier ${planKey}`}>
            <h3>{t(`pricing.${planKey}.title`)}</h3>
            
            {planData.custom ? (
              <div className="price custom">{t('pricing.custom')}</div>
            ) : (
              <>
                <div className="price monthly">
                  {formatCurrency(planData.monthly / 100)}/{t('pricing.month')}
                </div>
                <div className="price annual">
                  {formatCurrency(planData.annual / 100)}/{t('pricing.year')}
                  <span className="discount">{t('pricing.savePercent', { percent: 16 })}</span>
                </div>
              </>
            )}
            
            <ul className="features">
              {planData.features.map(feature => (
                <li key={feature}>{t(`pricing.features.${feature}`)}</li>
              ))}
            </ul>
            
            {!planData.custom && (
              <div className="plan-actions">
                <button 
                  onClick={() => handlePlanSelect(planKey, 'monthly')}
                  className="btn-primary"
                >
                  {t('pricing.selectMonthly')}
                </button>
                <button 
                  onClick={() => handlePlanSelect(planKey, 'annual')}
                  className="btn-secondary"
                >
                  {t('pricing.selectAnnual')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedPlan && (
        <Elements stripe={stripePromise}>
          <CheckoutForm 
            plan={selectedPlan.plan}
            period={selectedPlan.period}
            amount={pricingPlans[selectedPlan.plan][selectedPlan.period]}
          />
        </Elements>
      )}
    </div>
  );
};

export default PricingTiers;
