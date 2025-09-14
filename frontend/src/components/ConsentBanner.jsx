import React, { useState, useEffect } from 'react';
import './ConsentBanner.css';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  
  const updateGtagConsent = (accepted) => {
    try {
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);} // eslint-disable-line no-inner-declarations
      gtag('consent', 'update', {
        'ad_storage': accepted ? 'granted' : 'denied',
        'ad_user_data': accepted ? 'granted' : 'denied',
        'ad_personalization': accepted ? 'granted' : 'denied',
        'analytics_storage': accepted ? 'granted' : 'denied'
      });
    } catch (e) {
      console.warn('Consent update failed:', e);
    }
  };

  useEffect(() => {
    // Check if user has already accepted cookies
    const stored = localStorage.getItem('cookieConsent');
    if (!stored) {
      setShowBanner(true);
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.expiry && Date.now() > parsed.expiry) {
        // Expired -> show and reset defaults (denied)
        updateGtagConsent(false);
        setShowBanner(true);
      } else {
        // Persist existing choice to Consent Mode on load
        updateGtagConsent(!!parsed?.accepted);
      }
    } catch (e) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    // Store acceptance in localStorage with expiry (1 year)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    const value = {
      accepted: true,
      timestamp: Date.now(),
      expiry: expiryDate.getTime()
    };
    localStorage.setItem('cookieConsent', JSON.stringify(value));
    updateGtagConsent(true);
    
    setShowBanner(false);
  };

  const handleDecline = () => {
    // Store decline in localStorage (shorter expiry - 30 days)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    const value = {
      accepted: false,
      timestamp: Date.now(),
      expiry: expiryDate.getTime()
    };
    localStorage.setItem('cookieConsent', JSON.stringify(value));
    updateGtagConsent(false);
    
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="cookie-consent-banner">
      <div className="cookie-consent-content">
        <div className="cookie-consent-text">
          <p>
            🍪 This website uses cookies to enhance your experience and provide personalized content. 
            By continuing to use this site, you consent to our use of cookies.
          </p>
        </div>
        <div className="cookie-consent-actions">
          <button 
            className="cookie-consent-decline"
            onClick={handleDecline}
          >
            Decline
          </button>
          <button 
            className="cookie-consent-accept"
            onClick={handleAccept}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
