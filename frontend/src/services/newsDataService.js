// News Data Service - Integrated with Hindustan Times Bangla API
import { mockNewsData } from '../data/mockNewsData.js';

class NewsDataService {
  constructor() {
    // Use proxy URL to avoid CORS issues
    this.baseUrl = '/api';
  }

  // Transform API response to match our frontend structure
  transformNewsItem(apiItem) {
    console.log('Transforming API item:', apiItem);
    const transformed = {
      id: apiItem.id || apiItem.itemId,
      imageUrl: apiItem.imageUrl || apiItem.wallpaperLarge || apiItem.mediumRes || apiItem.thumbImage,
      title: apiItem.title || apiItem.headLine,
      excerpt: apiItem.excerpt || apiItem.shortDescription,
      publishDate: this.parseDate(apiItem.publishDate || apiItem.publishedDate),
      readTime: apiItem.readTime || apiItem.timeToRead || 3,
      detailUrl: apiItem.detailUrl || apiItem.detailFeedURL,
      websiteUrl: apiItem.websiteUrl || apiItem.websiteURL,
      contentType: apiItem.contentType,
      sectionName: apiItem.sectionName || apiItem.section,
      category: apiItem.category || apiItem.sectionName || apiItem.section,
      authorName: apiItem.authorName,
      keywords: apiItem.keywords || []
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
      // Force fresh data with aggressive cache busting
      const timestamp = Date.now();
      const randomParam = Math.random().toString(36).substring(7);
      const response = await fetch(`${this.baseUrl}/popular-stories?t=${timestamp}&r=${randomParam}&fresh=true`, {
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
      console.log('Fresh Popular Stories API Response:', data);
      
      if (data.success && data.stories) {
        // Transform and sort by publish date - latest first
        const transformedNews = data.stories
          .map(item => this.transformNewsItem(item))
          .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
          .slice(0, 10);
        
        console.log('Fresh Transformed and Sorted Featured News (Latest First):', transformedNews);
        return transformedNews;
      }
      return [];
    } catch (error) {
      console.error('Error fetching popular stories from API:', error);
      return this.getMockFeaturedNews();
    }
  }

  // Get trending news from trending stories API
  async getTrendingNews() {
    try {
      // First try to get trending stories from a dedicated trending endpoint
      let response = await fetch(`${this.baseUrl}/trending-stories`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.stories) {
          console.log('Fresh Trending Stories API Response:', data);
          // Sort by publish date - latest first
          return data.stories
            .map(item => this.transformNewsItem(item))
            .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
            .slice(0, 8);
        }
      }
      
      // Fallback: Get fresh trending data by calling popular stories with aggressive cache busting
      const timestamp = Date.now();
      const randomParam = Math.random().toString(36).substring(7);
      response = await fetch(`${this.baseUrl}/popular-stories?t=${timestamp}&r=${randomParam}&trending=true`, {
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
        // Transform all stories first, then sort by publish date
        const allTransformedStories = data.stories
          .map(item => this.transformNewsItem(item))
          .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        
        // Get trending news by taking items from different parts, but prioritize latest
        const trendingItems = [
          ...allTransformedStories.slice(0, 3),     // Latest 3 stories
          ...allTransformedStories.slice(4, 7),     // Skip one, take next 3
          ...allTransformedStories.slice(8, 10)     // Take 2 more recent ones
        ];
        
        console.log('Fresh Trending News (Latest First):', trendingItems);
        return trendingItems
          .slice(0, 8)
          .filter(item => item.publishDate); // Ensure we have valid dates
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching trending news from API:', error);
      // Fallback to mock data if API fails
      return this.getMockTrendingNews();
    }
  }

  // Get fresh trending news with enhanced data selection
  async getFreshTrendingNews() {
    try {
      // Add cache busting to ensure fresh data
      const timestamp = Date.now();
      const response = await fetch(`${this.baseUrl}/popular-stories?t=${timestamp}&fresh=true`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.stories) {
        // Transform and sort by publish date - latest first
        const allTransformedStories = data.stories
          .map(item => this.transformNewsItem(item))
          .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        
        // Create diverse trending selection while prioritizing latest news
        let trendingSelection = [];
        
        if (allTransformedStories.length >= 12) {
          trendingSelection = [
            ...allTransformedStories.slice(0, 2),    // Latest 2 stories
            ...allTransformedStories.slice(3, 5),    // Skip one, take next 2
            ...allTransformedStories.slice(6, 8),    // Skip one, take next 2
            ...allTransformedStories.slice(9, 11)    // Take 2 more recent ones
          ];
        } else if (allTransformedStories.length >= 8) {
          trendingSelection = [
            ...allTransformedStories.slice(0, 2),    // Latest 2 stories
            ...allTransformedStories.slice(2, 4),    // Take next 2
            ...allTransformedStories.slice(5, 7),    // Skip one, take next 2
            ...allTransformedStories.slice(7, 9)     // Take last 2
          ];
        } else {
          // If we have fewer stories, prioritize latest
          trendingSelection = allTransformedStories.slice(0, Math.min(8, allTransformedStories.length));
        }
        
        console.log('Enhanced Fresh Trending News (Latest First):', trendingSelection);
        return trendingSelection
          .slice(0, 8)
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
      const response = await fetch(`${this.baseUrl}/popular-stories?t=${timestamp}&r=${randomParam}&set=${setIndex}&fresh=true`, {
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
        // Transform and sort by publish date - latest first
        const allTransformedStories = data.stories
          .map(item => this.transformNewsItem(item))
          .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        
        let trendingSet = [];
        
        // Create different trending sets while prioritizing latest news
        switch (setIndex % 3) {
          case 0: // First set: latest stories + some variety
            trendingSet = [
              ...allTransformedStories.slice(0, 3),    // Latest 3 stories
              ...allTransformedStories.slice(4, 7),    // Skip one, take next 3
              ...allTransformedStories.slice(8, 10)    // Take 2 more recent ones
            ];
            break;
          case 1: // Second set: latest stories + different variety
            trendingSet = [
              ...allTransformedStories.slice(0, 2),    // Latest 2 stories
              ...allTransformedStories.slice(3, 5),    // Take next 2
              ...allTransformedStories.slice(6, 8),    // Take next 2
              ...allTransformedStories.slice(9, 11)    // Take 2 more
            ];
            break;
          case 2: // Third set: latest stories + mixed variety
            trendingSet = [
              ...allTransformedStories.slice(0, 4),    // Latest 4 stories
              ...allTransformedStories.slice(5, 7),    // Skip one, take next 2
              ...allTransformedStories.slice(8, 10)    // Take 2 more
            ];
            break;
          default:
            trendingSet = allTransformedStories.slice(0, 8); // Default: latest 8
        }
        
        console.log(`Fresh Trending News Set ${setIndex} (Latest First):`, trendingSet);
        return trendingSet
          .slice(0, 8)
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
      // Use the section feed API with the category name
      const response = await fetch(`${this.baseUrl}/section-feed/${encodeURIComponent(category)}/10`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.stories) {
        // Transform and sort by publish date - latest first
        return data.stories
          .map(item => this.transformNewsItem(item))
          .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching news by category from API:', error);
      return this.getMockNewsByCategory(category);
    }
  }

  // Search news from popular stories
  async searchNews(query) {
    try {
      const response = await fetch(`${this.baseUrl}/popular-stories`);
      
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
        
        // Transform and sort by publish date - latest first
        return searchResults
          .map(item => this.transformNewsItem(item))
          .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
      }
      
      return [];
    } catch (error) {
      console.error('Error searching news from API:', error);
      return this.getMockSearchNews(query);
    }
  }

  // Get section feed for detailed article view
  async getSectionFeed(sectionName, numStories = 10) {
    try {
      const response = await fetch(`${this.baseUrl}/api/app/sectionfeedperp/v1/{sectionName}/{numStories}
`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.stories) {
        return data.stories.map(item => this.transformNewsItem(item));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching section feed from API:', error);
      return [];
    }
  }

  async getDetailedArticle(sectionName, numberOfStories = 10) {
    try {
      // Use the backend proxy endpoint instead of calling external API directly
      const response = await fetch(`/api/proxy-hindustantimes/section/${sectionName}/${numberOfStories}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Detailed Article API Response (via proxy):', data);
      console.log('Response structure check:', {
        hasContent: !!data.content,
        hasSectionItems: !!(data.content && data.content.sectionItems),
        isArray: Array.isArray(data.content?.sectionItems),
        sectionItemsLength: data.content?.sectionItems?.length || 0
      });
      
      if (data.content && data.content.sectionItems && Array.isArray(data.content.sectionItems)) {
        // Transform and sort by publish date - latest first
        const transformedStories = this.transformDetailedStories(data.content.sectionItems);
        return transformedStories.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
      } else {
        // If the external API returns an empty sectionItems array or no content,
        // it might mean no articles for that section, or an invalid section name.
        // We should still return an empty array to prevent errors.
        if (data.content && data.content.sectionItems === null) {
          console.warn('No stories found for section:', sectionName);
          return [];
        }
        console.warn('Unexpected API response structure:', data);
        throw new Error('Invalid response format from API - missing content.sectionItems');
      }
    } catch (error) {
      console.error('Error fetching detailed article:', error);
      throw error;
    }
  }

  transformDetailedStories(stories) {
    return stories.map(item => ({
      id: item.itemId || item.id || item.storyId,
      title: item.headLine || item.title || item.headline,
      subtitle: item.subHead || item.subtitle || item.subHeadline,
      excerpt: item.shortDescription || item.excerpt || item.description,
      content: item.content || item.body,
      imageUrl: item.wallpaperLarge || item.mediumRes || item.thumbImage || item.imageUrl || item.image || item.leadImage,
      publishDate: this.parseDate(item.publishedDate || item.publishDate || item.date),
      readTime: item.timeToRead || item.readTime || item.readingTime || 3,
      authorName: item.authorName || item.author || item.byline || '',
      category: item.section || item.category || '',
      contentType: item.contentType || 'News',
      detailUrl: item.detailFeedURL || item.detailUrl || item.url || item.link,
      websiteUrl: item.websiteURL || item.websiteUrl || item.sourceUrl,
      keywords: item.keywords || item.tags || [],
      sectionName: item.section || item.sectionName || ''
    }));
  }

  // Fallback mock data methods
  getMockFeaturedNews() {
    return mockNewsData.featuredNews;
  }

  getMockTrendingNews() {
    return mockNewsData.trendingNews;
  }

  getMockNewsByCategory(category) {
    const allNews = [...mockNewsData.featuredNews, ...mockNewsData.trendingNews];
    return allNews.filter(news => 
      news.category && news.category.toLowerCase().includes(category.toLowerCase())
    );
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
      const response = await fetch('/api/cricket-data');
      
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
}

export default new NewsDataService(); 