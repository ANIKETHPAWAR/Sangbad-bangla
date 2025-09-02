import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../services/authService';
import './NewsForm.css';

const NewsForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    imageUrl: '',
    tags: [],
    author: 'Admin',
    publishDate: new Date().toISOString().slice(0, 16), // Current date and time
    readTime: 3
  });

  const [newTag, setNewTag] = useState('');

  // Updated categories to match Hindustan Times structure
  const categories = [
    'national',
    'international', 
    'politics',
    'economy',
    'sports',
    'entertainment',
    'technology',
    'health',
    'education',
    'environment',
    'astrology',
    'lifestyle',
    'bengal',
    'cricket',
    'football',
    'breaking',
    'special-report'
  ];

  useEffect(() => {
    if (id) {
      fetchNews();
    }
  }, [id]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const headers = await authService.getAuthHeaders();
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://sangbadbangla1.onrender.com';
      const response = await fetch(`${baseUrl}/api/admin/news/${id}`, { headers: headers });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const news = data.data;
          setFormData({
            title: news.title || '',
            content: news.content || '',
            excerpt: news.excerpt || '',
            category: news.category || '',
            imageUrl: news.imageUrl || '',
            tags: news.tags || [],
            author: news.author || 'Admin',
            publishDate: news.publishDate ? new Date(news.publishDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
            readTime: news.readTime || 3
          });
        }
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('Failed to fetch news details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagAdd = (e) => {
    e.preventDefault();
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const headers = await authService.getAuthHeaders();
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://sangbadbangla1.onrender.com';
      const url = id ? `${baseUrl}/api/admin/news/${id}` : `${baseUrl}/api/admin/news`;
      const method = id ? 'PUT' : 'POST';

      // Prepare data for submission
      const submitData = {
        ...formData,
        publishDate: new Date(formData.publishDate).toISOString(),
        readTime: parseInt(formData.readTime) || 3
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuccess(id ? 'News updated successfully!' : 'News created successfully!');
          setTimeout(() => {
            navigate('/admin');
          }, 1500);
        } else {
          throw new Error(data.message || 'Failed to save news');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving news:', error);
      setError(error.message || 'Failed to save news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin');
  };

  return (
    <div className="news-form-container">
      <div className="form-header">
        <h1 className="form-title">
          {id ? 'Edit News Article' : 'Create New News Article'}
        </h1>
        <p className="form-subtitle">
          {id ? 'Update the news article details below' : 'Fill in the details to create a new news article'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="news-form">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <div className="form-section">
          <h2 className="section-title">Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title <span className="required-indicator">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter news title"
              required
            />
            <div className="help-text">Enter a compelling headline for your news article</div>
          </div>

          <div className="form-group">
            <label htmlFor="excerpt" className="form-label">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Enter a brief summary of the news..."
              rows="3"
            />
            <div className="help-text">A short summary that appears in news listings (optional)</div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Category <span className="required-indicator">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <div className="help-text">Choose the most appropriate category for your news</div>
            </div>

            <div className="form-group">
              <label htmlFor="readTime" className="form-label">
                Read Time (minutes)
              </label>
              <input
                type="number"
                id="readTime"
                name="readTime"
                value={formData.readTime}
                onChange={handleInputChange}
                className="form-input"
                min="1"
                max="60"
              />
              <div className="help-text">Estimated time to read the article</div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="author" className="form-label">
                Author
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter author name"
              />
              <div className="help-text">Name of the article author</div>
            </div>

            <div className="form-group">
              <label htmlFor="publishDate" className="form-label">
                Publish Date & Time
              </label>
              <input
                type="datetime-local"
                id="publishDate"
                name="publishDate"
                value={formData.publishDate}
                onChange={handleInputChange}
                className="form-input"
              />
              <div className="help-text">When this news should be published</div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl" className="form-label">
              Image URL
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              className="form-input"
              placeholder="https://example.com/image.jpg"
            />
            <div className="help-text">URL of the featured image for this news article</div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">Content</h2>
          
          <div className="form-group">
            <label htmlFor="content" className="form-label">
              Content <span className="required-indicator">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Write the news content here..."
              required
            />
            <div className="help-text">Write the full news article content</div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">Tags</h2>
          
          <div className="form-group">
            <label htmlFor="tags" className="form-label">
              Tags
            </label>
            
            {formData.tags.length > 0 && (
              <div className="tags-container">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="tag-remove"
                      title="Remove tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="add-tag-container">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                className="add-tag-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTagAdd(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="add-tag-button"
                disabled={!newTag.trim()}
              >
                Add
              </button>
            </div>
            <div className="help-text">Add relevant tags to help categorize and search for this news</div>
          </div>
        </div>

        {formData.imageUrl && (
          <div className="form-section">
            <h2 className="section-title">Image Preview</h2>
            <div className="image-preview">
              <img src={formData.imageUrl} alt="News preview" />
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-button-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="save-button"
            disabled={loading}
          >
            {loading && <span className="loading-spinner"></span>}
            {loading ? 'Saving...' : (id ? 'Update News' : 'Create News')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewsForm;
