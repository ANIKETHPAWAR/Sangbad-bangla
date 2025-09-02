import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import NewsCard from './NewsCard';
import SectionTitle from './SectionTitle';
import TrendingNewsSidebar from './TrendingNewsSidebar';
import newsDataService from '../../services/newsDataService';
import { ROUTE_TO_SECTION_KEY } from '../../config/sectionAPIs';
import './NewsContainer.css';

const CategoryNewsPage = ({ sectionKey: propSectionKey, title, subtitle }) => {
  const location = useLocation();
  const resolvedSectionKey = propSectionKey || ROUTE_TO_SECTION_KEY[location.pathname];

  const [featuredNews, setFeaturedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSectionNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Use combined category news (internal Firestore + external HT) with internal-first ordering
      const data = await newsDataService.getCategoryNews(resolvedSectionKey, 15);
      setFeaturedNews(data || []);
    } catch (err) {
      console.error('Error loading section news:', err);
      // Only show error if we have no cached data
      if (featuredNews.length === 0) {
        setError('খবর লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } finally {
      setLoading(false);
    }
  }, [resolvedSectionKey, featuredNews.length]);

  useEffect(() => {
    if (resolvedSectionKey) {
      loadSectionNews();
    }
  }, [resolvedSectionKey, loadSectionNews]);

  const handleNewsClick = () => {};

  // Show loading state immediately if no data
  const isLoading = loading || (featuredNews.length === 0 && !error);

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
        </div>
      </div>
    );
  }

  return (
    <div className="news-container">
      <div className="news-main-content">
        <section className="featured-news-section">
          <div className="section-header">
            <SectionTitle
              title={title || 'সর্বশেষ খবর'}
              subtitle={subtitle || 'আপনার নির্বাচিত বিভাগের খবর'}
              icon={<FiHome />}
              variant="large"
              align="center"
            />
          </div>

          {featuredNews.length > 0 ? (
            <>
              <div className="featured-news-grid">
                {featuredNews.map((news, idx) => {
                  const safeImage = news.wallpaperLarge || news.imageUrl || news.mediumRes || news.thumbImage || '';
                  return (
                    <NewsCard
                      key={news.id || `news-${idx}`}
                      {...news}
                      imageUrl={safeImage}
                      variant="featured"
                      onClick={handleNewsClick}
                      sectionName={news.sectionName}
                      category={news.category}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <div className="no-news-message">
              <p>কোন খবর পাওয়া যায়নি</p>
            </div>
          )}
        </section>
      </div>

      <TrendingNewsSidebar />
    </div>
  );
};

export default CategoryNewsPage;


