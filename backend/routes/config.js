const express = require('express');
const router = express.Router();

// Serve Firebase configuration securely
router.get('/firebase-config', (req, res) => {
  try {
    // Only return the necessary config for service worker
    const firebaseConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID
    };

    // Validate that all required config is present
    const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
    
    if (missingFields.length > 0) {
      return res.status(500).json({
        success: false,
        message: 'Firebase configuration incomplete',
        missingFields
      });
    }

    res.json({
      success: true,
      config: firebaseConfig
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load Firebase configuration'
    });
  }
});

module.exports = router;
