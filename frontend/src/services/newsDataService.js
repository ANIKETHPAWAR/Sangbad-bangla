// News Data Service - Can be replaced with real API calls
class NewsDataService {
  constructor() {
    this.baseUrl = 'https://api.hindustantimes.com/bangla';
    this.mockData = this.getMockData();
  }

  // Get mock data for development
  getMockData() {
    return {
      featuredNews: [
        {
          id: 1,
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
          title: "'I know I have to pay a lot, but India is ready'",
          subtitle: "Modi's message in the atmosphere of tariff war",
          excerpt: "America wants their dairy products to be sold at low prices in the Indian market. However, India has claimed that US dairy products are 'Amish'. In this climate, India is not bowing down to America about the trade agreement. In...",
          publishDate: '2025-08-07T10:20:00Z',
          category: 'রাজনীতি',
          author: 'রিপোর্টার',
          readTime: 3
        },
        {
          id: 2,
          imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
          title: "ক্রিকেট বিশ্বকাপে বাংলাদেশের নতুন আশা",
          subtitle: "তামিম-মুশফিকের নেতৃত্বে দল গঠন",
          excerpt: "আগামী বিশ্বকাপে বাংলাদেশের দল গঠন নিয়ে আলোচনা চলছে। তামিম ইকবাল এবং মুশফিকুর রহিমের নেতৃত্বে দল গঠনের পরিকল্পনা করা হচ্ছে...",
          publishDate: '2025-08-07T09:15:00Z',
          category: 'ক্রিকেট',
          author: 'ক্রিকেট রিপোর্টার',
          readTime: 5
        },
        {
          id: 3,
          imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
          title: "কলকাতায় নতুন মেট্রো লাইন উদ্বোধন",
          subtitle: "শহরের যাতায়াত ব্যবস্থায় নতুন মাইলফলক",
          excerpt: "কলকাতা মেট্রো রেল কর্পোরেশন আজ নতুন মেট্রো লাইন উদ্বোধন করেছে। এই লাইন শহরের পূর্ব থেকে পশ্চিম পর্যন্ত সংযোগ স্থাপন করবে...",
          publishDate: '2025-08-07T08:45:00Z',
          category: 'কলকাতা',
          author: 'শহর রিপোর্টার',
          readTime: 4
        }
      ],
      trendingNews: [
        {
          id: 4,
          imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=150&h=100&fit=crop',
          title: "Dainik Rashifal Sagittarius to Pieces: What is in store for today 7th August...",
          category: 'ভাগ্যলিপি',
          publishDate: '2025-08-07T08:00:00Z',
          isNew: true
        },
        {
          id: 5,
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=100&fit=crop',
          title: "'Inviting them...', Ranveer single-handedly took the stars who demande...",
          category: 'বায়োস্কোপ',
          publishDate: '2025-08-07T07:30:00Z'
        },
        {
          id: 6,
          imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=100&fit=crop',
          title: "Ajker Rashifal Leo to Scorpio: What is the fate of lions, daughters, cotton,...",
          category: 'ভাগ্যলিপি',
          publishDate: '2025-08-07T07:00:00Z'
        },
        {
          id: 7,
          imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=150&h=100&fit=crop',
          title: "Daily Horoscope Aries To Cancer: Who are the lucky ones today among...",
          category: 'ভাগ্যলিপি',
          publishDate: '2025-08-07T06:45:00Z'
        },
        {
          id: 8,
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=100&fit=crop',
          title: "'Jawan of this time...', friend Vivek expresses his opinion in favor of Shahruk...",
          category: 'বায়োস্কোপ',
          publishDate: '2025-08-07T06:30:00Z'
        },
        {
          id: 9,
          imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=100&fit=crop',
          title: "Navapancham Yog: A bunch of zodiac signs with Aries improving...",
          category: 'ভাগ্যলিপি',
          publishDate: '2025-08-07T06:15:00Z'
        }
      ]
    };
  }

  // Get featured news
  async getFeaturedNews() {
    try {
      // For now, return mock data
      // In production, replace with actual API call:
      // const response = await fetch(`${this.baseUrl}/featured-news`);
      // return await response.json();
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.mockData.featuredNews);
        }, 500);
      });
    } catch (error) {
      console.error('Error fetching featured news:', error);
      return [];
    }
  }

  // Get trending news
  async getTrendingNews() {
    try {
      // For now, return mock data
      // In production, replace with actual API call:
      // const response = await fetch(`${this.baseUrl}/trending-news`);
      // return await response.json();
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.mockData.trendingNews);
        }, 300);
      });
    } catch (error) {
      console.error('Error fetching trending news:', error);
      return [];
    }
  }

  // Get news by category
  async getNewsByCategory(category) {
    try {
      // For now, return mock data filtered by category
      // In production, replace with actual API call:
      // const response = await fetch(`${this.baseUrl}/news?category=${category}`);
      // return await response.json();
      
      const allNews = [...this.mockData.featuredNews, ...this.mockData.trendingNews];
      const filteredNews = allNews.filter(news => 
        news.category && news.category.toLowerCase() === category.toLowerCase()
      );
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(filteredNews);
        }, 400);
      });
    } catch (error) {
      console.error('Error fetching news by category:', error);
      return [];
    }
  }



  // Search news
  async searchNews(query) {
    try {
      // For now, return mock data filtered by search query
      // In production, replace with actual API call:
      // const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
      // return await response.json();
      
      const allNews = [...this.mockData.featuredNews, ...this.mockData.trendingNews];
      const searchResults = allNews.filter(news => 
        news.title.toLowerCase().includes(query.toLowerCase()) ||
        news.excerpt?.toLowerCase().includes(query.toLowerCase()) ||
        news.category?.toLowerCase().includes(query.toLowerCase())
      );
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(searchResults);
        }, 600);
      });
    } catch (error) {
      console.error('Error searching news:', error);
      return [];
    }
  }

  // Add new news (for real-time updates)
  addNews(newsItem) {
    if (newsItem.isFeatured) {
      this.mockData.featuredNews.unshift(newsItem);
    } else {
      this.mockData.trendingNews.unshift(newsItem);
    }
  }

  // Update news
  updateNews(newsId, updates) {
    const allNews = [...this.mockData.featuredNews, ...this.mockData.trendingNews];
    const newsIndex = allNews.findIndex(news => news.id === newsId);
    
    if (newsIndex !== -1) {
      allNews[newsIndex] = { ...allNews[newsIndex], ...updates };
    }
  }

  // Delete news
  deleteNews(newsId) {
    this.mockData.featuredNews = this.mockData.featuredNews.filter(news => news.id !== newsId);
    this.mockData.trendingNews = this.mockData.trendingNews.filter(news => news.id !== newsId);
  }
}

export default new NewsDataService(); 