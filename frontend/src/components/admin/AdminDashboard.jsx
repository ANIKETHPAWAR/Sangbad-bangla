import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [news, setNews] = useState([]);
  const [stats, setStats] = useState({
    totalNews: 0,
    published: 0,
    deleted: 0,
    categories: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNews();
    fetchStats();
  }, []);

  // Debug useEffect to monitor stats changes
  useEffect(() => {
    console.log('AdminDashboard - stats state changed:', stats);
  }, [stats]);

  const fetchNews = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const headers = await authService.getAuthHeaders();
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://sangbadbangla1.onrender.com';
      let url = `${baseUrl}/api/admin/news?page=${page}&limit=20`;
      if (search) {
        url = `${baseUrl}/api/admin/news/search?q=${encodeURIComponent(search)}&limit=20`;
      }
      const response = await fetch(url, { headers: headers });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setNews(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
        setCurrentPage(page);
        setError('');
      } else {
        throw new Error(data.message || 'Failed to fetch news');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('Failed to fetch news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Fetching admin stats...');
      const headers = await authService.getAuthHeaders();
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://sangbadbangla1.onrender.com';
      const response = await fetch(`${baseUrl}/api/admin/stats`, { headers: headers });
      
      console.log('Stats response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Stats response data:', data);
        
        if (data.success && data.data) {
          console.log('Setting stats:', data.data);
          setStats(data.data);
        } else {
          console.error('Stats response not successful:', data);
          // Set default stats if response is not successful
          setStats({
            totalNews: 0,
            published: 0,
            deleted: 0,
            categories: 0
          });
        }
      } else {
        console.error('Stats response not ok:', response.status, response.statusText);
        // Set default stats on error
        setStats({
          totalNews: 0,
          published: 0,
          deleted: 0,
          categories: 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats on error
      setStats({
        totalNews: 0,
        published: 0,
        deleted: 0,
        categories: 0
      });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNews(1, searchTerm);
  };

  const handleRefresh = () => {
    fetchNews(1, '');
    fetchStats();
  };

  const handleDelete = async (newsId) => {
    if (!window.confirm('Are you sure you want to delete this news article?')) {
      return;
    }

    try {
      const headers = await authService.getAuthHeaders();
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://sangbadbangla1.onrender.com';
      const response = await fetch(`${baseUrl}/api/admin/news/${newsId}`, {
        method: 'DELETE',
        headers: headers
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Refresh the news list and stats
          fetchNews(currentPage, searchTerm);
          fetchStats();
        } else {
          alert('Failed to delete news: ' + data.message);
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      alert('Failed to delete news. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No Date';
    try {
      let date;
      
      // Handle different date formats
      if (dateString instanceof Date) {
        date = dateString;
      } else if (typeof dateString === 'string') {
        // Try to parse the date string
        date = new Date(dateString);
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          console.warn('Invalid date string:', dateString);
          return 'Invalid Date';
        }
      } else if (dateString && typeof dateString === 'object' && dateString.toDate) {
        // Handle Firestore timestamp objects
        date = dateString.toDate();
      } else {
        console.warn('Unsupported date format:', dateString);
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'Date string:', dateString);
      return 'Invalid Date';
    }
  };

  const getStatusText = (published) => {
    return published ? 'Published' : 'Draft';
  };

  const getStatusClass = (published) => {
    return published ? 'news-status' : 'news-status';
  };

  if (loading && news.length === 0) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <p className="dashboard-subtitle">Manage your news articles</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📰</div>
          <div className="stat-value">{stats.totalNews}</div>
          <div className="stat-label">Total News</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.published}</div>
          <div className="stat-label">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🗑️</div>
          <div className="stat-value">{stats.deleted}</div>
          <div className="stat-label">Deleted</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{stats.categories}</div>
          <div className="stat-label">Categories</div>
        </div>
      </div>

      <div className="controls-section">
        <form onSubmit={handleSearch} className="search-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search news..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
        
        <div className="button-group">
          <Link to="/admin/new" className="btn btn-primary">
            + New News
          </Link>
          <button onClick={handleRefresh} className="btn btn-secondary">
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => fetchNews()} className="btn btn-primary" style={{ marginLeft: '1rem' }}>
            Try Again
          </button>
        </div>
      )}

      {news.length === 0 && !loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">📰</div>
          <div className="empty-state-title">No News Found</div>
          <div className="empty-state-description">
            {searchTerm ? `No news articles match "${searchTerm}"` : 'Start by creating your first news article.'}
          </div>
          {!searchTerm && (
            <Link to="/admin/new" className="btn btn-primary">
              Create First News
            </Link>
          )}
        </div>
      ) : (
        <div className="news-table">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead className="table-header">
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {news.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="news-title">{item.title}</div>
                  </td>
                  <td>
                    <span className="news-category">{item.category}</span>
                  </td>
                  <td>
                    <span className={getStatusClass(item.published)}>
                      {getStatusText(item.published)}
                    </span>
                  </td>
                  <td>
                    <span className="news-date">{formatDate(item.createdAt)}</span>
                  </td>
                  <td>
                    <div className="news-actions">
                      <Link
                        to={`/admin/edit/${item.id}`}
                        className="action-btn edit-btn"
                        title="Edit"
                      >
                        ✏️
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="action-btn delete-btn"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => fetchNews(currentPage - 1, searchTerm)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => fetchNews(currentPage + 1, searchTerm)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
