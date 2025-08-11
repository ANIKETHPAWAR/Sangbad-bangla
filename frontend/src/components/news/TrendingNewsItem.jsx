import React from 'react';
import { Link } from 'react-router-dom';
import './TrendingNewsItem.css';

const TrendingNewsItem = ({ 
  id,
  imageUrl, 
  title, 
  subtitle,
  category,
  publishDate,
  author,
  readTime,
  isNew = false,
  isBreaking = false,
  onClick 
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'এখনই';
    } else if (diffInHours < 24) {
      return `${diffInHours} ঘণ্টা আগে`;
    } else {
      return date.toLocaleDateString('bn-BD', {
        day: '2-digit',
        month: 'short'
      });
    }
  };

  return (
    <article className="trending-news-item" onClick={handleClick}>
      <Link to={`/news/${id}`} className="trending-news-link">
        <div className="trending-news-image-container">
          <img 
            src={imageUrl} 
            alt={title}
            className="trending-news-image"
            loading="lazy"
          />
          {isBreaking && (
            <div className="breaking-news-badge">
              <span>ব্রেকিং নিউজ</span>
            </div>
          )}
          {isNew && !isBreaking && (
            <div className="new-badge">
              <span>নতুন</span>
            </div>
          )}
        </div>
        
        <div className="trending-news-content">
          <div className="trending-news-meta">
            {category && (
              <span className="trending-category">
                {category}
              </span>
            )}
            <span className="trending-date">
              {formatDate(publishDate)}
            </span>
          </div>
          
          <h3 className="trending-news-title">
            {title}
          </h3>
          {subtitle && (
            <p className="trending-news-subtitle">
              {subtitle}
            </p>
          )}
          <div className="trending-news-footer">
            {author && (
              <span className="trending-author">
                {author}
              </span>
            )}
            {readTime && (
              <span className="trending-read-time">
                {readTime} মিনিট পড়া
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
};

export default TrendingNewsItem; 