import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiShare2, FiExternalLink } from 'react-icons/fi';
import NewsCard from './NewsCard';
import TrendingNewsSidebar from './TrendingNewsSidebar';
import newsDataService from '../../services/newsDataService';
import './ArticlePage.css';

const ArticlePage = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [similarStories, setSimilarStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [articleContent, setArticleContent] = useState('');

  useEffect(() => {
    if (articleId) {
      loadArticleData();
    }
  }, [articleId]);

  // Debug useEffect to monitor similarStories changes
  useEffect(() => {
    console.log('ArticlePage - similarStories state changed:', {
      similarStories,
      length: similarStories?.length,
      isArray: Array.isArray(similarStories)
    });
  }, [similarStories]);

  const loadArticleData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all news to find the specific article
      const allNewsData = await newsDataService.getCombinedNews(1, 20);
      const allNews = allNewsData.news;
      
      const foundArticle = allNews.find(news => {
        // Handle both string and number ID types
        const newsId = String(news.id);
        const paramId = String(articleId);
        return newsId === paramId;
      });
      
      if (!foundArticle) {
        // Try to fetch more news data to see if we can find the article
        try {
          const moreNewsData = await newsDataService.getCombinedNews(2, 20);
          const moreNews = moreNewsData.news;
          const allNewsCombined = [...allNews, ...moreNews];
          
          const foundInCombined = allNewsCombined.find(news => {
            const newsId = String(news.id);
            const paramId = String(articleId);
            return newsId === paramId;
          });
          
          if (foundInCombined) {
            setArticle(foundInCombined);
            setSimilarStories(allNewsCombined.filter(news => news.id !== articleId).slice(0, 10));
            await fetchArticleContent(foundInCombined);
            return;
          }
        } catch (error) {
          console.error('Error fetching additional news:', error);
        }
        
        throw new Error('Article not found');
      }

      setArticle(foundArticle);
      
      // Load similar stories - try multiple sources to get better content
      let similarStoriesData = [];
      
      // First, try to get stories from the same category
      if (foundArticle.category || foundArticle.sectionName) {
        const categoryToUse = foundArticle.category || foundArticle.sectionName;
        try {
          console.log('Loading similar stories from category:', categoryToUse);
          const sectionStories = await newsDataService.getSectionFeed(categoryToUse, 10);
          if (sectionStories && sectionStories.length > 0) {
            similarStoriesData = sectionStories
              .filter(story => story.id !== articleId)
              .slice(0, 8);
            console.log('Found similar stories from category:', similarStoriesData.length);
          }
        } catch (error) {
          console.error('Error fetching section stories:', error);
        }
      }
      
      // If no category stories, try to get from combined news
      if (similarStoriesData.length === 0) {
        try {
          console.log('Loading similar stories from combined news');
          const moreNewsData = await newsDataService.getCombinedNews(1, 20);
          if (moreNewsData && moreNewsData.news) {
            similarStoriesData = moreNewsData.news
              .filter(story => story.id !== articleId)
              .slice(0, 8);
            console.log('Found similar stories from combined news:', similarStoriesData.length);
          }
        } catch (error) {
          console.error('Error fetching combined news:', error);
        }
      }
      
      // If still no stories, use the current news data
      if (similarStoriesData.length === 0) {
        similarStoriesData = allNews
          .filter(story => story.id !== articleId)
          .slice(0, 8);
        console.log('Using fallback similar stories:', similarStoriesData.length);
      }
      
      // If absolutely no stories, create some sample trending news
      if (similarStoriesData.length === 0) {
        similarStoriesData = [
          {
            id: 'sample-1',
            title: 'সর্বশেষ খবর আপডেট',
            category: 'সাধারণ',
            imageUrl: 'https://picsum.photos/80/80?random=1',
            publishDate: new Date().toISOString()
          },
          {
            id: 'sample-2',
            title: 'আজকের গুরুত্বপূর্ণ খবর',
            category: 'জাতীয়',
            imageUrl: 'https://picsum.photos/80/80?random=2',
            publishDate: new Date().toISOString()
          },
          {
            id: 'sample-3',
            title: 'খেলাধুলার আপডেট',
            category: 'খেলাধুলা',
            imageUrl: 'https://picsum.photos/80/80?random=3',
            publishDate: new Date().toISOString()
          }
        ];
        console.log('Using sample trending news');
      }
      
      setSimilarStories(similarStoriesData);
      
      // Debug logging
      console.log('ArticlePage Debug - Similar Stories:', {
        similarStoriesData,
        length: similarStoriesData.length,
        firstStory: similarStoriesData[0]
      });

      // Try to fetch full article content
      await fetchArticleContent(foundArticle);

    } catch (error) {
      console.error('Error loading article:', error);
      setError('খবর লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticleContent = async (articleData) => {
    try {
      // For internal news (admin-created), use the content directly
      if (articleData.source === 'internal') {
        const content = articleData.content || '';
        setArticleContent(content);
        return;
      }
      
      // For external news (Hindustan Times), fetch from API
      const url = `/api/detailfeed/v1/${articleId}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch article content: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract content from the API response
      let content = '';
      
      if (data.content && Array.isArray(data.content) && data.content.length > 0) {
        const detailFeed = data.content[0]; // The first item contains the article data
        
        // NEW: Check for paragraph.body field which contains the full article
        if (detailFeed.paragraph && detailFeed.paragraph.body) {
          content = detailFeed.paragraph.body;
        }
        // Try to get the main content from bodyText field first
        else if (detailFeed.bodyText && detailFeed.bodyText.trim().length > 50) {
          content = detailFeed.bodyText;
        }
        
        // If no bodyText, try other fields in order of preference
        else if (detailFeed.articleText && detailFeed.articleText.trim().length > 50) {
          content = detailFeed.articleText;
        }
        
        else if (detailFeed.storyText && detailFeed.storyText.trim().length > 50) {
          content = detailFeed.storyText;
        }
 else if (detailFeed.content && detailFeed.content.trim().length > 50) {
          content = detailFeed.content;
        }
        
        // If still no content, try to get from paragraphs array
        else if (detailFeed.paragraphs && Array.isArray(detailFeed.paragraphs) && detailFeed.paragraphs.length > 0) {
          const paragraphTexts = detailFeed.paragraphs
            .map(p => {
              // Handle different paragraph structures
              if (typeof p === 'string') return p;
              if (p && typeof p === 'object') {
                return p.text || p.content || p.paragraph || p.body || '';
              }
              return '';
            })
            .filter(text => text.trim().length > 20);
          
          if (paragraphTexts.length > 0) {
            content = paragraphTexts.join('\n\n');
          }
        }
        
        // If still no content, try to find any field with substantial text
        else {
          const allFields = Object.keys(detailFeed);
          for (const field of allFields) {
            const fieldValue = detailFeed[field];
            if (fieldValue && typeof fieldValue === 'string' && fieldValue.trim().length > 100) {
              // Skip fields that are likely not article content
              if (!['title', 'headline', 'subhead', 'shortDescription', 'excerpt'].includes(field)) {
                content = fieldValue;
                break;
              }
            }
          }
        }
        
        // If we still don't have content, try to extract from the summary field
        if (!content && detailFeed.summary) {
          content = detailFeed.summary;
        }
        
        // If still no content, try to construct from available fields
        if (!content) {
          const availableTexts = [];
          if (detailFeed.headline) availableTexts.push(detailFeed.headline);
          if (detailFeed.summary) availableTexts.push(detailFeed.summary);
          if (detailFeed.description) availableTexts.push(detailFeed.description);
          
          if (availableTexts.length > 0) {
            content = availableTexts.join('\n\n');
          }
        }
        
        // SPECIAL CASE: Check if paragraph.body exists but is null/undefined
        if (!content && detailFeed.paragraph === null) {
          // Try to get content from the main response structure
          if (data.paragraph && data.paragraph.body) {
            content = data.paragraph.body;
          }
        }
        
        // FINAL FALLBACK: Use summary if still no content
        if (!content && detailFeed.summary) {
          content = `সংক্ষিপ্ত বিবরণ:\n\n${detailFeed.summary}`;
        }
      } else {
        // Check if content is directly in the response
        if (data.paragraph && data.paragraph.body) {
          content = data.paragraph.body;
        }
      }
      
      if (content) {
        // Clean up the content - remove HTML entities and format properly
        content = content
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, ' ')
          .replace(/\n\s*\n/g, '\n\n')
          .trim();
        
        setArticleContent(content);
      } else {
        // If no content found, try to fetch from the website URL as fallback
        if (articleData.websiteUrl) {
          try {
            const websiteResponse = await fetch(`/api/website-content?url=${encodeURIComponent(articleData.websiteUrl)}`);
            if (websiteResponse.ok) {
              const websiteData = await websiteResponse.text();
              const extractedContent = extractArticleContent(websiteData);
              setArticleContent(extractedContent);
              return;
            }
          } catch (websiteError) {
            console.error('Error fetching website content:', websiteError);
          }
        }
        
        // Final fallback: use excerpt or show no content message
        if (articleData.excerpt && articleData.excerpt.trim().length > 50) {
          setArticleContent(articleData.excerpt);
        } else {
          setArticleContent('কোন বিস্তারিত পাওয়া যায়নি।');
        }
      }
      
    } catch (error) {
      console.error('Error fetching article content:', error);
      
      // Fallback: use excerpt or show no content message
      if (articleData.excerpt && articleData.excerpt.trim().length > 50) {
        setArticleContent(articleData.excerpt);
      } else {
        setArticleContent('কোন বিস্তারিত পাওয়া যায়নি।');
      }
    }
  };

  const extractArticleContent = (html) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Try to find content in common selectors
      const selectors = [
        // News-specific selectors
        '.article-content',
        '.story-content',
        '.news-content',
        '.post-content',
        '.entry-content',
        // Generic selectors
        'article',
        '.post-body',
        '.entry-body',
        '.article-text',
        '.story-text'
      ];
      
      let content = '';
      
      for (const selector of selectors) {
        const element = doc.querySelector(selector);
        if (element) {
          // Remove script and style elements
          const scripts = element.querySelectorAll('script, style, nav, header, footer, .advertisement, .ads');
          scripts.forEach(script => script.remove());
          
          content = element.textContent || element.innerText;
          break;
        }
      }
      
      // If no specific content found, try to get paragraphs
      if (!content) {
        const paragraphs = doc.querySelectorAll('p');
        content = Array.from(paragraphs)
          .map(p => p.textContent)
          .filter(text => {
            // Filter out short paragraphs, ads, and navigation text
            const cleanText = text.trim();
            return cleanText.length > 50 && 
                   !cleanText.includes('Advertisement') &&
                   !cleanText.includes('advertisement') &&
                   !cleanText.includes('Share') &&
                   !cleanText.includes('share') &&
                   !cleanText.includes('Follow') &&
                   !cleanText.includes('follow');
          })
          .join('\n\n');
      }
      
      // Clean up the content
      content = content
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .replace(/Advertisement/g, '')
        .replace(/advertisement/g, '')
        .replace(/Share this article/g, '')
        .replace(/Follow us/g, '')
        .trim();
      
      return content || 'কোন বিস্তারিত পাওয়া যায়নি।';
      
    } catch (error) {
      console.error('Error parsing HTML:', error);
      return 'কোন বিস্তারিত পাওয়া যায়নি।';
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.excerpt,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('লিংক কপি হয়েছে!');
    }
  };

  const handleExternalLink = () => {
    if (article?.websiteUrl) {
      window.open(article.websiteUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleTestAPI = async () => {
    console.log('Testing API endpoint...');
    console.log('Current article ID from URL:', articleId);
    console.log('Current article data:', article);
    
    try {
      if (!article.detailUrl) {
        console.log('No detailUrl available for testing');
        return;
      }
      
      // Use the same logic as fetchArticleContent
      let proxyPath;
      if (article.detailUrl.startsWith('http')) {
        // Remove the /api/app prefix since our proxy will add it
        const url = new URL(article.detailUrl);
        const pathWithoutApiApp = url.pathname.replace('/api/app', '');
        proxyPath = `/api${pathWithoutApiApp}`;
      } else if (article.detailUrl.startsWith('/')) {
        proxyPath = `/api${article.detailUrl}`;
      } else {
        proxyPath = `/api/app/detailfeed/v1/${article.detailUrl}`;
      }
      
      console.log('Testing proxy path:', proxyPath);
      const testResponse = await fetch(proxyPath);
      console.log('Test response status:', testResponse.status);
      console.log('Test response headers:', testResponse.headers);
      
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('Test API data:', testData);
      } else {
        console.log('Test API failed with status:', testResponse.status);
      }
    } catch (error) {
      console.error('Test API error:', error);
    }
    
    // Also test the working sectionfeed endpoint to see if proxy is working
    try {
      console.log('Testing working sectionfeed endpoint...');
      const sectionResponse = await fetch('/api/sectionfeedperp/v1/nation%20and%20world/10');
      console.log('Sectionfeed response status:', sectionResponse.status);
      if (sectionResponse.ok) {
        console.log('Sectionfeed endpoint is working');
      } else {
        console.log('Sectionfeed endpoint failed');
      }
    } catch (sectionError) {
      console.error('Sectionfeed test error:', sectionError);
    }
  };

  return (
    <div className="article-page">
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>খবর লোড হচ্ছে...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p className="error-message">{error}</p>
          <button onClick={loadArticleData} className="retry-button">
            আবার চেষ্টা করুন
          </button>
        </div>
      ) : article ? (
        <div className="article-page-layout">
          {/* Main Article Content - Left Side */}
          <div className="article-main-content">
            <div className="article-container">
              {/* Back Navigation */}
              <div className="article-back-nav">
                <button onClick={handleBack} className="back-nav-button">
                  ← ফিরে যান
                </button>
              </div>
              
              {/* Article Title with proper spacing */}
              <div className="article-title-section">
                <h1 className="article-title">
                  {article.title}
                </h1>
              </div>

              {/* Article Image */}
              {article.imageUrl && (
                <div className="article-image-container">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title}
                    className="article-image"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = `https://picsum.photos/800/400?random=${Math.random()}`;
                    }}
                  />
                </div>
              )}

              {/* Article Content */}
              <div className="article-content">
                <div className="content-text">
                  {articleContent ? (
                    <div>
                      {/* Display content with proper formatting */}
                      {articleContent.includes('<p>') || articleContent.includes('</p>') ? (
                        // If content contains HTML tags, render as HTML
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: articleContent
                              .replace(/\\n/g, '<br>')
                              .replace(/\n/g, '<br>')
                          }} 
                        />
                      ) : (
                        // If content is plain text, split by paragraphs and render
                        articleContent.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="article-paragraph">
                            {paragraph.trim()}
                          </p>
                        ))
                      )}
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '40px', 
                      textAlign: 'center', 
                      color: '#666',
                      background: '#f8f9fa',
                      borderRadius: '8px'
                    }}>
                      <p>কোন বিস্তারিত পাওয়া যায়নি।</p>
                      <p>API থেকে কন্টেন্ট লোড হচ্ছে...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Article Actions */}
              <div className="article-actions">
                <button onClick={handleShare} className="share-button">
                  <FiShare2 /> শেয়ার করুন
                </button>
                {article.websiteUrl && (
                  <button onClick={handleExternalLink} className="external-link-button">
                    <FiExternalLink /> মূল ওয়েবসাইটে পড়ুন
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Trending News Sidebar - Right Side */}
          <TrendingNewsSidebar similarStories={similarStories} isArticlePage={true} />
        </div>
      ) : null}

      {/* Similar Stories Sidebar */}
      {/* This sidebar is now part of the main article-page-layout */}
    </div>
  );
};

export default ArticlePage;
