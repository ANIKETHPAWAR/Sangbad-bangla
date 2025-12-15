import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { FiHome, FiPlus, FiRefreshCw } from 'react-icons/fi';
import NewsCard from './NewsCard';
import SectionTitle from './SectionTitle';
import TrendingNewsSidebar from './TrendingNewsSidebar';
import { NEWS_REFRESH_INTERVAL, UI_CONSTANTS } from '../../config/constants';

import newsDataService from '../../services/newsDataService';
import './NewsContainer.css';

const debug = (...args) => {
  if (import.meta.env?.MODE === 'development') {
    console.log(...args);
  }
};

const NewsContainer = () => {
  const location = useLocation();
  const [featuredNews, setFeaturedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [refreshInterval] = useState(NEWS_REFRESH_INTERVAL); // 5 minutes default - fixed for production
  const [showNewContentNotification, setShowNewContentNotification] = useState(false);
  const [newContentCount, setNewContentCount] = useState(0);
  const [newsCount, setNewsCount] = useState(UI_CONSTANTS.INITIAL_NEWS_COUNT);

  // Determine if this is the popular news page
  const isPopularNews = location.pathname === '/popular';
  // Determine if this is the homepage or all-news page
  const isHomePage = location.pathname === '/';
  const isAllNewsPage = location.pathname === '/all-news';
  const showHomeIcon = isHomePage || isAllNewsPage;

  // Load news data from service
  const loadNewsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load news data based on route
      let combinedData;
      if (isPopularNews) {
        // Use popular news with rotation for different content
        combinedData = await newsDataService.getPopularNews(1, 20);
        debug('🔥 Loaded popular news with rotation');
      } else {
        // Use regular combined news for all other routes
        combinedData = await newsDataService.getCombinedNews(1, 20);
        debug('📰 Loaded regular combined news');
      }
      
      // Check for new content only if we have news
      if (combinedData.news && combinedData.news.length > 0) {
        const hasNewContent = checkForNewContent(combinedData.news);
        if (hasNewContent.newContent) {
          setShowNewContentNotification(true);
          setNewContentCount(hasNewContent.count);
          
          // Auto-hide notification after 10 seconds
          setTimeout(() => {
            setShowNewContentNotification(false);
          }, UI_CONSTANTS.NOTIFICATION_AUTO_HIDE_DELAY);
        }
      }
      
      setFeaturedNews(combinedData.news || []);
    } catch (error) {
      console.error('Error loading news data:', error);
      // Only show error if we have no cached data
      if (featuredNews.length === 0) {
        setError('খবর লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } finally {
      setLoading(false);
    }
  }, [refreshInterval, featuredNews.length, isPopularNews]);

  // Auto-refresh functionality - always enabled in production
  useEffect(() => {
    // Load data immediately on mount
    loadNewsData();
    
    const interval = setInterval(() => {
      loadNewsData();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [loadNewsData, refreshInterval]);

  // Show loading state immediately if no data
  const isLoading = loading || (featuredNews.length === 0 && !error);



  const handleLoadMore = async () => {
    try {
      setLoading(true);
      const newCount = newsCount + UI_CONSTANTS.LOAD_MORE_INCREMENT;
      setNewsCount(newCount);
      
      // Fetch more news based on route
      let moreNews;
      if (isPopularNews) {
        moreNews = await newsDataService.getPopularNews(1, newCount);
        debug('🔥 Loaded more popular news with rotation');
      } else {
        moreNews = await newsDataService.getCombinedNews(1, newCount);
        debug('📰 Loaded more regular combined news');
      }
      
      setFeaturedNews(moreNews.news);
    } catch (error) {
      console.error('Error loading more news:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewContent = (newFeaturedData) => {
    if (featuredNews.length === 0) {
      return { newContent: false, count: 0 };
    }
    
    let newContentCount = 0;
    
    // Check featured news for new content
    newFeaturedData.forEach(newItem => {
      const existingItem = featuredNews.find(item => item.id === newItem.id);
      if (!existingItem) {
        newContentCount++;
      }
    });
    
    return {
      newContent: newContentCount > 0,
      count: newContentCount
    };
  };

  const handleNewsClick = (newsId) => {
    // Handle news click - navigate to detail page or open modal
    // console.log('News clicked:', newsId);
  };

  const dismissNotification = () => {
    setShowNewContentNotification(false);
  };



  if (isLoading) {
    return (
      <div className="news-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>খবর লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error && featuredNews.length === 0) {
    return (
      <div className="news-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p className="error-message">{error}</p>
          <button onClick={loadNewsData} className="retry-button">
            <FiRefreshCw /> আবার চেষ্টা করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="news-container">
      {/* New Content Notification */}
      {showNewContentNotification && (
        <div className="new-content-notification">
          <div className="notification-content">
            <span className="notification-icon">🆕</span>
            <span className="notification-text">
              {newContentCount} টি নতুন খবর পাওয়া গেছে!
            </span>
            <button 
              onClick={dismissNotification} 
              className="notification-dismiss"
              title="বন্ধ করুন"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="news-main-content">
        {/* Featured News Section */}
        <section className="featured-news-section">
          <div className="section-header">
            <SectionTitle 
              title={isPopularNews ? "জনপ্রিয় খবর" : "সর্বশেষ খবর"} 
              subtitle={isPopularNews ? "সর্বাধিক পঠিত এবং আলোচিত খবর" : "আজকের গুরুত্বপূর্ণ এবং জনপ্রিয় খবর"}
              icon={showHomeIcon ? <FiHome /> : null}
              variant="large"
              align="center"
            />
          </div>
          
          {featuredNews.length > 0 ? (
            <>
              <div className="featured-news-grid">
                {featuredNews.map((news) => (
                  <NewsCard
                    key={news.id}
                    {...news}
                    variant="featured"
                    onClick={handleNewsClick}
                    sectionName={news.sectionName}
                    category={news.category}
                  />
                ))}
              </div>
              

            </>
          ) : (
            <div className="no-news-message">
              <p>কোন খবর পাওয়া যায়নি</p>
            </div>
          )}
        </section>
      </div>

            {/* Trending News Sidebar */}
      <TrendingNewsSidebar />
    </div>
  );
};

export default NewsContainer; 