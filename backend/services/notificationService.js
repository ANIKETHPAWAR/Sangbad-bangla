const admin = require('firebase-admin');

class NotificationService {
  constructor() {
    this.messaging = null;
    this.fcmTokens = new Map(); // In production, use a database
    this._initializeMessaging();
  }

  _initializeMessaging() {
    try {
      if (admin.apps.length > 0) {
        this.messaging = admin.messaging();
      } else {
        console.warn('⚠️ Firebase not initialized, NotificationService will be disabled');
      }
    } catch (error) {
      console.error('❌ Error initializing Firebase Messaging:', error.message);
      this.messaging = null;
    }
  }

  _getMessaging() {
    if (!this.messaging) {
      this._initializeMessaging();
    }
    return this.messaging;
  }

  /**
   * Register a new FCM token
   */
  registerToken(token, metadata = {}) {
    this.fcmTokens.set(token, {
      token,
      registeredAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      isActive: true,
      ...metadata
    });
    // FCM token registered
  }

  /**
   * Send notification for new article
   */
  async sendNewArticleNotification(article) {
    try {
      const messaging = this._getMessaging();
      if (!messaging) {
        return { success: false, message: 'Firebase Messaging not available' };
      }
      
      if (this.fcmTokens.size === 0) {
        // No FCM tokens registered
        return { success: false, message: 'No tokens registered' };
      }

      const tokens = Array.from(this.fcmTokens.keys());
      
      const message = {
        notification: {
          title: article.title,
          body: article.excerpt || article.description || 'নতুন খবর প্রকাশিত হয়েছে',
          imageUrl: article.imageUrl || article.thumbnailUrl
        },
        data: {
          url: article.detailUrl || article.websiteUrl || `/article/${article.id}`,
          articleId: article.id || '',
          timestamp: new Date().toISOString(),
          type: 'new_article'
        },
        webpush: {
          notification: {
            icon: '/vite.svg',
            badge: '/vite.svg',
            requireInteraction: true,
            actions: [
              {
                action: 'open',
                title: 'খবর পড়ুন'
              },
              {
                action: 'dismiss',
                title: 'বন্ধ করুন'
              }
            ]
          }
        }
      };

      const result = await messaging.sendMulticast({
        tokens,
        ...message
      });

      // Update token status based on results
      result.responses.forEach((response, index) => {
        const token = tokens[index];
        if (response.success) {
          // Update last used timestamp
          const tokenData = this.fcmTokens.get(token);
          if (tokenData) {
            tokenData.lastUsed = new Date().toISOString();
          }
        } else {
          // Remove invalid tokens
          // Removing invalid FCM token
          this.fcmTokens.delete(token);
        }
      });

      // Article notification sent

      return {
        success: true,
        successCount: result.successCount,
        failureCount: result.failureCount,
        totalTokens: tokens.length
      };

    } catch (error) {
      console.error('❌ Error sending article notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send custom notification
   */
  async sendCustomNotification(title, body, data = {}) {
    try {
      const messaging = this._getMessaging();
      if (!messaging) {
        return { success: false, message: 'Firebase Messaging not available' };
      }
      
      if (this.fcmTokens.size === 0) {
        // No FCM tokens registered
        return { success: false, message: 'No tokens registered' };
      }

      const tokens = Array.from(this.fcmTokens.keys());
      
      const message = {
        notification: {
          title,
          body,
          imageUrl: data.imageUrl
        },
        data: {
          url: data.url || '/',
          timestamp: new Date().toISOString(),
          ...data
        },
        webpush: {
          notification: {
            icon: '/vite.svg',
            badge: '/vite.svg',
            requireInteraction: true,
            actions: [
              {
                action: 'open',
                title: 'খুলুন'
              },
              {
                action: 'dismiss',
                title: 'বন্ধ করুন'
              }
            ]
          }
        }
      };

      const result = await messaging.sendMulticast({
        tokens,
        ...message
      });

      // Update token status
      result.responses.forEach((response, index) => {
        const token = tokens[index];
        if (response.success) {
          const tokenData = this.fcmTokens.get(token);
          if (tokenData) {
            tokenData.lastUsed = new Date().toISOString();
          }
        } else {
          this.fcmTokens.delete(token);
        }
      });

      // Custom notification sent

      return {
        success: true,
        successCount: result.successCount,
        failureCount: result.failureCount,
        totalTokens: tokens.length
      };

    } catch (error) {
      console.error('❌ Error sending custom notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get notification statistics
   */
  getStats() {
    const activeTokens = Array.from(this.fcmTokens.values()).filter(token => token.isActive);
    
    return {
      totalTokens: this.fcmTokens.size,
      activeTokens: activeTokens.length,
      tokens: activeTokens.map(token => ({
        registeredAt: token.registeredAt,
        lastUsed: token.lastUsed,
        userAgent: token.userAgent
      }))
    };
  }

  /**
   * Clean up inactive tokens
   */
  cleanupInactiveTokens() {
    const now = new Date();
    const inactiveThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    let cleanedCount = 0;
    
    for (const [token, data] of this.fcmTokens.entries()) {
      const lastUsed = new Date(data.lastUsed);
      if (now - lastUsed > inactiveThreshold) {
        this.fcmTokens.delete(token);
        cleanedCount++;
      }
    }

    // Cleaned up inactive FCM tokens
    return { cleanedCount, remainingTokens: this.fcmTokens.size };
  }
}

// Create singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;
