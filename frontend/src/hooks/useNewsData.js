import { useState, useEffect, useCallback } from 'react';

export const useNewsData = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize news data
  const initializeNews = useCallback(async () => {
    try {
      setIsLoading(true);
      // Simulate connection check
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsConnected(true);
      setError(null);
    } catch (err) {
      console.error('Error initializing news:', err);
      setError('Failed to load news');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeNews();
  }, [initializeNews]);

  return {
    isConnected,
    error,
    isLoading,
    refreshNews: initializeNews
  };
}; 