import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiMenu } from 'react-icons/fi';
import './Navigation.css';

const Navigation = ({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  handleNavClick,
  onSidebarToggle
}) => {
  const location = useLocation();
  const [currentDate, setCurrentDate] = useState('');

  // Update current date
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      };
      setCurrentDate(now.toLocaleDateString('bn-BD', options));
    };
    
    updateDate();
    const interval = setInterval(updateDate, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Navigation items based on the design
  const navigationItems = [
    { id: 'all-news', name: 'এক নজরে সব খবর', path: '/all-news', icon: '📰' },
    { id: 'popular', name: 'জনপ্রিয়', path: '/popular', icon: '🔥' },
    { id: 'cricket', name: 'ক্রিকেট', path: '/cricket', icon: '🏏' },
    { id: 'bengal-face', name: 'বাংলার মুখ', path: '/bengal-face', icon: '🏛️' },
    { id: 'astrology', name: 'ভাগ্যলিপি', path: '/astrology', icon: '🔮' },
    { id: 'football', name: 'ফুটবলের মহারণ', path: '/football', icon: '⚽' },
    { id: 'photo-gallery', name: 'ছবিঘর', path: '/photo-gallery', icon: '📸' },
    { id: 'careers', name: 'কর্মখালি', path: '/careers', icon: '💼' },
    { id: 'lifestyle', name: 'টুকিটাকি', path: '/lifestyle', icon: '💄' }
  ];

  return (
    <div className="navigation">
      <div className="container">
        <div className="navigation-content">
          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={onSidebarToggle}
            aria-label="Toggle sidebar"
          >
            <FiMenu />
          </button>

          {/* Home Icon */}
          <Link to="/" className="home-icon" onClick={handleNavClick}>
            <FiHome />
          </Link>

          {/* Desktop Navigation */}
          <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            {navigationItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Date Display */}
          <div className="nav-date-display">
            {currentDate}
          </div>


        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div className="mobile-header-content">
                <h3>মেনু</h3>
                <div className="mobile-date-display">{currentDate}</div>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            <div className="mobile-menu-items">
              {navigationItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  <span className="mobile-nav-icon">{item.icon}</span>
                  <span className="mobile-nav-text">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navigation; 