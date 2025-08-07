import { useState, useEffect, useCallback, useRef } from 'react';
import newsService from '../services/newsService';

/**
 * Custom hook for real-time news updates
 * Provides breaking news, live updates, and real-time notifications
 */
export const useRealTimeNews = () => {
  const [breakingNews, setBreakingNews] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs for cleanup
  const wsRef = useRef(null);
  const intervalRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Initialize real-time connection
  const initializeRealTimeConnection = useCallback(() => {
    try {
      // Subscribe to breaking news WebSocket
      wsRef.current = newsService.subscribeToBreakingNews((data) => {
        if (data && data.success) {
          setBreakingNews(data.data || []);
          setLastUpdate(new Date());
          setIsConnected(true);
          setError(null);
        }
      });

      // Set up polling for latest news as fallback
      intervalRef.current = setInterval(async () => {
        try {
          const response = await newsService.getLatestNews(5);
          if (response && response.success) {
            setLatestNews(response.data || []);
            setLastUpdate(new Date());
          }
        } catch (err) {
          console.error('Error fetching latest news:', err);
          setError('Failed to fetch latest news');
        }
      }, 60000); // Poll every minute

      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing real-time connection:', err);
      setError('Failed to connect to real-time news service');
      setIsLoading(false);
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (wsRef.current) {
      if (wsRef.current.close) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Retry connection
  const retryConnection = useCallback(() => {
    cleanup();
    setIsConnected(false);
    setError(null);
    
    retryTimeoutRef.current = setTimeout(() => {
      initializeRealTimeConnection();
    }, 5000); // Retry after 5 seconds
  }, [cleanup, initializeRealTimeConnection]);

  // Manual refresh function
  const refreshNews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch breaking news
      const breakingResponse = await newsService.getBreakingNews();
      if (breakingResponse && breakingResponse.success) {
        setBreakingNews(breakingResponse.data || []);
      }
      
      // Fetch latest news
      const latestResponse = await newsService.getLatestNews(5);
      if (latestResponse && latestResponse.success) {
        setLatestNews(latestResponse.data || []);
      }
      
      setLastUpdate(new Date());
      setIsConnected(true);
    } catch (err) {
      console.error('Error refreshing news:', err);
      setError('Failed to refresh news');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get news by category with real-time updates
  const getNewsByCategory = useCallback(async (category, page = 1, limit = 20) => {
    try {
      const response = await newsService.getNewsByCategory(category, page, limit);
      return response;
    } catch (err) {
      console.error(`Error fetching ${category} news:`, err);
      throw err;
    }
  }, []);

  // Search news
  const searchNews = useCallback(async (query, filters = {}) => {
    try {
      const response = await newsService.searchArticles(query, filters);
      return response;
    } catch (err) {
      console.error('Error searching news:', err);
      throw err;
    }
  }, []);

  // Get article details
  const getArticle = useCallback(async (articleId) => {
    try {
      const response = await newsService.getArticleById(articleId);
      return response;
    } catch (err) {
      console.error('Error fetching article:', err);
      throw err;
    }
  }, []);

  // Get trending news
  const getTrendingNews = useCallback(async () => {
    try {
      const response = await newsService.getTrendingNews();
      return response;
    } catch (err) {
      console.error('Error fetching trending news:', err);
      throw err;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeRealTimeConnection();
    
    // Cleanup on unmount
    return cleanup;
  }, [initializeRealTimeConnection, cleanup]);

  // Auto-reconnect on connection loss
  useEffect(() => {
    if (!isConnected && !isLoading && !error) {
      retryConnection();
    }
  }, [isConnected, isLoading, error, retryConnection]);

  // Format last update time
  const getLastUpdateText = useCallback(() => {
    if (!lastUpdate) return 'Never';
    
    const now = new Date();
    const diff = now - lastUpdate;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  }, [lastUpdate]);

  // Get breaking news count
  const getBreakingNewsCount = useCallback(() => {
    return breakingNews.length;
  }, [breakingNews]);

  // Check if there are new breaking news
  const hasNewBreakingNews = useCallback(() => {
    if (!lastUpdate) return false;
    
    const now = new Date();
    const diff = now - lastUpdate;
    const minutes = Math.floor(diff / 60000);
    
    // Consider news "new" if it's less than 5 minutes old
    return minutes < 5 && breakingNews.length > 0;
  }, [lastUpdate, breakingNews]);

  // Get news by priority
  const getHighPriorityNews = useCallback(() => {
    return breakingNews.filter(news => news.priority === 'high');
  }, [breakingNews]);

  const getMediumPriorityNews = useCallback(() => {
    return breakingNews.filter(news => news.priority === 'medium');
  }, [breakingNews]);

  // Subscribe to specific category updates
  const subscribeToCategory = useCallback((category, callback) => {
    // This would be implemented with WebSocket subscription to specific category
    // For now, we'll use polling
    const interval = setInterval(async () => {
      try {
        const response = await newsService.getNewsByCategory(category, 1, 10);
        if (response && response.success) {
          callback(response.data);
        }
      } catch (err) {
        console.error(`Error fetching ${category} updates:`, err);
      }
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return {
    // State
    breakingNews,
    latestNews,
    isConnected,
    lastUpdate,
    error,
    isLoading,
    
    // Actions
    refreshNews,
    retryConnection,
    getNewsByCategory,
    searchNews,
    getArticle,
    getTrendingNews,
    subscribeToCategory,
    
    // Computed values
    getLastUpdateText,
    getBreakingNewsCount,
    hasNewBreakingNews,
    getHighPriorityNews,
    getMediumPriorityNews,
    
    // Connection status
    connectionStatus: {
      isConnected,
      lastUpdate: getLastUpdateText(),
      error,
      isLoading
    }
  };
};

/**
 * Hook for breaking news ticker
 * Provides auto-scrolling breaking news with pause/resume functionality
 */
export const useBreakingNewsTicker = (news = [], autoScroll = true, scrollSpeed = 15) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  const intervalRef = useRef(null);

  // Auto-scroll effect
  useEffect(() => {
    if (!autoScroll || isPaused || news.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % news.length);
    }, scrollSpeed * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoScroll, isPaused, news.length, scrollSpeed]);

  // Pause/resume functions
  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Show/hide functions
  const show = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  // Manual navigation
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % news.length);
  }, [news.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + news.length) % news.length);
  }, [news.length]);

  const goToIndex = useCallback((index) => {
    if (index >= 0 && index < news.length) {
      setCurrentIndex(index);
    }
  }, [news.length]);

  return {
    // State
    currentIndex,
    currentNews: news[currentIndex] || null,
    isPaused,
    isVisible,
    
    // Actions
    pause,
    resume,
    togglePause,
    show,
    hide,
    toggleVisibility,
    goToNext,
    goToPrevious,
    goToIndex,
    
    // Computed values
    totalNews: news.length,
    hasNews: news.length > 0,
    progress: news.length > 0 ? ((currentIndex + 1) / news.length) * 100 : 0
  };
};

/**
 * Hook for news notifications
 * Provides browser notifications for breaking news
 */
export const useNewsNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isEnabled, setIsEnabled] = useState(false);

  // Check browser support
  useEffect(() => {
    setIsSupported('Notification' in window);
  }, []);

  // Check permission status
  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Notifications not supported');
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setIsEnabled(result === 'granted');
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }, [isSupported]);

  // Show notification
  const showNotification = useCallback((title, options = {}) => {
    if (!isSupported || permission !== 'granted') {
      return null;
    }

    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'news-notification',
      requireInteraction: false,
      silent: false,
      ...options
    };

    return new Notification(title, defaultOptions);
  }, [isSupported, permission]);

  // Show breaking news notification
  const showBreakingNewsNotification = useCallback((news) => {
    if (!news || !news.title) return;

    return showNotification('🚨 ব্রেকিং নিউজ', {
      body: news.title,
      icon: '/breaking-news-icon.png',
      tag: `breaking-news-${news.id}`,
      requireInteraction: true,
      actions: [
        {
          action: 'read',
          title: 'পড়ুন'
        },
        {
          action: 'dismiss',
          title: 'বাতিল করুন'
        }
      ]
    });
  }, [showNotification]);

  return {
    // State
    isSupported,
    permission,
    isEnabled,
    
    // Actions
    requestPermission,
    showNotification,
    showBreakingNewsNotification
  };
}; 