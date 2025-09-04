import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiFacebook, FiMenu, FiChevronDown, FiUserX,FiInstagram  } from 'react-icons/fi';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from '../LoginButton';
import LogoutButton from '../LogoutButton';
import logo from '../../assets/logo-3.jpg';
import './Header.css';
import X from '../../assets/X-icon.svg';
import YT from '../../assets/icons8-youtube.svg';

const Header = ({ onMenuClick }) => {
  // Safe Auth0 hook usage with fallback
  let user = null;
  let isAuthenticated = false;
  
  try {
    const auth0 = useAuth0();
    user = auth0.user;
    isAuthenticated = auth0.isAuthenticated;
  } catch (error) {
    console.warn('Auth0 not available in Header:', error);
  }
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
      setCurrentDate(now.toLocaleDateString('en-US', options));
    };
    
    updateDate();
    const interval = setInterval(updateDate, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);



  // Navigation categories matching the design
  const navigationItems = [
    { id: 'all-news', name: 'এক নজরে সব খবর', path: '/all-news' },
    { id: 'popular', name: 'জনপ্রিয়', path: '/popular' },
    { id: 'cricket', name: 'ক্রিকেট', path: '/cricket' },
    { id: 'bengal-face', name: 'বাংলার মুখ', path: '/bengal-face' },
    { id: 'astrology', name: 'ভাগ্যলিপি', path: '/astrology' },
    { id: 'football', name: 'ফুটবলের মহারণ', path: '/football' },
    { id: 'photo-gallery', name: 'ছবিঘর', path: '/photo-gallery' },
    { id: 'careers', name: 'কর্মখালি', path: '/careers' },
    { id: 'lifestyle', name: 'টুকিটাকি', path: '/lifestyle' }
  ];

  // Sub-navigation items
  const subNavItems = [
    { id: 'special-report', name: 'বিশেষ প্রতিবেদন', path: '/special-report' },
    { id: 'horoscope', name: 'আজকের রাশিফল', path: '/horoscope', isNew: true },
    { id: 'gold-rate', name: 'সোনার দর', path: '/gold-rate' },
    { id: 'cricket-live', name: 'ক্রিকেট লাইভ স্কোর', path: '/cricket-live' }
  ];

  const location = useLocation();

  return (
    <div className="header">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-content">
            {/* Left Side - Menu Button */}
            <div className="header-left">
              <button 
                className="action-btn menu-btn"
                onClick={onMenuClick}
                aria-label="Menu"
              >
                <FiMenu />
              </button>
            </div>

            {/* Center - Logo */}
            <div className="header-center">
              <Link to="/" className="logo">
                <img src={logo} alt="Sangbad Bangla" className="logo-image" />
              </Link>
            </div>

            {/* Right Side - Actions */}
            <div className="header-right">
              <a 
                href="https://www.facebook.com/share/19eQCyXZS8/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="action-btn facebook-btn"
                aria-label="Facebook"
              >
                <FiFacebook />
              </a>
              <a 
                href="https://www.instagram.com/sangbadbanglalive?igsh=MTl4YnRrc2ZzY2p4dw==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="action-btn facebook-btn"
                aria-label="Facebook"
              >
                <FiInstagram />
              </a>
              <a 
                href="https://youtube.com/@sangbadbanglalive?si=9y6uq8Nc4Vr-PcjJ" 
                target="_blank" 
                rel="noopener noreferrer"
                className="action-btn YT-btn"
                aria-label="YT"
              >
                 <img src={YT} alt="YT" />
              </a>
              <div className="separator"></div>
              
              {isAuthenticated ? (
                <div className="user-menu">
                  <div className="user-greeting">
                    <span>Hello, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}</span>
                    <FiChevronDown className="user-arrow" />
                  </div>
                  <div className="user-date">{currentDate}</div>
                </div>
              ) : (
                <LoginButton />
              )}
            </div>
          </div>
        </div>


      </div>

      {/* Navigation Bar */}
      <div className="navigation-bar">
        <div className="container">
          <div className="nav-links">
            {navigationItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Bar */}
      {/* <div className="sub-navigation-bar">
        <div className="container">
          <div className="sub-nav-links">
            {subNavItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="sub-nav-link"
              >
                {item.name}
                {item.isNew && <span className="new-tag">NEW</span>}
              </Link>
            ))}
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Header; 