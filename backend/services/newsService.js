const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

class NewsService {
  constructor() {
    this.db = admin.firestore();
    this.newsCollection = 'news';
  }

  /**
   * Create a new news article
   */
  async createNews(newsData) {
    try {
      const newsId = uuidv4();
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      
      const news = {
        id: newsId,
        title: newsData.title,
        content: newsData.content,
        excerpt: newsData.excerpt || newsData.content?.substring(0, 200) + '...',
        category: newsData.category,
        imageUrl: newsData.imageUrl || '', // External URL or empty
        tags: newsData.tags || [],
        author: newsData.author || 'Admin',
        readTime: newsData.readTime || 3,
        publishDate: newsData.publishDate ? new Date(newsData.publishDate) : timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
        published: true,
        source: 'internal'
      };

      await this.db.collection(this.newsCollection).doc(newsId).set(news);
      
      return {
        success: true,
        data: news,
        message: 'News created successfully'
      };
    } catch (error) {
      console.error('Error creating news:', error);
      throw new Error('Failed to create news');
    }
  }

  /**
   * Update an existing news article
   */
  async updateNews(newsId, updateData) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      
      // Prepare update data with new fields
      const updateFields = {
        ...updateData,
        updatedAt: timestamp
      };

      // Handle excerpt field
      if (updateData.content && !updateData.excerpt) {
        updateFields.excerpt = updateData.content.substring(0, 200) + '...';
      }

      // Handle publishDate field
      if (updateData.publishDate) {
        updateFields.publishDate = new Date(updateData.publishDate);
      }

      // Handle readTime field
      if (updateData.readTime) {
        updateFields.readTime = parseInt(updateData.readTime) || 3;
      }

      await this.db.collection(this.newsCollection).doc(newsId).update(updateFields);
      
      return {
        success: true,
        message: 'News updated successfully'
      };
    } catch (error) {
      console.error('Error updating news:', error);
      throw new Error('Failed to update news');
    }
  }

  /**
   * Delete a news article (soft delete)
   */
  async deleteNews(newsId) {
    try {
      await this.db.collection(this.newsCollection).doc(newsId).update({
        published: false,
        deletedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return {
        success: true,
        message: 'News deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting news:', error);
      throw new Error('Failed to delete news');
    }
  }

  /**
   * Get a single news article
   */
  async getNewsById(newsId) {
    try {
      const doc = await this.db.collection(this.newsCollection).doc(newsId).get();
      
      if (!doc.exists) {
        throw new Error('News not found');
      }
      
      const data = doc.data();
      // Convert Firestore timestamps to ISO strings for frontend compatibility
      const newsItem = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
        publishDate: data.publishDate ? (data.publishDate.toDate ? data.publishDate.toDate().toISOString() : data.publishDate) : new Date().toISOString()
      };
      
      return {
        success: true,
        data: newsItem
      };
    } catch (error) {
      console.error('Error getting news by ID:', error);
      throw new Error('Failed to get news');
    }
  }

  /**
   * Get all news articles with pagination
   */
  async getAllNews(page = 1, limit = 20) {
    try {
      // Simplified query that doesn't require complex indexes
      let query = this.db.collection(this.newsCollection)
        .where('published', '==', true);
      
      const snapshot = await query.get();
      
      const news = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Convert Firestore timestamps to ISO strings for frontend compatibility
        const newsItem = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
          publishDate: data.publishDate ? (data.publishDate.toDate ? data.publishDate.toDate().toISOString() : data.publishDate) : new Date().toISOString()
        };
        news.push(newsItem);
      });
      
      // Sort in memory instead of in Firestore
      news.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA; // Descending order (newest first)
      });
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedNews = news.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: paginatedNews,
        pagination: {
          page,
          limit,
          total: news.length,
          pages: Math.ceil(news.length / limit)
        }
      };
    } catch (error) {
      console.error('Error getting all news:', error);
      throw new Error('Failed to get news');
    }
  }

  /**
   * Get news by category
   */
  async getNewsByCategory(category, limit = 20) {
    try {
      // Use equality filters only to avoid composite index requirements,
      // then sort in memory by createdAt desc and apply the limit.
      // Query only by category to avoid composite index requirements,
      // we'll filter by published in memory.
      const snapshot = await this.db.collection(this.newsCollection)
        .where('category', '==', category)
        .get();
      
      const news = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Convert Firestore timestamps to ISO strings for frontend compatibility
        const newsItem = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
          publishDate: data.publishDate ? (data.publishDate.toDate ? data.publishDate.toDate().toISOString() : data.publishDate) : new Date().toISOString()
        };
        // Only include published items
        if (newsItem.published !== false) {
          news.push(newsItem);
        }
      });

      // Sort newest first and apply limit
      news.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const limited = news.slice(0, limit);
      
      return {
        success: true,
        data: limited,
        category,
        count: limited.length
      };
    } catch (error) {
      console.error(`Error getting news by category ${category}:`, error);
      throw new Error(`Failed to get news for category: ${category}`);
    }
  }

  /**
   * Search news articles
   */
  async searchNews(query, limit = 20) {
    try {
      // Simple search implementation
      const snapshot = await this.db.collection(this.newsCollection)
        .where('published', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      const news = [];
      const searchTerm = query.toLowerCase();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.title.toLowerCase().includes(searchTerm) ||
            data.content.toLowerCase().includes(searchTerm) ||
            data.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
          news.push({ id: doc.id, ...data });
        }
      });
      
      return {
        success: true,
        data: news,
        query
      };
    } catch (error) {
      console.error('Error searching news:', error);
      throw new Error('Failed to search news');
    }
  }

  /**
   * Get news statistics
   */
  async getNewsStats() {
    try {
      // Get all news (both published and unpublished)
      const allNewsSnapshot = await this.db.collection(this.newsCollection).get();
      
      // Get published news
      const publishedSnapshot = await this.db.collection(this.newsCollection)
        .where('published', '==', true)
        .get();
      
      // Get unpublished/deleted news
      const unpublishedSnapshot = await this.db.collection(this.newsCollection)
        .where('published', '==', false)
        .get();
      
      const totalNews = allNewsSnapshot.size;
      const published = publishedSnapshot.size;
      const deleted = unpublishedSnapshot.size;
      
      // Count unique categories
      const categories = new Set();
      allNewsSnapshot.forEach(doc => {
        const category = doc.data().category;
        if (category) {
          categories.add(category);
        }
      });
      
      return {
        success: true,
        data: {
          totalNews,
          published,
          deleted,
          categories: categories.size,
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error getting news stats:', error);
      throw new Error('Failed to get news statistics');
    }
  }
}

module.exports = new NewsService();
