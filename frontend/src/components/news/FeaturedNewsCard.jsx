import React from 'react';
import { Link } from 'react-router-dom';
import './FeaturedNewsCard.css';

const FeaturedNewsCard = ({ 
  id,
  imageUrl, 
  title, 
  subtitle, 
  excerpt, 
  publishDate, 
  category,
  author,
  readTime,
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
    return date.toLocaleDateString('bn-BD', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <article className="featured-news-card" onClick={handleClick}>
      <Link to={`/news/${id}`} className="featured-news-link">
        <div className="featured-news-image-container">
          <img 
            src={imageUrl} 
            alt={title}
            className="featured-news-image"
            loading="lazy"
          />
          {isBreaking && (
            <div className="breaking-news-badge">
              <span>ব্রেকিং নিউজ</span>
            </div>
          )}
          {category && (
            <div className="category-badge">
              <span>{category}</span>
            </div>
          )}
        </div>
        
        <div className="featured-news-content">
          <div className="featured-news-meta">
            <span className="publish-date">
              {formatDate(publishDate)}
            </span>
            {readTime && (
              <span className="read-time">
                {readTime} মিনিট পড়া
              </span>
            )}
          </div>
          
          <h2 className="featured-news-title">
            {title}
          </h2>
          
          {subtitle && (
            <h3 className="featured-news-subtitle">
              {subtitle}
            </h3>
          )}
          
          {excerpt && (
            <p className="featured-news-excerpt">
              {excerpt}
            </p>
          )}
          
          {author && (
            <div className="featured-news-author">
              <span>লেখক: {author}</span>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
};

export default FeaturedNewsCard; 