import { useState, useEffect, useCallback } from 'react';
import { messaging, VAPID_KEY } from '../config/firebase';
import { getToken, onMessage } from 'firebase/messaging';

const useNotifications = () => {
  const [token, setToken] = useState(null);
  const [permission, setPermission] = useState('default');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);

  // Check if notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      if ('Notification' in window && 'serviceWorker' in navigator && messaging) {
        setIsSupported(true);
        setPermission(Notification.permission);
      } else {
        setIsSupported(false);
        setPermission('denied');
        setError('Notifications not supported in this browser');
      }
    };

    checkSupport();
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setError('Notifications not supported');
      return false;
    }

    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setPermission(permission);
        
        if (permission === 'granted') {
          await getFCMToken();
          return true;
        } else {
          setError('Notification permission denied');
          return false;
        }
      } else {
        setError('Notification API not available');
        return false;
      }
    } catch (err) {
      setError('Failed to request notification permission');
      return false;
    }
  }, [isSupported]);

  // Get FCM token
  const getFCMToken = useCallback(async () => {
    if (!messaging || !VAPID_KEY) {
      setError('Firebase messaging not configured');
      return null;
    }

    // Check if we're on localhost
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      setError('Push notifications not supported on localhost. Will work in production.');
      return null;
    }

    try {
      // Register service worker first
      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        } catch (swError) {
          setError('Service worker registration failed');
          return null;
        }
      }

      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY
      });

      if (currentToken) {
        setToken(currentToken);
        
        // Send token to backend
        await sendTokenToBackend(currentToken);
        
        return currentToken;
      } else {
        setError('No registration token available');
        return null;
      }
    } catch (err) {
      setError('Failed to get notification token: ' + err.message);
      return null;
    }
  }, []);

  // Send FCM token to backend
  const sendTokenToBackend = async (fcmToken) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: fcmToken,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to register token with backend');
      }
    } catch (err) {
      setError('Failed to register with notification service');
    }
  };

  // Listen for foreground messages
  useEffect(() => {
    if (!messaging || !isSupported) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      // Show notification manually for foreground messages
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(payload.notification?.title || 'নতুন খবর', {
          body: payload.notification?.body || 'ক্লিক করে পড়ুন',
          icon: payload.notification?.icon || '/vite.svg',
          badge: '/vite.svg',
          image: payload.notification?.image,
          data: payload.data,
          tag: 'news-notification',
          requireInteraction: true
        });

        notification.onclick = () => {
          window.focus();
          const url = payload.data?.url || '/';
          window.location.href = url;
          notification.close();
        };
      }
    });

    return () => unsubscribe();
  }, [isSupported]);

  // Initialize token if permission is already granted
  useEffect(() => {
    if (isSupported && permission === 'granted' && !token) {
      getFCMToken();
    }
  }, [isSupported, permission, token, getFCMToken]);

  return {
    token,
    permission,
    isSupported,
    error,
    requestPermission,
    getFCMToken
  };
};

export default useNotifications;