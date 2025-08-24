const express = require('express');
const { verifyAuth, requireAdmin } = require('../middleware/auth');
const newsService = require('../services/newsService');

const router = express.Router();

// Apply authentication verification and admin role check to all admin routes
router.use(verifyAuth, requireAdmin);

// Get admin dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await newsService.getNewsStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics'
    });
  }
});

// Create new news article
router.post('/news', async (req, res) => {
  try {
    const { title, content, category, imageUrl, tags, author } = req.body;
    
    // Validate required fields
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and category are required'
      });
    }

    const newsData = {
      title,
      content,
      category,
      imageUrl: imageUrl || '', // External URL or empty
      tags: tags || [],
      author: author || 'Admin'
    };

    const result = await newsService.createNews(newsData);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create news article'
    });
  }
});

// Get all news articles with pagination
router.get('/news', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await newsService.getAllNews(page, limit);
    res.json(result);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news articles'
    });
  }
});

// Search news articles
router.get('/news/search', async (req, res) => {
  try {
    const { q } = req.query;
    const limit = parseInt(req.query.limit) || 20;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const result = await newsService.searchNews(q, limit);
    res.json(result);
  } catch (error) {
    console.error('Error searching news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search news articles'
    });
  }
});

// Get single news article
router.get('/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await newsService.getNewsById(id);
    res.json(result);
  } catch (error) {
    console.error('Error fetching news by ID:', error);
    if (error.message === 'News not found') {
      res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch news article'
      });
    }
  }
});

// Update news article
router.put('/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.source;
    
    const result = await newsService.updateNews(id, updateData);
    res.json(result);
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update news article'
    });
  }
});

// Delete news article (soft delete)
router.delete('/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await newsService.deleteNews(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete news article'
    });
  }
});

module.exports = router;




