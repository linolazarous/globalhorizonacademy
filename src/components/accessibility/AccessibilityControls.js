// src/components/accessibility/AccessibilityControls.js
import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import './AccessibilityControls.css';

const AccessibilityControls = () => {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const { t, currentLanguage } = useLocalization();

  useEffect(() => {
    // Load saved preferences
    const savedContrast = localStorage.getItem('highContrast') === 'true';
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    
    setHighContrast(savedContrast);
    setFontSize(savedFontSize);
    applyAccessibilitySettings(savedContrast, savedFontSize);
  }, []);

  const applyAccessibilitySettings = (contrast, size) => {
    document.documentElement.setAttribute('data-contrast', contrast);
    document.documentElement.setAttribute('data-font-size', size);
  };

  const handleContrastChange = (enabled) => {
    setHighContrast(enabled);
    localStorage.setItem('highContrast', enabled);
    applyAccessibilitySettings(enabled, fontSize);
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
    applyAccessibilitySettings(highContrast, size);
  };

  return (
    <div className="accessibility-controls" aria-label={t('accessibility.controls')}>
      <button
        onClick={() => handleContrastChange(!highContrast)}
        className={`contrast-toggle ${highContrast ? 'active' : ''}`}
        aria-pressed={highContrast}
      >
        {t('accessibility.highContrast')}
      </button>
      
      <div className="font-size-controls">
        <button onClick={() => handleFontSizeChange('small')} aria-label={t('accessibility.smallText')}>
          A
        </button>
        <button onClick={() => handleFontSizeChange('medium')} aria-label={t('accessibility.mediumText')}>
          A
        </button>
        <button onClick={() => handleFontSizeChange('large')} aria-label={t('accessibility.largeText')}>
          A
        </button>
      </div>
    </div>
  );
};

export default AccessibilityControls;
