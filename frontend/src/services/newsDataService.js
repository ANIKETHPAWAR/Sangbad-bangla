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
    
    // Initialize cache
    this.cache = new Map();
    this.cacheTimestamps = new Map();
  }

  // Simple in-memory cache methods
  setCache(key, data, ttl = 120000) { // 2 minutes default TTL
    this.cache.set(key, data);
    this.cacheTimestamps.set(key, Date.now() + ttl);
  }

  getFromCache(key) {
    const expiry = this.cacheTimestamps.get(key);
    if (expiry && Date.now() < expiry) {
      return this.cache.get(key);
    }
    // Clean up expired cache
    this.cache.delete(key);
    this.cacheTimestamps.delete(key);
    return null;
  }

  clearCache() {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  // Get popular news with rotation to show different content than all news
  async getPopularNews(page = 1, limit = 20) {
    try {
      console.log('🔥 Fetching popular news with rotation...');
      
      // Generate rotation offset based on current time to ensure different content
      // This creates a rotation that changes every 5 minutes
      const rotationInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
      const rotationOffset = Math.floor(Date.now() / rotationInterval) % 10; // Rotate through 10 different offsets
      
      console.log(`🔄 Popular News Rotation: Using offset ${rotationOffset} (changes every 5 minutes)`);
      console.log(`🔄 This ensures popular news shows different content than all news`);
      
      // Use the same API as all news but with rotation
      const result = await this.getCombinedNews(page, limit, null, rotationOffset);
      
      return result;
    } catch (error) {
      console.error('❌ Error fetching popular news:', error);
      
      // Fallback to regular combined news without rotation
      return await this.getCombinedNews(page, limit, null, 0);
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
      
      // Check cache first
      const cacheKey = 'featured-news';
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('⚡ Loading featured news from cache');
        return cachedData;
      }
      
      // Use the proxy URL format
      const fullUrl = `${this.baseUrl}/api/popular-stories`;
      
      console.log('📡 Full API URL:', fullUrl);
      console.log('🌐 Base URL being used:', this.baseUrl);
      
      // Reduced timeout for faster user feedback
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      console.log('📥 Response status:', response.status);
      
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
        
        // Cache for 2 minutes
        this.setCache(cacheKey, transformedNews, 120000);
        
        return transformedNews;
      }
      return [];
    } catch (error) {
      console.error('❌ Error fetching popular stories from API:', error);
      
      // Check cache for fallback
      const cacheKey = 'featured-news';
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('🔄 Using cached featured news as fallback');
        return cachedData;
      }
      
      // No mock data fallback - return empty array
      console.log('❌ No cached data available, returning empty state');
      return [];
    }
  }

  // Get trending news from trending stories API
  async getTrendingNews() {
    try {
      console.log('🔍 Fetching trending news from:', `${this.baseUrl}/api/trending-stories`);
      
      // Check cache first
      const cacheKey = 'trending-news';
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('⚡ Loading trending news from cache');
        return cachedData;
      }
      
      // Reduced timeout for faster user feedback
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      // First try to get trending stories from a dedicated trending endpoint
      let response = await fetch(`${this.baseUrl}/api/trending-stories`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      console.log('📥 Trending stories response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.stories) {
          console.log('✅ Fresh Trending Stories API Response:', data);
          // Return all stories in API order
          const transformedNews = data.stories
            .map(item => this.transformNewsItem(item));
          
          // Cache for 2 minutes
          this.setCache(cacheKey, transformedNews, 120000);
          
          return transformedNews;
        }
      }
      
      console.log('🔄 Falling back to popular stories for trending news...');
      
      // Fallback: Get trending data from popular stories
      const fallbackUrl = `${this.baseUrl}/api/popular-stories`;
      
      console.log('📡 Fallback API URL:', fallbackUrl);
      
      const fallbackController = new AbortController();
      const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 3000);
      
      response = await fetch(fallbackUrl, {
        method: 'GET',
        signal: fallbackController.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(fallbackTimeoutId);
      
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
        
        const filteredNews = allTransformedStories
          .filter(item => item.publishDate); // Ensure we have valid dates
        
        // Cache for 2 minutes
        this.setCache(cacheKey, filteredNews, 120000);
        
        return filteredNews;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error fetching trending news:', error);
      
      // Check cache for fallback
      const cacheKey = 'trending-news';
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('🔄 Using cached trending news as fallback');
        return cachedData;
      }
      
      // No mock data fallback - return empty array
      console.log('❌ No cached data available, returning empty state');
      return [];
    }
  }

  // Get fresh trending news with enhanced data selection
  async getFreshTrendingNews() {
    try {
      // Check cache first
      const cacheKey = 'fresh-trending-news';
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('⚡ Loading fresh trending news from cache');
        return cachedData;
      }
      
      // Reduced timeout for faster user feedback
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`${this.baseUrl}/api/popular-stories`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
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
        
        const filteredNews = allTransformedStories
          .filter(item => item.publishDate); // Ensure we have valid dates
        
        // Cache for 2 minutes
        this.setCache(cacheKey, filteredNews, 120000);
        
        return filteredNews;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching fresh trending news:', error);
      
      // Check cache for fallback
      const cacheKey = 'fresh-trending-news';
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('🔄 Using cached fresh trending news as fallback');
        return cachedData;
      }
      
      // No mock data fallback - return empty array
      console.log('❌ No cached data available for fresh trending news');
      return [];
    }
  }

  // Get different trending news sets for rotation
  async getTrendingNewsSet(setIndex = 0) {
    try {
      // Check cache first
      const cacheKey = `trending-news-set-${setIndex}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('⚡ Loading trending news set from cache:', setIndex);
        return cachedData;
      }
      
      // Reduced timeout for faster user feedback
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`${this.baseUrl}/api/popular-stories`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.stories) {
        // Transform and return all stories in API order
        const allTransformedStories = data.stories
          .map(item => this.transformNewsItem(item));
        
        // Return all stories in API order
        
        
        const filteredNews = allTransformedStories
          .filter(item => item.publishDate); // Ensure we have valid dates
        
        // Cache for 2 minutes
        this.setCache(cacheKey, filteredNews, 120000);
        
        return filteredNews;
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching trending news set ${setIndex}:`, error);
      
      // Check cache for fallback
      const cacheKey = `trending-news-set-${setIndex}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('🔄 Using cached trending news set as fallback:', setIndex);
        return cachedData;
      }
      
      
      return [];
    }
  }

  // Get news by category using section feed API
  async getNewsByCategory(category) {
    try {
      // Check cache first
      const cacheKey = `category-news-${category}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('⚡ Loading category news from cache:', category);
        return cachedData;
      }
      
      // Try override first (direct HT endpoint provided by you)
      const overrideUrl = SECTION_API_OVERRIDES[category];
      let response;
      
      // Reduced timeout for faster user feedback
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      if (overrideUrl) {
        response = await fetch(overrideUrl, { signal: controller.signal });
      } else {
        // Default: use backend proxy which mirrors homepage pattern
        response = await fetch(`${this.baseUrl}/api/section-feed/${encodeURIComponent(category)}/15`, { 
          signal: controller.signal 
        });
      }
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.stories) {
        // Transform and return all stories in API order
        const transformedNews = data.stories
          .map(item => this.transformNewsItem(item));
        
        // Cache for 2 minutes
        this.setCache(cacheKey, transformedNews, 120000);
        
        return transformedNews;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching news by category from API:', error);
      
      // Check cache for fallback
      const cacheKey = `category-news-${category}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('🔄 Using cached category news as fallback:', category);
        return cachedData;
      }
      
      // No mock data fallback - return empty array
      console.log('❌ No cached data available for category:', category);
      return [];
    }
  }

  // Generic section news fetcher with explicit limit
  async getSectionNews(sectionKey, limit = 15) {
    try {
      // Check cache first
      const cacheKey = `section-news-${sectionKey}-${limit}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('⚡ Loading section news from cache:', sectionKey);
        return cachedData;
      }
      
      const overrideUrl = SECTION_API_OVERRIDES[sectionKey];
      
      // Longer timeout with single retry
      const tryFetch = async (attempt = 1) => {
        const controller = new AbortController();
        const TIMEOUT_MS = attempt === 1 ? 12000 : 20000; // 12s then 20s
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
        try {
          // Use explicit override when provided, otherwise use backend proxy
          const resp = await fetch(
            overrideUrl || `${this.baseUrl}/api/section-feed/${encodeURIComponent(sectionKey)}/${limit}`,
            { signal: controller.signal, headers: { 'Cache-Control': 'no-cache' } }
          );
          clearTimeout(timeoutId);
          return resp;
        } catch (e) {
          clearTimeout(timeoutId);
          if (attempt < 2) {
            await new Promise(r => setTimeout(r, 800));
            return tryFetch(attempt + 1);
          }
          throw e;
        }
      };

      const response = await tryFetch();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.stories)) {
        const transformed = data.stories.map(item => this.transformNewsItem(item));
        // Always rewrite images through proxy to avoid CORP/CORS on third-party CDN
        const finalData = transformed.map(n => ({
          ...n,
          wallpaperLarge: n.wallpaperLarge ? `${this.baseUrl}/api/image?url=${encodeURIComponent(n.wallpaperLarge)}` : undefined,
          mediumRes: n.mediumRes ? `${this.baseUrl}/api/image?url=${encodeURIComponent(n.mediumRes)}` : undefined,
          thumbImage: n.thumbImage ? `${this.baseUrl}/api/image?url=${encodeURIComponent(n.thumbImage)}` : undefined,
          imageUrl: n.wallpaperLarge ? `${this.baseUrl}/api/image?url=${encodeURIComponent(n.wallpaperLarge)}` : (n.imageUrl ? `${this.baseUrl}/api/image?url=${encodeURIComponent(n.imageUrl)}` : undefined)
        }));
        
        // Cache for 2 minutes
        this.setCache(cacheKey, finalData, 120000);
        
        return finalData;
      }
      return [];
    } catch (error) {
      console.error('Error fetching section news:', sectionKey, error);
      
      // Check cache for fallback
      const cacheKey = `section-news-${sectionKey}-${limit}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('🔄 Using cached section news as fallback:', sectionKey);
        return cachedData;
      }
      
      // No mock data fallback - return empty array
      console.log('❌ No cached data available for section:', sectionKey);
      return [];
    }
  }

  // Get category page news by combining Firestore (internal) + HT section feed (external)
  async getCategoryNews(sectionKey, limit = 15, internalKeyOverride) {
    try {
      // Check cache first
      const cacheKey = `category-combined-${sectionKey}-${limit}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('⚡ Loading combined category news from cache:', sectionKey);
        return cachedData;
      }
      
      // Run both requests in parallel with reduced timeouts
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
      
      const finalResult = [...internalSorted, ...externalSorted].slice(0, Math.max(limit, 15));
      
      // Cache for 2 minutes
      this.setCache(cacheKey, finalResult, 120000);
      
      return finalResult;
    } catch (error) {
      console.error('Error fetching combined category news:', sectionKey, error);
      
      // Check cache for fallback
      const cacheKey = `category-combined-${sectionKey}-${limit}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('🔄 Using cached combined category news as fallback:', sectionKey);
        return cachedData;
      }
      
      // No mock data fallback - return empty array
      console.log('❌ No cached data available for combined category:', sectionKey);
      return [];
    }
  }

  // Search news from popular stories
  async searchNews(query) {
    try {
      // Check cache first
      const cacheKey = `search-${query.toLowerCase()}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('⚡ Loading search results from cache:', query);
        return cachedData;
      }
      
      // Reduced timeout for faster user feedback
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`${this.baseUrl}/api/popular-stories`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
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
        const transformedResults = searchResults
          .map(item => this.transformNewsItem(item));
        
        // Cache for 1 minute (shorter for search results)
        this.setCache(cacheKey, transformedResults, 60000);
        
        return transformedResults;
      }
      
      return [];
    } catch (error) {
      console.error('Error searching news from API:', error);
      
      // Check cache for fallback
      const cacheKey = `search-${query.toLowerCase()}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('🔄 Using cached search results as fallback:', query);
        return cachedData;
      }
      
      // No mock data fallback - return empty array
      console.log('❌ No cached data available for search:', query);
      return [];
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
      
      // Check cache first
      const cacheKey = `detailed-article-${sectionName}-${numberOfStories}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('⚡ Loading detailed articles from cache:', sectionName);
        return cachedData;
      }
      
      // Reduced timeout for faster user feedback
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      // Use the backend section feed endpoint
      const response = await fetch(`${this.baseUrl}/api/section-feed/${encodeURIComponent(sectionName)}/${numberOfStories}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
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
        
        // Cache for 2 minutes
        this.setCache(cacheKey, sortedStories, 120000);
        
        return sortedStories;
      } else {
        console.warn('⚠️ No stories found for section:', sectionName);
        // No mock data fallback - return empty array
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching detailed article:', error);
      
      // Check cache for fallback
      const cacheKey = `detailed-article-${sectionName}-${numberOfStories}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('🔄 Using cached detailed articles as fallback:', sectionName);
        return cachedData;
      }
      
      // No mock data fallback - return empty array
      console.log('❌ No cached data available for detailed articles:', sectionName);
      return [];
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

  // Mock data methods removed - returning empty arrays for better performance
  getMockFeaturedNews() {
    console.log('❌ Mock data disabled - returning empty array');
    return [];
  }

  getMockTrendingNews() {
    console.log('❌ Mock data disabled - returning empty array');
    return [];
  }

  getMockNewsByCategory(category) {
    console.log('❌ Mock data disabled for category:', category);
    return [];
  }

  getMockSearchNews(query) {
    console.log('❌ Mock data disabled for search:', query);
    return [];
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
  async getCombinedNews(page = 1, limit = 20, category = null, rotationOffset = 0) {
    try {
      console.log('📡 Fetching combined news from backend...');
      
      // Check cache first for immediate loading
      const cacheKey = `combined-news-${page}-${limit}-${category || 'all'}-${rotationOffset}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('⚡ Loading from cache:', cacheKey);
        return cachedData;
      }
      
      // Use the proxy URL format
      let url = `${this.baseUrl}/api/combined-news?page=${page}&limit=${limit}`;
      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }
      
      console.log('🌐 Fetching from URL:', url);
      
      // Add cache-buster on first request and longer timeout with single retry
      const cacheBustedUrl = `${url}&t=${Date.now()}`;
      const tryFetch = async (attempt = 1) => {
        const controller = new AbortController();
        const TIMEOUT_MS = attempt === 1 ? 15000 : 25000; // 15s then 25s
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
        try {
          const resp = await fetch(cacheBustedUrl, {
            signal: controller.signal,
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
          });
          clearTimeout(timeoutId);
          return resp;
        } catch (e) {
          clearTimeout(timeoutId);
          if (attempt < 2) {
            await new Promise(r => setTimeout(r, 1200));
            return tryFetch(attempt + 1);
          }
          throw e;
        }
      };

      const response = await tryFetch();
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Combined news response:', result);
      
      if (result.success && result.data) {
        // Transform the combined news to match our frontend format
        let transformedNews = result.data.map(item => {
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
        // Rewrite image URLs through backend proxy to avoid CORS/CORP blocks
        transformedNews = transformedNews.map(n => ({
          ...n,
          wallpaperLarge: n.wallpaperLarge ? `${this.baseUrl}/api/image?url=${encodeURIComponent(n.wallpaperLarge)}` : n.wallpaperLarge,
          mediumRes: n.mediumRes ? `${this.baseUrl}/api/image?url=${encodeURIComponent(n.mediumRes)}` : n.mediumRes,
          thumbImage: n.thumbImage ? `${this.baseUrl}/api/image?url=${encodeURIComponent(n.thumbImage)}` : n.thumbImage,
          imageUrl: n.wallpaperLarge
            ? `${this.baseUrl}/api/image?url=${encodeURIComponent(n.wallpaperLarge)}`
            : (n.imageUrl ? `${this.baseUrl}/api/image?url=${encodeURIComponent(n.imageUrl)}` : n.imageUrl)
        }));

        // Apply rotation offset if specified
        if (rotationOffset > 0 && transformedNews.length > 0) {
          const rotatedNews = [...transformedNews];
          const offset = rotationOffset % rotatedNews.length;
          transformedNews = [
            ...rotatedNews.slice(offset),
            ...rotatedNews.slice(0, offset)
          ];
          console.log(`🔄 Applied rotation offset ${offset} to ${transformedNews.length} articles`);
        }
        
        console.log('🔄 Transformed news:', transformedNews.length, 'articles');
        
        const responseData = {
          news: transformedNews,
          pagination: result.pagination,
          sources: result.sources
        };
        
        // Cache the response for 2 minutes
        this.setCache(cacheKey, responseData, 120000);
        
        return responseData;
      }
      
      return {
        news: [],
        pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
        sources: { firestore: 0, external: 0, total: 0 }
      };
    } catch (error) {
      console.error('❌ Error fetching combined news:', error);
      
      // Check cache for fallback data
      const cacheKey = `combined-news-${page}-${limit}-${category || 'all'}-${rotationOffset}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log('🔄 Using cached data as fallback');
        return cachedData;
      }
      
      // No mock data fallback - return empty state
      console.log('❌ No cached data available, returning empty state');
      return {
        news: [],
        pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
        sources: { firestore: 0, external: 0, total: 0 }
      };
    }
  }
}

export default new NewsDataService(); 