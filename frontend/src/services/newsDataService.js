// News Data Service - Integrated with Hindustan Times Bangla API
import { mockNewsData } from '../data/mockNewsData.js';
import { SECTION_API_OVERRIDES } from '../config/sectionAPIs.js';

class NewsDataService {
  constructor() {
    // Use environment variable for production, fallback to localhost for development
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://sangbadbangla1.onrender.com';
    
    console.log('NewsDataService initialized with baseUrl:', this.baseUrl);
    // Decide if we should route images via backend proxy (only if same host)
    try {
      const baseHost = new URL(this.baseUrl).host;
      const currentHost = typeof window !== 'undefined' && window.location ? window.location.host : '';
      this.shouldProxyImages = baseHost === currentHost; // proxy only when backend is same origin
    } catch (e) {
      this.shouldProxyImages = false;
    }
  }

  // Transform API response to match our frontend structure
  transformNewsItem(apiItem) {
    console.log('Transforming API item:', apiItem);
    // Broad image extraction to handle different API shapes
    const bigImage = apiItem.imageObject?.bigImage || apiItem.bigImage || apiItem.leadImage || apiItem.image;
    const mediumImage = apiItem.imageObject?.mediumImage || apiItem.mediumImage;
    const thumb = apiItem.imageObject?.thumbnailImage || apiItem.thumbnailImage;
    const preferredImage = apiItem.wallpaperLarge || bigImage || apiItem.mediumRes || mediumImage || apiItem.thumbImage || thumb || apiItem.imageUrl;

    const transformed = {
      id: apiItem.id || apiItem.itemId || apiItem.storyId,
      // Prefer large image, then medium, then thumb
      imageUrl: preferredImage,
      // keep raw image fields to improve fallback rendering
      wallpaperLarge: apiItem.wallpaperLarge || bigImage || null,
      mediumRes: apiItem.mediumRes || mediumImage || null,
      thumbImage: apiItem.thumbImage || thumb || null,
      title: apiItem.title || apiItem.headLine || apiItem.headline,
      excerpt: apiItem.excerpt || apiItem.shortDescription || apiItem.description,
      publishDate: this.parseDate(apiItem.publishDate || apiItem.publishedDate || apiItem.date),
      readTime: apiItem.readTime || apiItem.timeToRead || apiItem.readingTime || 3,
      detailUrl: apiItem.detailUrl || apiItem.detailFeedURL || apiItem.storyURL || apiItem.url,
      websiteUrl: apiItem.websiteUrl || apiItem.websiteURL || apiItem.storyURL,
      contentType: apiItem.contentType || 'News',
      sectionName: apiItem.sectionName || apiItem.section || '',
      category: apiItem.category || apiItem.sectionName || apiItem.section || '',
      authorName: apiItem.authorName || apiItem.author || apiItem.byline || '',
      keywords: apiItem.keywords || apiItem.tags || []
    };
    console.log('Transformed item:', transformed);
    return transformed;
  }

  // Utility method to sort news by publish date (latest first)
  sortNewsByDate(newsArray) {
    return newsArray.sort((a, b) => {
      const dateA = new Date(a.publishDate);
      const dateB = new Date(b.publishDate);
      
      // Handle invalid dates by putting them at the end
      if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      
      return dateB - dateA; // Latest first
    });
  }

  // Parse the date format from API (handles multiple formats)
  parseDate(dateString) {
    if (!dateString) return new Date().toISOString();
    
    try {
      // First, check if it's already an ISO string (from backend validation)
      if (dateString.includes('T') && dateString.includes('Z')) {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          // Check if date is valid and not in the future (more than 1 year ahead)
          const now = new Date();
          const maxFutureDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
          
          if (date > maxFutureDate) {
            console.warn('Date is too far in the future, using current date:', dateString);
            return new Date().toISOString();
          }
          
          return date.toISOString();
        }
      }
      
      // Handle format: "2025-08-13 10:30:15" (YYYY-MM-DD HH:MM:SS)
      if (dateString.includes('-') && dateString.includes(':') && !dateString.includes('T')) {
        const [datePart, timePart] = dateString.split(' ');
        if (datePart && timePart) {
          const [year, month, day] = datePart.split('-');
          const [hour, minute, second] = timePart.split(':');
          
          // Create date with UTC to avoid timezone issues
          const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second)));
          
          // Check if date is valid and not in the future (more than 1 year ahead)
          const now = new Date();
          const maxFutureDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
          
          if (date > maxFutureDate) {
            console.warn('Date is too far in the future, using current date:', dateString);
            return new Date().toISOString();
          }
          
