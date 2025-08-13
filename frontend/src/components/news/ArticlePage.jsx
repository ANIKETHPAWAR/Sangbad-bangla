import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiShare2, FiExternalLink } from 'react-icons/fi';
import NewsCard from './NewsCard';
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
      console.log('=== ARTICLE PAGE MOUNTED ===');
      console.log('Article ID from params:', articleId);
      console.log('Article ID type:', typeof articleId);
      loadArticleData();
    }
  }, [articleId]);

  const loadArticleData = async () => {
    try {
      console.log('=== LOADING ARTICLE DATA ===');
      setLoading(true);
      setError(null);

      // Fetch all news to find the specific article
      console.log('Fetching all news to find article with ID:', articleId);
      const allNews = await newsDataService.getFeaturedNews();
      console.log('All news data received:', allNews);
      console.log('Looking for article ID:', articleId);
      
      const foundArticle = allNews.find(news => {
        // Handle both string and number ID types
        const newsId = String(news.id);
        const paramId = String(articleId);
        const match = newsId === paramId;
        console.log(`Comparing: news.id (${newsId}, type: ${typeof news.id}) === articleId (${paramId}, type: ${typeof articleId}) = ${match}`);
        return match;
      });
      console.log('Found article:', foundArticle);
      
      if (!foundArticle) {
        console.error('❌ Article not found in news data');
        console.log('Available article IDs:', allNews.map(n => n.id));
        
        // Try to fetch more news data to see if we can find the article
        console.log('Trying to fetch more news data...');
        try {
          const moreNews = await newsDataService.getTrendingNews();
          const allNewsCombined = [...allNews, ...moreNews];
          console.log('Combined news data:', allNewsCombined);
          
          const foundInCombined = allNewsCombined.find(news => {
            const newsId = String(news.id);
            const paramId = String(articleId);
            const match = newsId === paramId;
            console.log(`Comparing in combined: news.id (${newsId}) === articleId (${paramId}) = ${match}`);
            return match;
          });
          
          if (foundInCombined) {
            console.log('✅ Article found in combined news data');
            setArticle(foundInCombined);
            setSimilarStories(allNewsCombined.filter(news => news.id !== articleId).slice(0, 6));
            await fetchArticleContent(foundInCombined);
            return;
          }
        } catch (error) {
          console.error('Error fetching additional news:', error);
        }
        
        throw new Error('Article not found');
      }

      console.log('✅ Article found, setting state...');
      setArticle(foundArticle);
      
      // Load similar stories using section feed API if section name is available
      if (foundArticle.sectionName) {
        console.log('Fetching similar stories from section:', foundArticle.sectionName);
        try {
          const sectionStories = await newsDataService.getSectionFeed(foundArticle.sectionName, 10);
          const similar = sectionStories
            .filter(news => news.id !== articleId)
            .slice(0, 6);
          setSimilarStories(similar);
          console.log('Loaded similar stories from section feed:', similar.length);
        } catch (error) {
          console.error('Error fetching section stories, using fallback:', error);
          // Fallback to regular news filtering
          const similar = allNews
            .filter(news => news.id !== articleId)
            .slice(0, 6);
          setSimilarStories(similar);
        }
      } else {
        // Fallback: load similar stories from the same news source
        const similar = allNews
          .filter(news => news.id !== articleId)
          .slice(0, 6);
        setSimilarStories(similar);
      }

      // Try to fetch full article content
      console.log('Fetching full article content...');
      await fetchArticleContent(foundArticle);

    } catch (error) {
      console.error('❌ Error loading article:', error);
      setError('খবর লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticleContent = async (articleData) => {
    try {
      console.log('=== FETCHING ARTICLE CONTENT ===');
      console.log('Article ID from params:', articleId);
      console.log('Article data:', articleData);
      console.log('Article detailUrl:', articleData.detailUrl);
      
      // Use the article ID directly to construct the detailfeed API endpoint
      const url = `/api/detailfeed/v1/${articleId}`;
      console.log('Constructed API URL:', url);
      console.log('This will be proxied to: https://bangla.hindustantimes.com/api/app/detailfeed/v1/' + articleId);
      
      console.log('Making fetch request...');
      const response = await fetch(url);
      console.log('Response received:', response);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch article content: ${response.status} ${response.statusText}`);
      }
      
      console.log('Parsing JSON response...');
      const data = await response.json();
      console.log('=== API RESPONSE DATA ===');
      console.log('Full response:', data);
      console.log('Content structure:', data.content);
      console.log('Content type:', typeof data.content);
      console.log('Content length:', data.content ? data.content.length : 'undefined');
      
      // Extract content from the API response
      let content = '';
      
      if (data.content && Array.isArray(data.content) && data.content.length > 0) {
        const detailFeed = data.content[0]; // The first item contains the article data
        console.log('=== DETAIL FEED OBJECT ===');
        console.log('Detail feed object:', detailFeed);
        console.log('Available fields:', Object.keys(detailFeed));
        
        // Try to get the main content from various possible fields
        // Check each field and log what we find
        console.log('=== CHECKING CONTENT FIELDS ===');
        console.log('bodyText:', detailFeed.bodyText);
        console.log('summary:', detailFeed.summary);
        console.log('description:', detailFeed.description);
        console.log('content:', detailFeed.content);
        console.log('articleText:', detailFeed.articleText);
        console.log('storyText:', detailFeed.storyText);
        console.log('paragraphs:', detailFeed.paragraphs);
        console.log('paragraph object:', detailFeed.paragraph);
        console.log('paragraph.body:', detailFeed.paragraph?.body);
        
        // NEW: Check for paragraph.body field which contains the full article
        if (detailFeed.paragraph && detailFeed.paragraph.body) {
          content = detailFeed.paragraph.body;
          console.log('✅ Found paragraph.body content:', content.substring(0, 200) + '...');
        }
        // Try to get the main content from bodyText field first
        else if (detailFeed.bodyText && detailFeed.bodyText.trim().length > 50) {
          content = detailFeed.bodyText;
          console.log('✅ Found bodyText content:', content.substring(0, 200) + '...');
        }
        
        // If no bodyText, try other fields in order of preference
        else if (detailFeed.articleText && detailFeed.articleText.trim().length > 50) {
          content = detailFeed.articleText;
          console.log('✅ Found articleText content:', content.substring(0, 200) + '...');
        }
        
        else if (detailFeed.storyText && detailFeed.storyText.trim().length > 50) {
          content = detailFeed.storyText;
          console.log('✅ Found storyText content:', content.substring(0, 200) + '...');
        }
        
        else if (detailFeed.content && detailFeed.content.trim().length > 50) {
          content = detailFeed.content;
          console.log('✅ Found content field:', content.substring(0, 200) + '...');
        }
        
        else if (detailFeed.description && detailFeed.description.trim().length > 50) {
          content = detailFeed.description;
          console.log('✅ Found description content:', content.substring(0, 200) + '...');
        }
        
        else if (detailFeed.summary && detailFeed.summary.trim().length > 50) {
          content = detailFeed.summary;
          console.log('✅ Found summary content:', content.substring(0, 200) + '...');
        }
        
        // If still no content, try to get from paragraphs array
        else if (detailFeed.paragraphs && Array.isArray(detailFeed.paragraphs) && detailFeed.paragraphs.length > 0) {
          console.log('Paragraphs array found:', detailFeed.paragraphs);
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
            console.log('✅ Using paragraphs content:', content.substring(0, 200) + '...');
          }
        }
        
        // If still no content, try to find any field with substantial text
        else {
          console.log('🔍 Searching through all fields for content...');
          const allFields = Object.keys(detailFeed);
          for (const field of allFields) {
            const fieldValue = detailFeed[field];
            if (fieldValue && typeof fieldValue === 'string' && fieldValue.trim().length > 100) {
              // Skip fields that are likely not article content
              if (!['title', 'headline', 'subhead', 'shortDescription', 'excerpt'].includes(field)) {
                content = fieldValue;
                console.log(`✅ Found content in field '${field}':`, content.substring(0, 200) + '...');
                break;
              }
            }
          }
        }
        
        // If we still don't have content, try to extract from the summary field
        if (!content && detailFeed.summary) {
          content = detailFeed.summary;
          console.log('✅ Using summary as content:', content.substring(0, 200) + '...');
        }
        
        // If still no content, try to construct from available fields
        if (!content) {
          const availableTexts = [];
          if (detailFeed.headline) availableTexts.push(detailFeed.headline);
          if (detailFeed.summary) availableTexts.push(detailFeed.summary);
          if (detailFeed.description) availableTexts.push(detailFeed.description);
          
          if (availableTexts.length > 0) {
            content = availableTexts.join('\n\n');
            console.log('✅ Constructed content from available fields:', content.substring(0, 200) + '...');
          }
        }
        
        // SPECIAL CASE: Check if paragraph.body exists but is null/undefined
        if (!content && detailFeed.paragraph === null) {
          console.log('⚠️ paragraph field is null, checking other content sources...');
          // Try to get content from the main response structure
          if (data.paragraph && data.paragraph.body) {
            content = data.paragraph.body;
            console.log('✅ Found content in data.paragraph.body:', content.substring(0, 200) + '...');
          }
        }
        
        // FINAL FALLBACK: Use summary if still no content
        if (!content && detailFeed.summary) {
          content = `সংক্ষিপ্ত বিবরণ:\n\n${detailFeed.summary}`;
          console.log('✅ Using summary as final fallback content');
        }
      } else {
        console.log('❌ No content array found in response');
        console.log('Response structure:', data);
        
        // Check if content is directly in the response
        if (data.paragraph && data.paragraph.body) {
          content = data.paragraph.body;
          console.log('✅ Found content directly in response.paragraph.body:', content.substring(0, 200) + '...');
        }
      }
      
      if (content) {
        console.log('=== CLEANING CONTENT ===');
        console.log('Original content length:', content.length);
        console.log('Original content preview:', content.substring(0, 300) + '...');
        
        // Clean up the content - remove HTML entities and format properly
        content = content
          .replace(/\\u003C/g, '<')
          .replace(/\\u003E/g, '>')
          .replace(/\\u003C\/p\\u003E/g, '</p>')
          .replace(/\\u003Cp\\u003E/g, '<p>')
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\'/g, "'")
          // Additional cleaning for better readability
          .replace(/\s+/g, ' ')
          .replace(/\n\s*\n/g, '\n\n')
          // Handle Bengali text formatting
          .replace(/\।\s*/g, '।\n\n')  // Add line breaks after Bengali full stops
          .replace(/\?\s*/g, '?\n\n')   // Add line breaks after question marks
          .replace(/\!\s*/g, '!\n\n')   // Add line breaks after exclamation marks
          .trim();
        
        console.log('Cleaned content length:', content.length);
        console.log('Cleaned content preview:', content.substring(0, 300) + '...');
        
        setArticleContent(content);
        console.log('✅ Content set successfully');
      } else {
        // If no content found, try to fetch from the website URL as fallback
        console.log('❌ No content found in API response, trying website fallback...');
        try {
          if (articleData.websiteUrl) {
            console.log('Fetching content from website URL:', articleData.websiteUrl);
            const websiteResponse = await fetch(`/api/website-content?url=${encodeURIComponent(articleData.websiteUrl)}`);
            
            if (websiteResponse.ok) {
              const websiteData = await websiteResponse.text();
              console.log('Website content fetched, length:', websiteData.length);
              
              // Extract content from the website HTML
              const extractedContent = extractArticleContent(websiteData);
              if (extractedContent && extractedContent.length > 100) {
                console.log('✅ Using extracted website content:', extractedContent.substring(0, 200) + '...');
                setArticleContent(extractedContent);
                return;
              }
            }
          }
        } catch (websiteError) {
          console.error('Website fallback failed:', websiteError);
        }
        
        // Final fallback to excerpt
        console.log('Using excerpt as final fallback');
        setArticleContent(articleData.excerpt || 'কোন বিস্তারিত পাওয়া যায়নি।');
      }
      
    } catch (error) {
      console.error('❌ Error fetching article content:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        articleId: articleId,
        articleData: articleData
      });
      // Use excerpt as fallback if API call fails
      setArticleContent(articleData.excerpt || 'কোন বিস্তারিত পাওয়া যায়নি।');
    }
  };

  const extractArticleContent = (html) => {
    try {
      // Create a temporary DOM element to parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Try to find article content in common selectors for Hindustan Times
      const selectors = [
        // Hindustan Times specific selectors
        '.article-content',
        '.story-content',
        '.post-content',
        '.entry-content',
        '.content-body',
        '.article-body',
        '.story-body',
        '.main-content',
        '.content',
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

  if (loading) {
    return (
      <div className="article-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>খবর লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="article-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p className="error-message">{error || 'খবর পাওয়া যায়নি'}</p>
          <button onClick={handleBack} className="back-button">
            <FiArrowLeft /> ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="article-page">
      {/* Article Header */}
      <div className="article-header">
        <div className="container">
          <button onClick={handleBack} className="back-button">
            <FiArrowLeft /> ফিরে যান
          </button>
          
          <div className="article-meta">
            <span className="article-date">
              {formatDate(article.publishDate)}
            </span>
            {article.readTime && (
              <span className="article-read-time">
                <FiClock /> {article.readTime} মিনিট পড়া
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Debug Information */}
      <div style={{ margin: '20px 0', padding: '20px', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
        <h3>🔍 Debug Information</h3>
        <p><strong>Current Article ID:</strong> {articleId}</p>
        <p><strong>Article Found:</strong> {article ? 'Yes' : 'No'}</p>
        {article && (
          <div>
            <p><strong>Article Title:</strong> {article.title}</p>
            <p><strong>Article ID in Data:</strong> {article.id}</p>
            <p><strong>Article ID Type:</strong> {typeof article.id}</p>
            <p><strong>Detail URL:</strong> {article.detailUrl}</p>
          </div>
        )}
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>Error:</strong> {error || 'None'}</p>
        <p><strong>Article Content Length:</strong> {articleContent ? articleContent.length : 0}</p>
      </div>

      {/* Main Article Content */}
      <div className="article-main">
        <div className="container">
          <div className="article-content-wrapper">
            {/* Article Title */}
            <h1 className="article-title">{article.title}</h1>
            
            {article.subtitle && article.subtitle !== article.title && (
              <h2 className="article-subtitle">{article.subtitle}</h2>
            )}

            {/* Article Image */}
            {article.imageUrl && (
              <div className="article-image-container">
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  className="article-image"
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
                    {/* Show content length for debugging */}
                    <div className="content-length-indicator">
                      <strong>Content Length:</strong> {articleContent.length} characters
                    </div>
                    
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

            {/* Test API Button */}
            <div style={{ margin: '20px 0', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
              <h3>Debug: Test API Call</h3>
              <p>Article ID: {articleId}</p>
              <button 
                onClick={() => {
                  console.log('=== MANUAL API TEST ===');
                  const testUrl = `/api/detailfeed/v1/${articleId}`;
                  console.log('Testing URL:', testUrl);
                  fetch(testUrl)
                    .then(response => {
                      console.log('Test response:', response);
                      console.log('Status:', response.status);
                      return response.json();
                    })
                    .then(data => {
                      console.log('Test data:', data);
                    })
                    .catch(error => {
                      console.error('Test error:', error);
                    });
                }}
                style={{
                  padding: '10px 20px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Test DetailFeed API
              </button>
              
              <button 
                onClick={() => {
                  console.log('=== TESTING KNOWN WORKING ARTICLE ===');
                  const testUrl = '/api/detailfeed/v1/31755001500916';
                  console.log('Testing known working URL:', testUrl);
                  fetch(testUrl)
                    .then(response => {
                      console.log('Known article response:', response);
                      console.log('Status:', response.status);
                      return response.json();
                    })
                    .then(data => {
                      console.log('Known article data:', data);
                    })
                    .catch(error => {
                      console.error('Known article error:', error);
                    });
                }}
                style={{
                  padding: '10px 20px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                Test Known Working Article
              </button>
              
              <button 
                onClick={() => {
                  console.log('=== TESTING WEBSITE CONTENT FETCH ===');
                  if (article && article.websiteUrl) {
                    console.log('Fetching from website URL:', article.websiteUrl);
                    const testUrl = `/api/website-content?url=${encodeURIComponent(article.websiteUrl)}`;
                    console.log('Testing website URL:', testUrl);
                    fetch(testUrl)
                      .then(response => {
                        console.log('Website response:', response);
                        console.log('Status:', response.status);
                        return response.text();
                      })
                      .then(data => {
                        console.log('Website content length:', data.length);
                        console.log('Website content preview:', data.substring(0, 500) + '...');
                      })
                      .catch(error => {
                        console.error('Website fetch error:', error);
                      });
                  } else {
                    console.log('No website URL available');
                  }
                }}
                style={{
                  padding: '10px 20px',
                  background: '#ffc107',
                  color: 'black',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                Test Website Content
              </button>
              
              <button 
                onClick={() => {
                  console.log('=== TESTING CURRENT ARTICLE DETAILFEED ===');
                  const testUrl = `/api/detailfeed/v1/${articleId}`;
                  console.log('Testing current article detailFeed:', testUrl);
                  fetch(testUrl)
                    .then(response => {
                      console.log('DetailFeed response:', response);
                      console.log('Status:', response.status);
                      return response.json();
                    })
                    .then(data => {
                      console.log('=== DETAILFEED RAW RESPONSE ===');
                      console.log('Full response:', data);
                      console.log('Content array:', data.content);
                      if (data.content && data.content.length > 0) {
                        const detailFeed = data.content[0];
                        console.log('DetailFeed object:', detailFeed);
                        console.log('Available fields:', Object.keys(detailFeed));
                        console.log('Paragraph field:', detailFeed.paragraph);
                        console.log('Paragraph.body:', detailFeed.paragraph?.body);
                        console.log('Summary:', detailFeed.summary);
                        console.log('Headline:', detailFeed.headline);
                      }
                    })
                    .catch(error => {
                      console.error('DetailFeed test error:', error);
                    });
                }}
                style={{
                  padding: '10px 20px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                Test Current DetailFeed
              </button>
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

          {/* Similar Stories Sidebar */}
          <aside className="similar-stories-sidebar">
            <h3 className="sidebar-title">সম্পর্কিত খবর</h3>
            <div className="similar-stories-list">
              {similarStories.map((story) => (
                <Link 
                  key={story.id} 
                  to={`/article/${story.id}`}
                  className="similar-story-link"
                >
                  <NewsCard
                    {...story}
                    variant="trending"
                    onClick={() => {}} // Prevent default click
                  />
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;
