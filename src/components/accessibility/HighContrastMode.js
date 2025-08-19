// src/components/accessibility/HighContrastMode.js
import React, { useState, useEffect } from 'react';

const HighContrastMode = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('highContrastMode') === 'true';
    setIsEnabled(saved);
    applyHighContrast(saved);
  }, []);

  const applyHighContrast = (enabled) => {
    if (enabled) {
      document.documentElement.setAttribute('data-high-contrast', 'true');
    } else {
      document.documentElement.removeAttribute('data-high-contrast');
    }
  };

  const toggleHighContrast = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('highContrastMode', newState.toString());
    applyHighContrast(newState);
  };

  return (
    <button
      onClick={toggleHighContrast}
      className={`high-contrast-toggle ${isEnabled ? 'active' : ''}`}
      aria-pressed={isEnabled}
      aria-label="Toggle high contrast mode"
    >
      {isEnabled ? 'Disable High Contrast' : 'Enable High Contrast'}
    </button>
  );
};

export default HighContrastMode;
