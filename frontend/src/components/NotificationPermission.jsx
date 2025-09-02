import React, { useState, useEffect } from 'react';
import { FiBell, FiBellOff, FiX } from 'react-icons/fi';
import useNotifications from '../hooks/useNotifications';
import './NotificationPermission.css';

const NotificationPermission = () => {
  const { permission, isSupported, requestPermission, error } = useNotifications();
  const [showBanner, setShowBanner] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Check if we're on localhost
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // Show banner if notifications are supported, permission is not granted, and not on localhost
    if (isSupported && permission === 'default' && !isLocalhost) {
      // Check if user has previously dismissed the banner
      const dismissed = localStorage.getItem('notificationBannerDismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    }
  }, [isSupported, permission]);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        setShowBanner(false);
        // Store that user granted permission
        localStorage.setItem('notificationPermissionGranted', 'true');
      }
    } catch (err) {
      console.error('Error requesting permission:', err);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Store dismissal for 7 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    localStorage.setItem('notificationBannerDismissed', JSON.stringify({
      dismissed: true,
      expiry: expiryDate.getTime()
    }));
  };

  // Don't show if not supported, already granted, or dismissed
  if (!isSupported || permission === 'granted' || !showBanner) {
    return null;
  }

  return (
    <div className="notification-permission-banner">
      <div className="notification-permission-content">
        <div className="notification-permission-icon">
          <FiBell />
        </div>
        
        <div className="notification-permission-text">
          <h4>Stay Updated</h4>
          <p>
            Get instant notifications for breaking news and important updates.
          </p>
        </div>

        <div className="notification-permission-actions">
          <button 
            className="notification-permission-dismiss"
            onClick={handleDismiss}
            title="Dismiss for 7 days"
          >
            <FiX />
          </button>
          
          <button 
            className="notification-permission-enable"
            onClick={handleRequestPermission}
            disabled={isRequesting}
          >
            {isRequesting ? (
              <>
                <div className="spinner"></div>
                Enabling...
              </>
            ) : (
              <>
                <FiBell />
                Enable
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="notification-permission-error">
          <FiBellOff />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default NotificationPermission;
