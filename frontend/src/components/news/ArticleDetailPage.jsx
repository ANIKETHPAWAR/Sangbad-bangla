import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiClock, FiUser, FiExternalLink } from 'react-icons/fi';
import newsDataService from '../../services/newsDataService';
import TrendingNewsSidebar from './TrendingNewsSidebar';
import './ArticleDetailPage.css';

const ArticleDetailPage = () => {
  const { sectionName, numberOfStories = 10 } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sectionName) {
      loadDetailedArticles();
    }
  }, [sectionName, numberOfStories]);

  const loadDetailedArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const detailedArticles = await newsDataService.getDetailedArticle(sectionName, numberOfStories);
      setArticles(detailedArticles);
    } catch (error) {
      console.error('Error loading detailed articles:', error);
      setError('বিস্তারিত খবর লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleExternalLink = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bn-BD', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="article-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>বিস্তারিত খবর লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="article-detail-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p className="error-message">{error}</p>
          <button onClick={loadDetailedArticles} className="retry-button">
            আবার চেষ্টা করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="article-detail-page">
      <div className="article-main-content">
        {/* Articles Grid */}
        <div className="articles-grid">
        {articles.map((article) => (
          <article key={article.id} className="article-card">
            {/* Article Image */}
            {article.imageUrl && (
              <div className="article-image-container">
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  className="article-image"
                  onError={(e) => {
                    e.target.src = `https://picsum.photos/600/400?random=${Math.random()}`;
                  }}
                />
              </div>
            )}

            {/* Article Content */}
            <div className="article-content">
              <h2 className="article-title">{article.title}</h2>
              
              {article.subtitle && article.subtitle !== article.title && (
                <h3 className="article-subtitle">{article.subtitle}</h3>
              )}

              {article.excerpt && (
                <p className="article-excerpt">{article.excerpt}</p>
              )}

              {/* Article Meta */}
              <div className="article-meta">
                {article.authorName && (
                  <span className="article-author">
                    <FiUser /> {article.authorName}
                  </span>
                )}
                
                {article.publishDate && (
                  <span className="article-date">
                    {formatDate(article.publishDate)}
                  </span>
                )}
                
                {article.readTime && (
                  <span className="article-read-time">
                    <FiClock /> {article.readTime} মিনিট পড়া
                  </span>
                )}
              </div>

              {/* Article Content */}
              {article.content && (
                <div className="article-body">
                  <div 
                    className="article-text"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </div>
              )}

              {/* External Link */}
              {article.websiteUrl && (
                <div className="external-link-section">
                  <button 
                    onClick={() => handleExternalLink(article.websiteUrl)}
                    className="external-link-button"
                  >
                    <FiExternalLink /> মূল ওয়েবসাইটে পড়ুন
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* No Articles Message */}
      {articles.length === 0 && !loading && (
        <div className="no-articles-message">
          <p>এই বিভাগে কোন খবর পাওয়া যায়নি</p>
        </div>
      )}
      </div>

      {/* Trending News Sidebar */}
      <TrendingNewsSidebar />
    </div>
  );
};

export default ArticleDetailPage;
