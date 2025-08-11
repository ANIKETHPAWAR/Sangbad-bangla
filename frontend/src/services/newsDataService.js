// News Data Service - Can be replaced with real API calls
import { mockNewsData, addNewsItem, updateNewsItem, deleteNewsItem } from '../data/mockNewsData.js';

class NewsDataService {
  constructor() {
    this.baseUrl = 'https://api.hindustantimes.com/bangla';
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
          resolve(mockNewsData.featuredNews);
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
          resolve(mockNewsData.trendingNews);
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
      
      const allNews = [...mockNewsData.featuredNews, ...mockNewsData.trendingNews];
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
      
      const allNews = [...mockNewsData.featuredNews, ...mockNewsData.trendingNews];
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
    addNewsItem(newsItem);
  }

  // Update news
  updateNews(newsId, updates) {
    updateNewsItem(newsId, updates);
  }

  // Delete news
  deleteNews(newsId) {
    deleteNewsItem(newsId);
  }
}

export default new NewsDataService(); 