          return date.toISOString();
        }
      }
      
      // Handle format: "08/12/2025 08:45:49 PM" (DD/MM/YYYY HH:MM:SS AM/PM)
      if (dateString.includes('/') && (dateString.includes('AM') || dateString.includes('PM'))) {
        const [datePart, timePart] = dateString.split(' ');
        if (datePart && timePart) {
          const [day, month, year] = datePart.split('/');
          const [hour, minute, second] = timePart.split(':');
          
          let hour24 = parseInt(hour);
          if (timePart.includes('PM') && hour24 !== 12) hour24 += 12;
          if (timePart.includes('AM') && hour24 === 12) hour24 = 0;
          
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour24, parseInt(minute), parseInt(second));
          
          // Check if date is valid and not in the future
          const now = new Date();
          const maxFutureDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
          
          if (date > maxFutureDate) {
            console.warn('Date is too far in the future, using current date:', dateString);
            return new Date().toISOString();
          }
          
          return date.toISOString();
        }
      }
      
      // Try to parse as other formats
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
      
      // Check if date is valid and not in the future
      const now = new Date();
      const maxFutureDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      
      if (date > maxFutureDate) {
        console.warn('Date is too far in the future, using current date:', dateString);
        return new Date().toISOString();
      }
      
      return date.toISOString();
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return new Date().toISOString();
    }
  }

  // Get featured news from new popular stories API
  async getFeaturedNews() {
    try {
      console.log('🔍 Fetching featured news from:', `${this.baseUrl}/api/popular-stories`);
      
      // Force fresh data with aggressive cache busting
      const timestamp = Date.now();
      const randomParam = Math.random().toString(36).substring(7);
      const fullUrl = `${this.baseUrl}/api/popular-stories?t=${timestamp}&r=${randomParam}&fresh=true`;
      
      console.log('📡 Full API URL:', fullUrl);
      console.log('🌐 Base URL being used:', this.baseUrl);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Fresh Popular Stories API Response:', data);
      
      if (data.success && data.stories) {
        // Transform and return all stories in API order
        const transformedNews = data.stories
          .map(item => this.transformNewsItem(item));
        
        console.log('✅ Fresh Transformed Featured News (API Order):', transformedNews);
        return transformedNews;
      }
      return [];
    } catch (error) {
      console.error('❌ Error fetching popular stories from API:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        baseUrl: this.baseUrl,
        fullUrl: `${this.baseUrl}/api/popular-stories`
      });
      return this.getMockFeaturedNews();
    }
  }

  // Get trending news from trending stories API
  async getTrendingNews() {
    try {
      console.log('🔍 Fetching trending news from:', `${this.baseUrl}/api/trending-stories`);
      
      // First try to get trending stories from a dedicated trending endpoint
      let response = await fetch(`${this.baseUrl}/api/trending-stories`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('📥 Trending stories response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.stories) {
          console.log('✅ Fresh Trending Stories API Response:', data);
          // Return all stories in API order
          return data.stories
            .map(item => this.transformNewsItem(item));
        }
      }
      
      console.log('🔄 Falling back to popular stories for trending news...');
      
      // Fallback: Get fresh trending data by calling popular stories with aggressive cache busting
      const timestamp = Date.now();
      const randomParam = Math.random().toString(36).substring(7);
      const fallbackUrl = `${this.baseUrl}/api/popular-stories?t=${timestamp}&r=${randomParam}&trending=true`;
      
      console.log('📡 Fallback API URL:', fallbackUrl);
      
      response = await fetch(fallbackUrl, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('📥 Fallback response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.stories) {
        // Transform all stories first, then sort by publish date
        const allTransformedStories = data.stories
          .map(item => this.transformNewsItem(item))
          .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        
        // Return all stories in API order
        console.log('✅ Fresh Trending News (API Order):', allTransformedStories);
        return allTransformedStories
          .filter(item => item.publishDate); // Ensure we have valid dates
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error fetching trending news:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        baseUrl: this.baseUrl
      });
      return this.getMockTrendingNews();
    }
  }

  // Get fresh trending news with enhanced data selection
  async getFreshTrendingNews() {
    try {
      // Add cache busting to ensure fresh data
      const timestamp = Date.now();
      const response = await fetch(`${this.baseUrl}/api/popular-stories?t=${timestamp}&fresh=true`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.stories) {
        // Transform and return all stories in API order
        const allTransformedStories = data.stories
          .map(item => this.transformNewsItem(item));
        
        // Return all stories in API order
        console.log('Enhanced Fresh Trending News (API Order):', allTransformedStories);
        return allTransformedStories
          .filter(item => item.publishDate); // Ensure we have valid dates
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching fresh trending news:', error);
      return this.getMockTrendingNews();
    }
  }

  // Get different trending news sets for rotation
  async getTrendingNewsSet(setIndex = 0) {
    try {
      // Force fresh data with aggressive cache busting
      const timestamp = Date.now();
      const randomParam = Math.random().toString(36).substring(7);
      const response = await fetch(`${this.baseUrl}/api/popular-stories?t=${timestamp}&r=${randomParam}&set=${setIndex}&fresh=true`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.stories) {
        // Transform and return all stories in API order
        const allTransformedStories = data.stories
          .map(item => this.transformNewsItem(item));
        
        // Return all stories in API order
        console.log(`Fresh Trending News Set ${setIndex} (API Order):`, allTransformedStories);
        return allTransformedStories
          .filter(item => item.publishDate); // Ensure we have valid dates
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching trending news set ${setIndex}:`, error);
      return this.getMockTrendingNews();
    }
  }

  // Get news by category using section feed API
  async getNewsByCategory(category) {
    try {
      // Try override first (direct HT endpoint provided by you)
      const overrideUrl = SECTION_API_OVERRIDES[category];
      let response;
      if (overrideUrl) {
        response = await fetch(overrideUrl);
      } else {
        // Default: use backend proxy which mirrors homepage pattern
        response = await fetch(`${this.baseUrl}/api/section-feed/${encodeURIComponent(category)}/15`);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.stories) {
        // Transform and return all stories in API order
        return data.stories
          .map(item => this.transformNewsItem(item));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching news by category from API:', error);
      return this.getMockNewsByCategory(category);
    }
  }

  // Generic section news fetcher with explicit limit
  async getSectionNews(sectionKey, limit = 15) {
    try {
      const overrideUrl = SECTION_API_OVERRIDES[sectionKey];
      // Always use backend proxy in dev/staging to normalize responses
      let response = await fetch(`${this.baseUrl}/api/section-feed/${encodeURIComponent(sectionKey)}/${limit}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.stories)) {
        const transformed = data.stories.map(item => this.transformNewsItem(item));
        if (this.shouldProxyImages) {
          // Rewrite images through proxy when backend is same origin
          return transformed.map(n => ({
            ...n,
            wallpaperLarge: n.wallpaperLarge ? `${this.baseUrl}/api/image?url=${encodeURIComponent(n.wallpaperLarge)}` : undefined,
            mediumRes: n.mediumRes ? `${this.baseUrl}/api/image?url=${encodeURIComponent(n.mediumRes)}` : undefined,
            thumbImage: n.thumbImage ? `${this.baseUrl}/api/image?url=${encodeURIComponent(n.thumbImage)}` : undefined,
            imageUrl: n.wallpaperLarge ? `${this.baseUrl}/api/image?url=${encodeURIComponent(n.wallpaperLarge)}` : (n.imageUrl ? `${this.baseUrl}/api/image?url=${encodeURIComponent(n.imageUrl)}` : undefined)
          }));
        }
        return transformed;
      }
      return [];
    } catch (error) {
      console.error('Error fetching section news:', sectionKey, error);
      return this.getMockNewsByCategory(sectionKey);
    }
  }

  // Get category page news by combining Firestore (internal) + HT section feed (external)
  async getCategoryNews(sectionKey, limit = 15, internalKeyOverride) {
    try {
      // Run both requests in parallel
      const internalKey = internalKeyOverride || sectionKey;
      const [combinedResult, sectionStories] = await Promise.all([
        this.getCombinedNews(1, limit, internalKey),
        this.getSectionNews(sectionKey, limit)
      ]);

      const internalNews = (combinedResult?.news || []).filter(item => item.source === 'internal');
      const externalNews = Array.isArray(sectionStories) ? sectionStories : [];

      // Merge and de-duplicate (by id/detailUrl/title)
      const seen = new Set();
      const mergeKey = (n) => n.id || n.detailUrl || n.title;
      const merged = [];
      [...internalNews, ...externalNews].forEach(n => {
        const key = mergeKey(n);
        if (!key) return;
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(n);
        }
      });

      // Order: internal first (newest first), then external (newest first)
      const internalSorted = merged
        .filter(n => n.source === 'internal')
        .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
      const externalSorted = merged
        .filter(n => n.source !== 'internal')
        .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
      return [...internalSorted, ...externalSorted].slice(0, Math.max(limit, 15));
    } catch (error) {
      console.error('Error fetching combined category news:', sectionKey, error);
      return this.getMockNewsByCategory(sectionKey);
    }
  }

  // Search news from popular stories
  async searchNews(query) {
    try {
      const response = await fetch(`${this.baseUrl}/api/popular-stories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.stories) {
        const newsItems = data.stories;
        
        // Search in headline, description, and keywords
        const searchResults = newsItems.filter(item => 
          item.title?.toLowerCase().includes(query.toLowerCase()) ||
          item.excerpt?.toLowerCase().includes(query.toLowerCase()) ||
          item.keywords?.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
        );
        
        // Transform and return all stories in API order
        return searchResults
          .map(item => this.transformNewsItem(item));
      }
      
      return [];
    } catch (error) {
      console.error('Error searching news from API:', error);
      return this.getMockSearchNews(query);
    }
  }

  // Get section feed for detailed article view
  async getSectionFeed(sectionName, numStories = 15) {
    try {
      console.log('🔍 Fetching section feed for:', sectionName, 'with', numStories, 'stories');
      
      const response = await fetch(`${this.baseUrl}/api/section-feed/${encodeURIComponent(sectionName)}/${numStories}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Section feed API response:', data);
      
      if (data.success && data.stories) {
        return data.stories.map(item => this.transformNewsItem(item));
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error fetching section feed from API:', error);
      return [];
    }
  }

  async getDetailedArticle(sectionName, numberOfStories = 15) {
    try {
      console.log('🔍 Fetching detailed articles for section:', sectionName);
      
      // Use the backend section feed endpoint
      const response = await fetch(`${this.baseUrl}/api/section-feed/${encodeURIComponent(sectionName)}/${numberOfStories}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Detailed Article API Response:', data);
      
      if (data.success && data.stories && Array.isArray(data.stories)) {
        // Transform and sort by publish date - latest first
        const transformedStories = this.transformDetailedStories(data.stories);
        const sortedStories = transformedStories.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        
        console.log('✅ Transformed and sorted detailed articles:', sortedStories);
        return sortedStories;
      } else {
        console.warn('⚠️ No stories found for section:', sectionName);
        // Fallback to mock data instead of empty array
        return this.getMockNewsByCategory(sectionName);
      }
    } catch (error) {
      console.error('❌ Error fetching detailed article:', error);
      console.error('❌ Error details:', {
        message: error.message,
        sectionName,
        numberOfStories,
        baseUrl: this.baseUrl
      });
      
      // Fallback to mock data instead of throwing error
      console.log('🔄 Falling back to mock data for section:', sectionName);
      return this.getMockNewsByCategory(sectionName);
    }
  }

  transformDetailedStories(stories) {
    if (!stories || !Array.isArray(stories)) {
      console.warn('⚠️ transformDetailedStories: Invalid stories input:', stories);
      return [];
    }
    
    console.log('🔄 Transforming detailed stories:', stories);
    
    const transformed = stories.map((item, index) => {
      try {
        // Map Hindustan Times API fields correctly
        const transformedItem = {
          id: item.id || item.storyId || item.itemId || index,
          title: item.title || item.headline || item.headLine || `Story ${index + 1}`,
          subtitle: item.subtitle || item.subHead || item.subHeadline || '',
          excerpt: item.excerpt || item.shortDescription || item.description || '',
          content: item.content || item.body || '',
          imageUrl: item.imageUrl || item.imageObject?.bigImage || item.imageObject?.mediumImage || item.imageObject?.thumbnailImage || item.wallpaperLarge || item.mediumRes || item.thumbImage || item.image || item.leadImage || '',
          publishDate: this.parseDate(item.publishDate || item.publishedDate || item.date),
          readTime: item.readTime || item.timeToRead || item.readingTime || 3,
          authorName: item.authorName || item.author || item.byline || '',
          category: item.category || item.section || item.sectionName || '',
          contentType: item.contentType || 'News',
          detailUrl: item.detailUrl || item.storyURL || item.detailFeedURL || item.url || item.link || '',
          websiteUrl: item.websiteUrl || item.storyURL || item.websiteURL || item.sourceUrl || '',
          keywords: item.keywords || item.tags || [],
          sectionName: item.sectionName || item.section || ''
        };
        
        console.log(`✅ Transformed story ${index + 1}:`, transformedItem);
        return transformedItem;
      } catch (error) {
        console.error(`❌ Error transforming story ${index + 1}:`, error, item);
        return null;
      }
    }).filter(Boolean); // Remove any null items
    
    console.log(`✅ Successfully transformed ${transformed.length} stories`);
    return transformed;
  }

  // Fallback mock data methods
  getMockFeaturedNews() {
    // Return more mock stories to match our increased limits
    const allMockNews = [...mockNewsData.featuredNews, ...mockNewsData.trendingNews];
    return allMockNews;
  }

  getMockTrendingNews() {
    // Return more mock stories to match our increased limits
    const allMockNews = [...mockNewsData.featuredNews, ...mockNewsData.trendingNews];
    return allMockNews.slice(0, 12); // Return 12 trending stories
  }

  getMockNewsByCategory(category) {
    console.log('🔄 Getting mock news for category:', category);
    
    const allNews = [...mockNewsData.featuredNews, ...mockNewsData.trendingNews];
    
    // First try to find exact category match
    let filteredNews = allNews.filter(news => 
      news.category && news.category.toLowerCase().includes(category.toLowerCase())
    );
    
    // If no exact match, return all news (fallback)
    if (filteredNews.length === 0) {
      console.log('⚠️ No exact category match found, returning all mock news as fallback');
      filteredNews = allNews;
    }
    
    // Ensure we have at least some news
    if (filteredNews.length === 0) {
      console.log('⚠️ No mock news available, creating default news');
      filteredNews = [
        {
          id: 'fallback-1',
          imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
          title: `${category} সম্পর্কিত খবর`,
          subtitle: 'এই বিভাগের জন্য খবর লোড হচ্ছে',
          excerpt: 'আপনার নির্বাচিত বিভাগের জন্য খবর লোড হচ্ছে। কিছুক্ষণ অপেক্ষা করুন।',
          publishDate: new Date().toISOString(),
          category: category,
          author: 'সিস্টেম',
          readTime: 3
        }
      ];
    }
    
    console.log(`✅ Returning ${filteredNews.length} mock news items for category: ${category}`);
    return filteredNews;
  }

  getMockSearchNews(query) {
    const allNews = [...mockNewsData.featuredNews, ...mockNewsData.trendingNews];
    return allNews.filter(news => 
      news.title.toLowerCase().includes(query.toLowerCase()) ||
      news.excerpt?.toLowerCase().includes(query.toLowerCase()) ||
      news.category?.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Force refresh all news data with aggressive cache busting
  async forceRefreshAllNews() {
    try {
      console.log('🔄 Force refreshing all news data...');
      
      // Clear any potential browser cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('🧹 Browser cache cleared');
      }
      
      // Force fresh featured news
      const featuredNews = await this.getFeaturedNews();
      
      // Force fresh trending news
      const trendingNews = await this.getTrendingNews();
      
      console.log('✅ All news data force refreshed successfully');
      
      return {
        featured: featuredNews,
        trending: trendingNews
      };
    } catch (error) {
      console.error('Error force refreshing news:', error);
      throw error;
    }
  }

  // Fetch cricket data from the backend proxy
  async getCricketData() {
    try {
      const response = await fetch(`${this.baseUrl}/api/cricket-data`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error('Invalid response format from cricket API');
      }
    } catch (error) {
      console.error('Error fetching cricket data:', error);
      throw error;
    }
  }

  // Get combined news (Firestore + external) from backend
  async getCombinedNews(page = 1, limit = 20, category = null) {
    try {
      console.log('📡 Fetching combined news from backend...');
      
      // Use the proxy URL format
      let url = `${this.baseUrl}/api/combined-news?page=${page}&limit=${limit}`;
      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }
      
      console.log('🌐 Fetching from URL:', url);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Combined news response:', result);
      
      if (result.success && result.data) {
        // Transform the combined news to match our frontend format
        const transformedNews = result.data.map(item => {
          if (item.source === 'internal') {
            // Firestore news - already in correct format
            return {
              ...item,
              publishDate: item.createdAt || item.publishDate,
              sectionName: item.category,
              excerpt: item.excerpt || item.content?.substring(0, 200) + '...'
            };
          } else {
            // External news - transform using existing method
            return this.transformNewsItem(item);
          }
        });
        
        console.log('🔄 Transformed news:', transformedNews.length, 'articles');
        
        return {
          news: transformedNews,
          pagination: result.pagination,
          sources: result.sources
        };
      }
      
      return {
        news: [],
        pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
        sources: { firestore: 0, external: 0, total: 0 }
      };
    } catch (error) {
      console.error('❌ Error fetching combined news:', error);
      
      // Check if it's a timeout or network error
      if (error.name === 'AbortError') {
        console.log('⏰ Request timed out, falling back to mock data...');
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.log('🌐 Network error, falling back to mock data...');
      }
      
      // Fallback to mock data to avoid infinite loop
      console.log('🔄 Falling back to mock data due to error...');
      return {
        news: this.getMockFeaturedNews(),
        pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
        sources: { firestore: 0, external: 0, total: 0 }
      };
    }
  }
}

export default new NewsDataService(); 