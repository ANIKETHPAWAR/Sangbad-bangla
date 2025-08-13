import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import './NewsCard.css';

// Simple HTML sanitization function
const sanitizeHTML = (html) => {
  if (!html || typeof html !== 'string') return html;
  
  // Only allow safe HTML tags
  const allowedTags = ['b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'p', 'br'];
  const allowedAttributes = ['class'];
  
  // Create a temporary div to parse and clean HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Remove any script tags and other dangerous elements
  const scripts = tempDiv.querySelectorAll('script, iframe, object, embed, form, input, button, select, textarea');
  scripts.forEach(el => el.remove());
  
  // Remove any elements with dangerous attributes
  const dangerousElements = tempDiv.querySelectorAll('*');
  dangerousElements.forEach(el => {
    const attributes = el.attributes;
    for (let i = attributes.length - 1; i >= 0; i--) {
      const attr = attributes[i];
      if (!allowedAttributes.includes(attr.name) || attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    }
  });
  
  return tempDiv.innerHTML;
};

const NewsCard = ({ 
  id,
  imageUrl, 
  title, 
  excerpt, 
  publishDate, 
  readTime,
  detailUrl,
  websiteUrl,
  sectionName,
  category,
  variant = 'default', // 'default', 'featured', 'trending'
  isNew = false,
  onClick,
  onReadMore 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      if (variant === 'trending') {
        // For trending news, show relative time
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
      } else {
        // For featured news, show full date
        return date.toLocaleDateString('bn-BD', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const handleReadMore = (e) => {
    e.stopPropagation();
    
    // Use sectionName if available, otherwise fallback to category
    const sectionToUse = sectionName && sectionName.trim() !== '' ? sectionName : category;
    
    if (sectionToUse && sectionToUse.trim() !== '') {
      navigate(`/section/${sectionToUse}/10`);
    } else {
      // Fallback to generic article page
      navigate(`/article/${id}`);
    }
  };

  const isFeatured = variant === 'featured';
  const isTrending = variant === 'trending';

  return (
    <article 
      className={`news-card ${variant}`} 
      onClick={handleClick}
    >
      <div className="news-image-container">
        <img 
          src={imageUrl} 
          alt={title}
          className="news-image"
          loading="lazy"
          onError={(e) => {
            const fallbackUrl = isFeatured 
              ? `https://picsum.photos/600/338?random=${Math.random()}`
              : `https://picsum.photos/250/250?random=${Math.random()}`;
            e.target.src = fallbackUrl;
          }}
        />
        
        {isNew && (
          <div className="new-badge">
            <span>নতুন</span>
          </div>
        )}
      </div>
      
      <div className="news-content">
        <div className="news-meta">
          <span className="publish-date">
            {formatDate(publishDate)}
          </span>
          {readTime && (
            <span className="read-time">
              {readTime} মিনিট পড়া
            </span>
          )}
        </div>
        
        <h3 className="news-title">
          {title}
        </h3>
        
        {excerpt && isFeatured && (
          <p className="news-excerpt">
            {excerpt.includes('<') ? (
              <span dangerouslySetInnerHTML={{ __html: sanitizeHTML(excerpt) }} />
            ) : (
              excerpt
            )}
          </p>
        )}
        
        <button 
          onClick={handleReadMore}
          className="read-more-button"
        >
          আরও পড়ুন <FiArrowRight />
        </button>
      </div>
    </article>
  );
};

export default NewsCard;
