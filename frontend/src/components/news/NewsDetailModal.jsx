import React, { useState, useEffect } from 'react';
import { FiX, FiClock, FiArrowLeft, FiExternalLink } from 'react-icons/fi';
import './NewsDetailModal.css';

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

const NewsDetailModal = ({ 
  news, 
  isOpen, 
  onClose, 
  onBack 
}) => {
  const [articleContent, setArticleContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && news?.detailUrl) {
      fetchArticleContent();
    }
  }, [isOpen, news]);

  const fetchArticleContent = async () => {
    if (!news?.detailUrl) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from the detail URL
      const response = await fetch(news.detailUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch article content');
      }
      
      const html = await response.text();
      
      // Extract the main content from the HTML
      const content = extractArticleContent(html);
      setArticleContent(content);
      
    } catch (error) {
      console.error('Error fetching article content:', error);
      setError('খবরের বিস্তারিত লোড করতে সমস্যা হয়েছে।');
      // Fallback to showing the excerpt
      setArticleContent(news.excerpt || 'কোন বিস্তারিত পাওয়া যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  const extractArticleContent = (html) => {
    try {
      // Create a temporary DOM element to parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Try to find article content in common selectors
      const selectors = [
        'article',
        '.article-content',
        '.story-content',
        '.post-content',
        '.entry-content',
        '.content-body',
        '.article-body',
        '.story-body'
      ];
      
      let content = '';
      
      for (const selector of selectors) {
        const element = doc.querySelector(selector);
        if (element) {
          content = element.textContent || element.innerText;
          break;
        }
      }
      
      // If no specific content found, try to get paragraphs
      if (!content) {
        const paragraphs = doc.querySelectorAll('p');
        content = Array.from(paragraphs)
          .map(p => p.textContent)
          .filter(text => text.length > 50) // Filter out short paragraphs
          .join('\n\n');
      }
      
      // Clean up the content
      content = content
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
      
      return content || 'কোন বিস্তারিত পাওয়া যায়নি।';
      
    } catch (error) {
      console.error('Error parsing HTML:', error);
      return 'কোন বিস্তারিত পাওয়া যায়নি।';
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

  const handleExternalLink = () => {
    if (news?.websiteUrl) {
      window.open(news.websiteUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="news-detail-modal-overlay" onClick={onClose}>
      <div className="news-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <button onClick={onBack} className="back-button">
            <FiArrowLeft /> ফিরে যান
          </button>
          <button onClick={onClose} className="close-button">
            <FiX />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {news && (
            <>
              {/* Article Header */}
              <div className="article-header">
                <h1 className="article-title">{news.title}</h1>
                
                {news.subtitle && news.subtitle !== news.title && (
                  <h2 className="article-subtitle">
                    {news.subtitle.includes('<') ? (
                      <span dangerouslySetInnerHTML={{ __html: sanitizeHTML(news.subtitle) }} />
                    ) : (
                      news.subtitle
                    )}
                  </h2>
                )}
                
                <div className="article-meta">
                  <span className="article-date">
                    {formatDate(news.publishDate)}
                  </span>
                  {news.readTime && (
                    <span className="article-read-time">
                      <FiClock /> {news.readTime} মিনিট পড়া
                    </span>
                  )}
                </div>
              </div>

              {/* Featured Image */}
              {news.imageUrl && (
                <div className="article-image-container">
                  <img 
                    src={news.imageUrl} 
                    alt={news.title}
                    className="article-image"
                    onError={(e) => {
                      e.target.src = `https://picsum.photos/800/400?random=${Math.random()}`;
                    }}
                  />
                </div>
              )}

              {/* Article Content */}
              <div className="article-content">
                {loading ? (
                  <div className="content-loading">
                    <div className="loading-spinner"></div>
                    <p>খবরের বিস্তারিত লোড হচ্ছে...</p>
                  </div>
                ) : error ? (
                  <div className="content-error">
                    <p>{error}</p>
                    <button onClick={fetchArticleContent} className="retry-button">
                      আবার চেষ্টা করুন
                    </button>
                  </div>
                ) : (
                  <div className="content-text">
                    {articleContent.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="article-paragraph">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* External Link Button */}
              {news.websiteUrl && (
                <div className="external-link-section">
                  <button onClick={handleExternalLink} className="external-link-button">
                    <FiExternalLink /> মূল ওয়েবসাইটে পড়ুন
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsDetailModal;
