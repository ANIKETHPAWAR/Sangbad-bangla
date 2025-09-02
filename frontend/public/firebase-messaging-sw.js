// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration will be fetched from backend
let firebaseConfig = null;
let messaging = null;

// Fetch Firebase configuration from backend
async function initializeFirebase() {
  try {
    const response = await fetch('/api/config/firebase-config');
    const data = await response.json();
    
    if (data.success) {
      firebaseConfig = data.config;
      
      // Initialize Firebase in the service worker
      firebase.initializeApp(firebaseConfig);
      
      // Initialize Firebase Messaging
      messaging = firebase.messaging();
      
      return true;
    } else {
      throw new Error('Failed to load Firebase config');
    }
  } catch (error) {
    // Fallback: Initialize with minimal config for basic functionality
    firebaseConfig = {
      projectId: "sangbad-bangla"
    };
    firebase.initializeApp(firebaseConfig);
    messaging = firebase.messaging();
    return false;
  }
}

// Handle background messages
function setupMessageHandler() {
  if (messaging) {
    messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'নতুন খবর';
  const notificationOptions = {
    body: payload.notification?.body || 'ক্লিক করে পড়ুন',
    icon: payload.notification?.icon || '/vite.svg',
    badge: '/vite.svg',
    image: payload.notification?.image,
    data: payload.data,
    tag: 'news-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'খবর পড়ুন',
        icon: '/vite.svg'
      },
      {
        action: 'dismiss',
        title: 'বন্ধ করুন'
      }
    ]
  };

  // Show the notification
  self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
}

// Initialize Firebase when service worker starts
initializeFirebase().then(() => {
  setupMessageHandler();
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  // Default action or 'open' action
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no existing window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  // Notification closed
});
