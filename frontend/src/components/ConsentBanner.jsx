import React, { useState, useEffect } from 'react';
import './ConsentBanner.css';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem('cookieConsent');
    if (!hasAccepted) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    // Store acceptance in localStorage with expiry (1 year)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    localStorage.setItem('cookieConsent', JSON.stringify({
      accepted: true,
      timestamp: Date.now(),
      expiry: expiryDate.getTime()
    }));
    
    setShowBanner(false);
  };

  const handleDecline = () => {
    // Store decline in localStorage (shorter expiry - 30 days)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    localStorage.setItem('cookieConsent', JSON.stringify({
      accepted: false,
      timestamp: Date.now(),
      expiry: expiryDate.getTime()
    }));
    
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
