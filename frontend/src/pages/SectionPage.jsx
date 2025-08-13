import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import newsDataService from '../services/newsDataService';
import NewsCard from '../components/news/NewsCard';
import SectionTitle from '../components/news/SectionTitle';
import './SectionPage.css';

const SectionPage = () => {
  const { sectionName, numStories } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSectionNews();
  }, [sectionName, numStories]);

  const fetchSectionNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 Fetching news for section: ${sectionName}, count: ${numStories}`);
      
      // Use the section feed API
      const sectionNews = await newsDataService.getNewsByCategory(sectionName);
      
      if (sectionNews && sectionNews.length > 0) {
        setNews(sectionNews);
        console.log(`✅ Loaded ${sectionNews.length} news items for section: ${sectionName}`);
      } else {
        setError(`No news found for section: ${sectionName}`);
        console.warn(`⚠️ No news found for section: ${sectionName}`);
      }
    } catch (error) {
      console.error(`❌ Error fetching section news:`, error);
      setError(`Failed to load news for section: ${sectionName}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchSectionNews();
  };

  const handleBack = () => {
    navigate('/');
  };

  // Get Bengali section name mapping
  const getBengaliSectionName = (section) => {
    const sectionMap = {
      'entertainment': 'বিনোদন',
      'sports': 'খেলাধুলা',
      'politics': 'রাজনীতি',
      'business': 'ব্যবসা',
      'technology': 'প্রযুক্তি',
      'health': 'স্বাস্থ্য',
      'education': 'শিক্ষা',
      'crime': 'অপরাধ',
      'international': 'আন্তর্জাতিক',
      'national': 'জাতীয়',
      'cricket': 'ক্রিকেট',
      'football': 'ফুটবল'
    };
    return sectionMap[section] || section;
  };

  if (loading) {
    return (
      <div className="section-page">
        <div className="section-header">
          <button onClick={handleBack} className="back-button">
            <FiArrowLeft /> ফিরে যান
          </button>
          <SectionTitle 
            title={getBengaliSectionName(sectionName)}
            subtitle={`${sectionName} বিভাগের সর্বশেষ খবর`}
            variant="large"
            align="center"
          />
        </div>
        <div className="loading-container">
          <FiRefreshCw className="loading-spinner" />
          <p>খবর লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-page">
        <div className="section-header">
          <button onClick={handleBack} className="back-button">
            <FiArrowLeft /> ফিরে যান
          </button>
          <SectionTitle 
            title={getBengaliSectionName(sectionName)}
            subtitle={`${sectionName} বিভাগের সর্বশেষ খবর`}
            variant="large"
            align="center"
          />
        </div>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-message">
            {error}
          </div>
          <button onClick={handleRetry} className="retry-button">
            আবার চেষ্টা করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="section-page">
      <div className="section-header">
        <button onClick={handleBack} className="back-button">
          <FiArrowLeft /> ফিরে যান
        </button>
        <SectionTitle 
          title={getBengaliSectionName(sectionName)}
          subtitle={`${sectionName} বিভাগের সর্বশেষ খবর`}
          variant="large"
          align="center"
        />
      </div>
      
      <div className="section-content">
        <div className="news-grid">
          {news.map((item) => (
            <NewsCard
              key={item.id}
              {...item}
              variant="featured"
            />
          ))}
        </div>
        
        {news.length === 0 && (
          <div className="no-news">
            <p>এই বিভাগে কোনো খবর পাওয়া যায়নি।</p>
            <button onClick={handleBack} className="back-home-button">
              মূল পৃষ্ঠায় ফিরে যান
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionPage;
