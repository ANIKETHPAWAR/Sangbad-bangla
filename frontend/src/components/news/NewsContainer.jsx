import React, { useState, useEffect } from 'react';
import { FiHome, FiTrendingUp, FiClock } from 'react-icons/fi';
import FeaturedNewsCard from './FeaturedNewsCard';
import TrendingNewsItem from './TrendingNewsItem';
import SectionTitle from './SectionTitle';
import newsDataService from '../../services/newsDataService';
import './NewsContainer.css';

const NewsContainer = () => {
  const [featuredNews, setFeaturedNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load news data from service
  useEffect(() => {
    const loadNewsData = async () => {
      try {
        setLoading(true);
        
        // Load only featured news data
        const featuredData = await newsDataService.getFeaturedNews();
        
        setFeaturedNews(featuredData);
      } catch (error) {
        console.error('Error loading news data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNewsData();
  }, []);

  const handleNewsClick = (newsId) => {
    // Handle news click - navigate to detail page or open modal
  };

  if (loading) {
    return (
      <div className="news-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>খবর লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="news-container">
      <div className="news-main-content">
        {/* Featured News Section */}
        <section className="featured-news-section">
          <SectionTitle 
            title="বাংলা খবর" 
            subtitle="সর্বশেষ এবং গুরুত্বপূর্ণ খবর"
            icon={<FiHome />}
            variant="large"
            align="center"
          />
          
          <div className="featured-news-grid">
            {featuredNews.map((news) => (
              <FeaturedNewsCard
                key={news.id}
                {...news}
                onClick={handleNewsClick}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Trending News Sidebar - Now displays the same data as featured news */}
      <aside className="trending-news-sidebar">
        <SectionTitle 
          title="ট্রেন্ডিং খবর" 
          icon={<FiTrendingUp />}
          variant="vertical"
          showBorder={false}
        />
        
        <div className="trending-news-list">
          {featuredNews.map((news) => (
            <TrendingNewsItem
              key={news.id}
              {...news}
              onClick={handleNewsClick}
            />
          ))}
        </div>
      </aside>
    </div>
  );
};

export default NewsContainer; 