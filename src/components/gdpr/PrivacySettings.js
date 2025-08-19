import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import './PrivacySettings.css';

const PrivacySettings = () => {
  const [settings, setSettings] = useState({
    dataProcessing: true,
    analytics: false,
    marketingEmails: false,
    personalization: false,
    dataSharing: false
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    loadPrivacySettings();
  }, [user]);

  const loadPrivacySettings = async () => {
    if (!user) return;

    try {
      const settingsDoc = await getDoc(doc(db, 'users', user.uid, 'privacy', 'settings'));
      
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data());
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'privacy', 'settings'), newSettings, {
          merge: true
        });
        
        // Update user preferences in auth record
        await updateDoc(doc(db, 'users', user.uid), {
          privacySettings: newSettings,
          privacySettingsUpdated: new Date().toISOString()
        });

        showToast('Privacy settings updated successfully', 'success');
      } catch (error) {
        console.error('Error saving privacy settings:', error);
        showToast('Error saving settings', 'error');
      }
    }
  };

  const handleDataExport = async () => {
    // This would trigger a Cloud Function to prepare data export
    showToast('Data export request received. You will receive an email shortly.', 'info');
  };

  const handleAccountDeletion = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // This would trigger a Cloud Function to process account deletion
      showToast('Account deletion request received. We will process it within 30 days.', 'info');
    }
  };

  if (loading) return <div>Loading privacy settings...</div>;

  return (
    <div className="privacy-settings">
      <h2>Privacy Settings</h2>
      
      <div className="privacy-section">
        <h3>Data Processing Consent</h3>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.dataProcessing}
              onChange={(e) => handleSettingChange('dataProcessing', e.target.checked)}
            />
            I consent to the processing of my personal data for educational purposes
          </label>
          <p className="setting-description">
            Required to use our services. We process your data in accordance with our Privacy Policy.
          </p>
        </div>
      </div>

      <div className="privacy-section">
        <h3>Communication Preferences</h3>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.analytics}
              onChange={(e) => handleSettingChange('analytics', e.target.checked)}
            />
            Allow analytics and performance tracking
          </label>
        </div>
        
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.marketingEmails}
              onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
            />
            Receive marketing communications
          </label>
        </div>

        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.personalization}
              onChange={(e) => handleSettingChange('personalization', e.target.checked)}
            />
            Allow content personalization
          </label>
        </div>
      </div>

      <div className="privacy-section">
        <h3>Data Rights</h3>
        
        <div className="data-rights-actions">
          <button 
            className="btn-secondary"
            onClick={handleDataExport}
          >
            Export My Data
          </button>
          
          <button 
            className="btn-danger"
            onClick={handleAccountDeletion}
          >
            Request Account Deletion
          </button>
        </div>
        
        <p className="setting-description">
          You have the right to access, correct, and delete your personal data. 
          Contact our Data Protection Officer at dpo@globalhorizonacademy.edu for assistance.
        </p>
      </div>

      <div className="privacy-links">
        <a href="/privacy-policy" target="_blank">Privacy Policy</a>
        <a href="/data-processing-agreement" target="_blank">Data Processing Agreement</a>
        <a href="/cookie-policy" target="_blank">Cookie Policy</a>
      </div>
    </div>
  );
};

export default PrivacySettings;
