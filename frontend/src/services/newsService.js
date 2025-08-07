import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.hindustantimes.com/bangla';
const API_KEY = import.meta.env.VITE_API_KEY || 'your-api-key';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp for caching
    config.params = { ...config.params, _t: Date.now() };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// News Service Class
class NewsService {
  // Get breaking news
  async getBreakingNews() {
    try {
      const response = await api.get('/breaking-news');
      return response;
    } catch (error) {
      console.error('Error fetching breaking news:', error);
      // Return mock data as fallback
      return this.getMockBreakingNews();
    }
  }

  // Get news by category
  async getNewsByCategory(category, page = 1, limit = 20) {
    try {
      const response = await api.get(`/news/category/${category}`, {
        params: { page, limit }
      });
      return response;
    } catch (error) {
      console.error(`Error fetching ${category} news:`, error);
      return this.getMockNewsByCategory(category, page, limit);
    }
  }

  // Get article by ID
  async getArticleById(articleId) {
    try {
      const response = await api.get(`/articles/${articleId}`);
      return response;
    } catch (error) {
      console.error('Error fetching article:', error);
      return this.getMockArticle(articleId);
    }
  }

  // Search articles
  async searchArticles(query, filters = {}) {
    try {
      const response = await api.get('/search', {
        params: { q: query, ...filters }
      });
      return response;
    } catch (error) {
      console.error('Error searching articles:', error);
      return this.getMockSearchResults(query);
    }
  }

  // Get trending news
  async getTrendingNews() {
    try {
      const response = await api.get('/trending');
      return response;
    } catch (error) {
      console.error('Error fetching trending news:', error);
      return this.getMockTrendingNews();
    }
  }

  // Get latest news
  async getLatestNews(limit = 10) {
    try {
      const response = await api.get('/latest', {
        params: { limit }
      });
      return response;
    } catch (error) {
      console.error('Error fetching latest news:', error);
      return this.getMockLatestNews(limit);
    }
  }

  // Get news by region
  async getNewsByRegion(region) {
    try {
      const response = await api.get(`/news/region/${region}`);
      return response;
    } catch (error) {
      console.error(`Error fetching ${region} news:`, error);
      return this.getMockNewsByRegion(region);
    }
  }

  // Get related articles
  async getRelatedArticles(articleId, limit = 5) {
    try {
      const response = await api.get(`/articles/${articleId}/related`, {
        params: { limit }
      });
      return response;
    } catch (error) {
      console.error('Error fetching related articles:', error);
      return this.getMockRelatedArticles(limit);
    }
  }

  // Real-time news updates using polling only (WebSocket disabled for now)
  subscribeToBreakingNews(callback) {
    // Use polling instead of WebSocket to avoid connection errors
    const interval = setInterval(async () => {
      try {
        const breakingNews = await this.getBreakingNews();
        callback(breakingNews);
      } catch (error) {
        console.error('Error in polling breaking news:', error);
      }
    }, 30000); // Poll every 30 seconds
    
    return { close: () => clearInterval(interval) };
  }

  // Mock data methods for development/testing
  getMockBreakingNews() {
    return {
      success: true,
      data: [
        {
          id: '1',
          title: 'বাংলায় নতুন রাজনৈতিক পরিস্থিতি - সর্বশেষ আপডেট',
          category: 'politics',
          timestamp: new Date().toISOString(),
          priority: 'high'
        },
        {
          id: '2',
          title: 'কলকাতায় আজকের আবহাওয়া - বৃষ্টির সম্ভাবনা',
          category: 'weather',
          timestamp: new Date().toISOString(),
          priority: 'medium'
        },
        {
          id: '3',
          title: 'ক্রিকেটে ভারতের জয় - অস্ট্রেলিয়ার বিরুদ্ধে',
          category: 'sports',
          timestamp: new Date().toISOString(),
          priority: 'high'
        },
        {
          id: '4',
          title: 'বাংলা চলচ্চিত্রে নতুন সাফল্য - বক্স অফিসে রেকর্ড',
          category: 'entertainment',
          timestamp: new Date().toISOString(),
          priority: 'medium'
        }
      ]
    };
  }

