import React, { useState, useEffect, useCallback } from 'react';
import { FiHome, FiPlus, FiRefreshCw } from 'react-icons/fi';
import NewsCard from './NewsCard';
import SectionTitle from './SectionTitle';
import TrendingNewsSidebar from './TrendingNewsSidebar';
import { NEWS_REFRESH_INTERVAL, UI_CONSTANTS } from '../../config/constants';

import newsDataService from '../../services/newsDataService';
import './NewsContainer.css';

const NewsContainer = () => {
  const [featuredNews, setFeaturedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newsCount, setNewsCount] = useState(UI_CONSTANTS.INITIAL_NEWS_COUNT);
  const [refreshInterval] = useState(NEWS_REFRESH_INTERVAL); // 5 minutes default - fixed for production
  const [showNewContentNotification, setShowNewContentNotification] = useState(false);
  const [newContentCount, setNewContentCount] = useState(0);

  // Load news data from service
  const loadNewsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load featured news data
      const featuredData = await newsDataService.getFeaturedNews();
      
      // Check for new content
      const hasNewContent = checkForNewContent(featuredData);
      if (hasNewContent.newContent) {
        setShowNewContentNotification(true);
        setNewContentCount(hasNewContent.count);
        
        // Auto-hide notification after 10 seconds
        setTimeout(() => {
          setShowNewContentNotification(false);
        }, UI_CONSTANTS.NOTIFICATION_AUTO_HIDE_DELAY);
      }
      
      setFeaturedNews(featuredData);
    } catch (error) {
      console.error('Error loading news data:', error);
      setError('খবর লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  }, [refreshInterval]);

  // Auto-refresh functionality - always enabled in production
  useEffect(() => {
    loadNewsData();
    
    const interval = setInterval(() => {
      loadNewsData();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [loadNewsData, refreshInterval]);



  const handleLoadMore = async () => {
    try {
      setLoading(true);
      const newCount = newsCount + UI_CONSTANTS.LOAD_MORE_INCREMENT;
      setNewsCount(newCount);
      
      // Fetch more news
      const moreNews = await newsDataService.getFeaturedNews();
      setFeaturedNews(moreNews);
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
    console.log('News clicked:', newsId);
  };

  const dismissNotification = () => {
    setShowNewContentNotification(false);
  };



  if (loading && featuredNews.length === 0) {
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
              title="সর্বশেষ খবর" 
              subtitle="আজকের গুরুত্বপূর্ণ এবং জনপ্রিয় খবর"
              icon={<FiHome />}
              variant="large"
              align="center"
            />
          </div>
          
          {featuredNews.length > 0 ? (
            <>
              <div className="featured-news-grid">
                                 {featuredNews.slice(0, newsCount).map((news) => (
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
              
              {featuredNews.length > newsCount && (
                <div className="load-more-container">
                  <button onClick={handleLoadMore} className="load-more-button">
                    <FiPlus /> আরও খবর দেখুন
                  </button>
                </div>
              )}
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