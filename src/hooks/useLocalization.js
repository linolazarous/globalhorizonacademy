// src/hooks/useLocalization.js
import { useState, useEffect, createContext, useContext } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from './useAuth';

const LocalizationContext = createContext();

export const LocalizationProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    // Load user's language preference
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
    setLanguage(savedLanguage);

    // Load translations
    const unsubscribe = onSnapshot(doc(db, 'translations', savedLanguage), (doc) => {
      if (doc.exists()) {
        setTranslations(doc.data());
      }
    });

    return unsubscribe;
  }, []);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('preferredLanguage', newLanguage);
    analytics.trackEvent('language_changed', { language: newLanguage });
  };

  const t = (key, params = {}) => {
    let translation = translations[key] || key;
    
    // Replace parameters in translation
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param]);
    });
    
    return translation;
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency
    }).format(amount);
  };

  const value = {
    language,
    translations,
    t,
    formatCurrency,
    changeLanguage
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};