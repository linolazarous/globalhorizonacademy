import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { GDPR_CONFIG, GDPR_COOKIES } from '../../config/gdpr';
import './CookieConsent.css';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState(GDPR_CONFIG.defaultConsent);
  const { user } = useAuth();

  useEffect(() => {
    checkConsent();
  }, []);

  const checkConsent = async () => {
    const savedConsent = localStorage.getItem('cookie_consent');
    
    if (!savedConsent) {
      setShowBanner(true);
    } else {
      const parsedConsent = JSON.parse(savedConsent);
      setConsent(parsedConsent);
      applyConsentSettings(parsedConsent);
    }
  };

  const applyConsentSettings = (consentSettings) => {
    // Manage cookies based on consent
    Object.keys(GDPR_COOKIES).forEach(category => {
      if (!consentSettings[category]) {
        GDPR_COOKIES[category].forEach(cookie => {
          document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        });
      }
    });

    // Update analytics tracking
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': consentSettings.analytics ? 'granted' : 'denied',
        'ad_storage': consentSettings.marketing ? 'granted' : 'denied',
        'personalization_storage': consentSettings.personalization ? 'granted' : 'denied'
      });
    }
  };

  const handleAcceptAll = async () => {
    const newConsent = {
      essential: true,
      analytics: true,
      marketing: true,
      personalization: true
    };

    await saveConsent(newConsent);
    setShowBanner(false);
  };

  const handleSavePreferences = async () => {
    await saveConsent(consent);
    setShowBanner(false);
    setShowSettings(false);
  };

  const saveConsent = async (consentSettings) => {
    const timestamp = new Date().toISOString();
    const consentData = {
      ...consentSettings,
      timestamp,
      ipAddress: await getIpAddress(),
      userAgent: navigator.userAgent
    };

    localStorage.setItem('cookie_consent', JSON.stringify(consentData));
    applyConsentSettings(consentSettings);

    // Save to Firestore if user is logged in
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'consent', 'cookie_preferences'), {
          ...consentData,
          updatedAt: timestamp
        });
      } catch (error) {
        console.error('Error saving consent preferences:', error);
      }
    }
  };

  const getIpAddress = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-consent-banner">
      <div className="cookie-consent-content">
        <h3>Cookie Preferences</h3>
        
        {!showSettings ? (
          <>
            <p>
              We use cookies to enhance your experience, analyze traffic, 
              and personalize content. By continuing to use our site, you 
              consent to our use of cookies in accordance with our 
              <a href="/privacy-policy" target="_blank"> Privacy Policy</a>.
            </p>
            
            <div className="cookie-consent-actions">
              <button 
                className="btn-primary" 
                onClick={handleAcceptAll}
              >
                Accept All
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setShowSettings(true)}
              >
                Customize Preferences
              </button>
              <button 
                className="btn-link"
                onClick={() => setShowBanner(false)}
              >
                Reject Non-Essential
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="cookie-settings">
              <div className="cookie-category">
                <label>
                  <input
                    type="checkbox"
                    checked={consent.essential}
                    disabled
                  />
                  <strong>Essential Cookies</strong>
                  <span className="cookie-description">
                    Required for basic site functionality. Cannot be disabled.
                  </span>
                </label>
              </div>

              <div className="cookie-category">
                <label>
                  <input
                    type="checkbox"
                    checked={consent.analytics}
                    onChange={(e) => setConsent({...consent, analytics: e.target.checked})}
                  />
                  <strong>Analytics Cookies</strong>
                  <span className="cookie-description">
                    Help us understand how visitors interact with our website.
                  </span>
                </label>
              </div>

              <div className="cookie-category">
                <label>
                  <input
                    type="checkbox"
                    checked={consent.marketing}
                    onChange={(e) => setConsent({...consent, marketing: e.target.checked})}
                  />
                  <strong>Marketing Cookies</strong>
                  <span className="cookie-description">
                    Used to track visitors across websites for advertising purposes.
                  </span>
                </label>
              </div>

              <div className="cookie-category">
                <label>
                  <input
                    type="checkbox"
                    checked={consent.personalization}
                    onChange={(e) => setConsent({...consent, personalization: e.target.checked})}
                  />
                  <strong>Personalization Cookies</strong>
                  <span className="cookie-description">
                    Allow the website to remember choices you make and provide enhanced features.
                  </span>
                </label>
              </div>
            </div>

            <div className="cookie-consent-actions">
              <button 
                className="btn-primary"
                onClick={handleSavePreferences}
              >
                Save Preferences
              </button>
              <button 
                className="btn-link"
                onClick={() => setShowSettings(false)}
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;
