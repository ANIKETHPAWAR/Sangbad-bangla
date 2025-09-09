import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  wallpaperLarge,
  mediumRes,
  thumbImage,
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
  onReadMore,
  source // Added source prop
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Build image candidates preferring wallpaperLarge from API
  const imageCandidates = useMemo(() => {
    const list = [wallpaperLarge, mediumRes, thumbImage, imageUrl].filter(Boolean);
    // Remove duplicates while preserving order
    return Array.from(new Set(list));
  }, [wallpaperLarge, mediumRes, thumbImage, imageUrl]);

  const [imgIndex, setImgIndex] = useState(0);
  const currentImgSrc = imageCandidates[imgIndex] || '';
  const isImageEmpty = !currentImgSrc || (typeof currentImgSrc === 'string' && currentImgSrc.trim() === '');

  const handleClick = () => {
    // For trending variant, clicking the entire card should behave like "Read more"
    if (variant === 'trending') {
      handleReadMore();
      return;
    }
    if (onClick) {
      onClick(id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      let date;
      
      // Handle different date formats
      if (dateString instanceof Date) {
        date = dateString;
      } else if (typeof dateString === 'string') {
        // Try to parse the date string
        date = new Date(dateString);
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          console.warn('Invalid date string:', dateString);
          return '';
        }
      } else if (dateString && typeof dateString === 'object' && dateString.toDate) {
        // Handle Firestore timestamp objects
        date = dateString.toDate();
      } else {
        console.warn('Unsupported date format:', dateString);
        return '';
      }
      
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
      console.error('Error formatting date:', error, 'Date string:', dateString);
      return '';
    }
  };

  const handleReadMore = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    
    // For admin-created news (internal source), always go to article detail page
    if (source === 'internal') {
      navigate(`/article/${id}`);
      return;
    }
    
    // Special case: On cricket page, open external website URL directly
    if (location && location.pathname === '/cricket') {
      const targetUrl = websiteUrl ;
      if (targetUrl) {
        try {
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
        } catch (_) {
          window.location.assign(targetUrl);
        }
        return;
      }
    }

    // Default behavior for external news on other pages: navigate to section list
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
        {!isImageEmpty && (
          <img 
            src={currentImgSrc} 
            alt={title}
            className="news-image"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={() => {
              // Try next candidate (mediumRes, then thumbImage). Do not use unrelated placeholders.
              setImgIndex(prev => (prev < imageCandidates.length - 1 ? prev + 1 : prev));
            }}
          />
        )}
        
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
