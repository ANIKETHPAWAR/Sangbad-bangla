import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiUser, FiFacebook, FiGlobe } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = ({ 
  isSearchOpen, 
  setIsSearchOpen, 
  searchQuery, 
  setSearchQuery, 
  handleSearch,
  requestPermission,
  newsError,
  isConnected,
  isTranslatorOpen,
  setIsTranslatorOpen
}) => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  return (
    <div className="header">
      <div className="container">
        <div className="header-content">
          {/* Left Side - Notification Icon */}
          <div className="header-left">
            <div className="notification-icon">
              <div className="icon-wrapper" onClick={requestPermission}>
                <div className="notepad-icon">📝</div>
              </div>
              {newsError && (
                <div className="connection-status error">
                  <span>⚠️</span>
                </div>
              )}
              {isConnected && (
                <div className="connection-status connected">
                  <span>🟢</span>
                </div>
              )}
            </div>
          </div>

          {/* Center - Logo */}
          <div className="header-center">
            <Link to="/" className="logo">
              <div className="logo-text">
                <span className="logo-english">Hindustan Times</span>
                <span className="logo-bengali">বাংলা</span>
              </div>
            </Link>
          </div>

          {/* Right Side - Actions */}
          <div className="header-right">
            <button 
              className="action-btn search-btn"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
            >
              {isSearchOpen ? <FiX /> : <FiSearch />}
            </button>
            
            <button 
              className="action-btn translator-btn"
              onClick={() => setIsTranslatorOpen(!isTranslatorOpen)}
              aria-label="Translator"
              title="English to Hindi Translator"
            >
              <FiGlobe />
            </button>
            
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="action-btn facebook-btn"
              aria-label="Facebook"
            >
              <FiFacebook />
            </a>
            
            <div className="separator"></div>
            
            <button className="action-btn user-btn" aria-label="User">
              <FiUser />
            </button>
            
            {isAuthenticated ? (
              <div className="user-menu">
                <span className="user-name">{user?.name || user?.email}</span>
                <button 
                  className="logout-button"
                  onClick={logout}
                  aria-label="Logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <span 
                className="sign-in-text"
                onClick={() => navigate('/signin')}
                style={{ cursor: 'pointer' }}
              >
                Sign In
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="search-container">
          <div className="container">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="খবর খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoFocus
              />
              <button type="submit" className="search-submit">
                <FiSearch />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header; 