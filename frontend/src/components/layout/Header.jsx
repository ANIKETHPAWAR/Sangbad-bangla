import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiUser, FiFacebook, FiGlobe } from 'react-icons/fi';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from '../LoginButton';
import LogoutButton from '../LogoutButton';
import logo from '../../assets/logo.jpg';
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
  const { user, logout, isAuthenticated } = useAuth0();
  return (
    <div className="header">
      <div className="container">
        <div className="header-content">
          {/* Left Side - Notification Icon */}
          

          {/* Center - Logo */}
          <div className="header-center">
            <Link to="/" className="logo">
              <img src={logo} alt="Sangbad Bangla" className="logo-image" />
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
            
            {isAuthenticated ? (
              <div className="user-menu">
                <span className="user-greeting">Hello,</span>
                <span className="user-name">{user?.name || user?.email}</span>
                <LogoutButton />
              </div>
            ) : (
              <LoginButton />
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