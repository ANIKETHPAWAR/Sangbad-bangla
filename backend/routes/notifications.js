const express = require('express');
const admin = require('firebase-admin');
const notificationService = require('../services/notificationService');
const router = express.Router();

// Register FCM token endpoint
router.post('/register', async (req, res) => {
  try {
    const { token, userAgent, timestamp } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required'
      });
    }

    // Register token using notification service
    notificationService.registerToken(token, {
      userAgent,
      registeredAt: timestamp || new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'FCM token registered successfully',
      tokenCount: notificationService.getStats().totalTokens
    });

  } catch (error) {
    console.error('❌ Error registering FCM token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register FCM token',
      error: error.message
    });
  }
});

// Send notification to all registered tokens
router.post('/send', async (req, res) => {
  try {
    const { title, body, imageUrl, data } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Notification title is required'
      });
    }

    // Send notification using notification service
    const result = await notificationService.sendCustomNotification(title, body, {
      imageUrl,
      url: data?.url || '/',
      ...data
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || 'Failed to send notification'
      });
    }

    res.json({
      success: true,
      message: 'Notification sent successfully',
      results: {
        successCount: result.successCount,
        failureCount: result.failureCount,
        totalTokens: result.totalTokens
      }
    });

  } catch (error) {
    console.error('❌ Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
});

// Send notification for new article
router.post('/send-article', async (req, res) => {
  try {
    const { article } = req.body;

    if (!article || !article.title) {
      return res.status(400).json({
        success: false,
        message: 'Article data is required'
      });
    }

    // Prepare article notification
    const title = article.title;
    const body = article.excerpt || article.description || 'নতুন খবর প্রকাশিত হয়েছে';
    const imageUrl = article.imageUrl || article.thumbnailUrl;
    const articleUrl = article.detailUrl || article.websiteUrl || `/article/${article.id}`;

    // Send notification using notification service
    const result = await notificationService.sendNewArticleNotification(article);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || 'Failed to send article notification'
      });
    }

    res.json({
      success: true,
      message: 'Article notification sent successfully',
      article: {
        title,
        url: articleUrl
      },
      results: {
        successCount: result.successCount,
        failureCount: result.failureCount
      }
    });

  } catch (error) {
    console.error('❌ Error sending article notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send article notification',
      error: error.message
    });
  }
});

// Get notification statistics
router.get('/stats', (req, res) => {
  try {
    const stats = notificationService.getStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Error getting notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification stats',
      error: error.message
    });
  }
});

// Clean up inactive tokens (call this periodically)
router.post('/cleanup', (req, res) => {
  try {
    const result = notificationService.cleanupInactiveTokens();

    res.json({
      success: true,
      message: 'Token cleanup completed',
      cleanedCount: result.cleanedCount,
      remainingTokens: result.remainingTokens
    });
  } catch (error) {
    console.error('❌ Error cleaning up tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup tokens',
      error: error.message
    });
  }
});

module.exports = router;