  getMockNewsByCategory(category, page = 1, limit = 20) {
    const mockArticles = [];
    const categories = {
      'all-news': 'সব খবর',
      'popular': 'জনপ্রিয়',
      'cricket': 'ক্রিকেট',
      'bengal-face': 'বাংলার মুখ',
      'astrology': 'ভাগ্যলিপি',
      'football': 'ফুটবল',
      'bioscope': 'বায়োস্কোপ',
      'photo-gallery': 'ছবিঘর',
      'kolkata': 'কলকাতা',
      'careers': 'কর্মখালি',
      'web-stories': 'ওয়েবস্টোরি',
      'lifestyle': 'টুকিটাকি'
    };

    for (let i = 0; i < limit; i++) {
      mockArticles.push({
        id: `${category}-${page}-${i + 1}`,
        title: `${categories[category] || category} - নমুনা খবর ${i + 1}`,
        excerpt: `এটি ${categories[category] || category} বিভাগের একটি নমুনা খবর। এখানে খবরের সংক্ষিপ্ত বিবরণ দেওয়া হয়েছে।`,
        category: category,
        author: 'নিউজ ডেস্ক',
        publishedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        featuredImage: `https://picsum.photos/400/250?random=${Math.random()}`,
        readTime: Math.floor(Math.random() * 10) + 2,
        views: Math.floor(Math.random() * 10000) + 100
      });
    }

    return {
      success: true,
      data: mockArticles,
      pagination: {
        page,
        limit,
        total: 100,
        totalPages: Math.ceil(100 / limit)
      }
    };
  }

  getMockArticle(articleId) {
    return {
      success: true,
      data: {
        id: articleId,
        title: 'নমুনা খবরের শিরোনাম - বিস্তারিত বিবরণ',
        content: `
          <p>এটি একটি নমুনা খবরের বিস্তারিত বিবরণ। এখানে খবরের সম্পূর্ণ বিষয়বস্তু দেওয়া হয়েছে।</p>
          <p>দ্বিতীয় অনুচ্ছেদে আরও বিস্তারিত তথ্য দেওয়া হয়েছে।</p>
          <h3>উপশিরোনাম</h3>
          <p>উপশিরোনামের অধীনে আরও তথ্য দেওয়া হয়েছে।</p>
        `,
        excerpt: 'এটি একটি নমুনা খবরের সংক্ষিপ্ত বিবরণ।',
        category: 'general',
        author: 'নিউজ ডেস্ক',
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        featuredImage: `https://picsum.photos/800/400?random=${Math.random()}`,
        readTime: 5,
        views: 15000,
        tags: ['নমুনা', 'খবর', 'বাংলা'],
        relatedArticles: []
      }
    };
  }

  getMockSearchResults(query) {
    const results = [];
    for (let i = 0; i < 10; i++) {
      results.push({
        id: `search-${i + 1}`,
        title: `${query} সম্পর্কিত খবর ${i + 1}`,
        excerpt: `${query} নিয়ে একটি নমুনা খবর।`,
        category: 'search',
        publishedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        featuredImage: `https://picsum.photos/300/200?random=${Math.random()}`
      });
    }

    return {
      success: true,
      data: results,
      query,
      total: results.length
    };
  }

  getMockTrendingNews() {
    return {
      success: true,
      data: [
        {
          id: 'trending-1',
          title: 'ট্রেন্ডিং খবর ১ - সর্বাধিক পঠিত',
          views: 50000,
          category: 'trending'
        },
        {
          id: 'trending-2',
          title: 'ট্রেন্ডিং খবর ২ - জনপ্রিয়',
          views: 45000,
          category: 'trending'
        }
      ]
    };
  }

  getMockLatestNews(limit = 10) {
    const news = [];
    for (let i = 0; i < limit; i++) {
      news.push({
        id: `latest-${i + 1}`,
        title: `সর্বশেষ খবর ${i + 1}`,
        excerpt: `সর্বশেষ খবরের সংক্ষিপ্ত বিবরণ ${i + 1}`,
        publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
        category: 'latest'
      });
    }
    return { success: true, data: news };
  }

  getMockNewsByRegion(region) {
    return {
      success: true,
      data: [
        {
          id: `${region}-1`,
          title: `${region} অঞ্চলের খবর ১`,
          region: region,
          publishedAt: new Date().toISOString()
        }
      ]
    };
  }

  getMockRelatedArticles(limit = 5) {
    const articles = [];
    for (let i = 0; i < limit; i++) {
      articles.push({
        id: `related-${i + 1}`,
        title: `সম্পর্কিত খবর ${i + 1}`,
        excerpt: `সম্পর্কিত খবরের সংক্ষিপ্ত বিবরণ ${i + 1}`,
        publishedAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
      });
    }
    return { success: true, data: articles };
  }
}

// Create and export service instance
const newsService = new NewsService();

export default newsService; 