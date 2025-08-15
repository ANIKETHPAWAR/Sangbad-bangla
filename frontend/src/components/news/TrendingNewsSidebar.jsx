import React, { useState, useEffect, useCallback } from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import NewsCard from './NewsCard';
import SectionTitle from './SectionTitle';
import newsDataService from '../../services/newsDataService';
import { NEWS_REFRESH_INTERVAL, TRENDING_NEWS_ROTATION_INTERVAL } from '../../config/constants';
import './TrendingNewsSidebar.css';

const TrendingNewsSidebar = () => {
  const [trendingNews, setTrendingNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval] = useState(NEWS_REFRESH_INTERVAL); // 2 minutes default - same as featured news
  const [rotationIndex, setRotationIndex] = useState(0); // For rotating trending news

  // Load trending news data from service
  const loadTrendingNews = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setLoading(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Use rotation system for more variety
      const data = await newsDataService.getTrendingNewsSet(rotationIndex);
      setTrendingNews(data);
    } catch (err) {
      console.error('Error loading trending news:', err);
      setError('ট্রেন্ডিং খবর লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  }, [rotationIndex]);

  // Auto-refresh functionality - always enabled in production
  useEffect(() => {
    loadTrendingNews();
    
    const interval = setInterval(() => {
      loadTrendingNews(true); // Pass true to indicate it's a refresh
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [loadTrendingNews, refreshInterval]);

  // Rotation effect for trending news - show different content more frequently
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setRotationIndex(prev => (prev + 1) % 3); // Rotate between 3 different sets
    }, TRENDING_NEWS_ROTATION_INTERVAL);
    
    return () => clearInterval(rotationInterval);
  }, []);

  const handleNewsClick = (newsId) => {
    // Handle news click - navigate to detail page or open modal
    console.log('News clicked:', newsId);
  };



  if (loading) {
    return (
      <aside className="trending-news-sidebar">
        <div className="trending-header">
          <SectionTitle 
            title="ট্রেন্ডিং খবর" 
            
            icon={<FiTrendingUp />}
            variant="large"
            align="center"
            showBorder={true}
            showDecorativeLines={true}
          />
        </div>
        <div className="trending-loading">
          <div className="loading-spinner"></div>
          <p>ট্রেন্ডিং খবর লোড হচ্ছে...</p>
        </div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="trending-news-sidebar">
        <div className="trending-header">
          <SectionTitle 
            title="ট্রেন্ডিং খবর" 
           
            icon={<FiTrendingUp />}
            variant="large"
            align="center"
            showBorder={true}
            showDecorativeLines={true}
          />
        </div>
        <div className="trending-error">
          <p>{error}</p>
        </div>
      </aside>
    );
  }

             return (
       <aside className="trending-news-sidebar">
              <div className="trending-header">
          <SectionTitle 
            title="ট্রেন্ডিং খবর" 
           
            icon={<FiTrendingUp />}
            variant="large"
            align="center"
            showBorder={true}
            showDecorativeLines={true}
          />
        </div>
      
      
      {trendingNews.length > 0 ? (
        <div className="trending-news-list">
          {trendingNews.map((news) => (
            <NewsCard
              key={news.id}
              {...news}
              variant="trending"
              onClick={handleNewsClick}
              sectionName={news.sectionName}
              category={news.category}
            />
          ))}
        </div>
      ) : (
        <div className="no-trending-news">
          <p>কোন ট্রেন্ডিং খবর নেই</p>
        </div>
      )}
    </aside>
  );
};

export default TrendingNewsSidebar;
