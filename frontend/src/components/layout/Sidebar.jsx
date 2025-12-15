import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { FiChevronRight, FiUser, FiLogOut } from 'react-icons/fi';
import LoginButton from '../LoginButton';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  // Safe Auth0 hook usage with fallback
  let user = null;
  let isAuthenticated = false;
  let logout = () => {};
  
  try {
    const auth0 = useAuth0();
    user = auth0.user;
    isAuthenticated = auth0.isAuthenticated;
    logout = auth0.logout;
  } catch (error) {
    console.warn('Auth0 not available in Sidebar:', error);
  }

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  // Main navigation categories - clean names without icons
  const mainCategories = [
    { id: 'home', name: 'হোম', path: '/' },
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



  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose}></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <h3>সংবাদ বাংলা</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* User Section */}
        {isAuthenticated ? (
          <div className="user-section">
            <div className="user-info">
              <div className="user-avatar">
                <FiUser />
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name || user?.email || 'User'}</span>
                <span className="user-status">লগইন করা</span>
              </div>
              <FiChevronRight className="user-arrow" />
            </div>
          </div>
        ) : (
          <div className="user-section">
            <div className="user-info">
              <div className="user-avatar">
                <FiUser />
              </div>
              <div className="user-details">
                <span className="user-name">অতিথি ব্যবহারকারী</span>
                <span className="user-status">সাইন ইন করুন</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div className="sidebar-content">
          <div className="nav-section">
            <h4 className="section-title">মূল নেভিগেশন</h4>
            {mainCategories.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                onClick={onClose}
                className="nav-link"
              >
                <span className="nav-text">{item.name}</span>
              </Link>
            ))}
          </div>


        </div>

        {/* Bottom Section */}
        <div className="sidebar-bottom">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="logout-btn">
              <FiLogOut />
              <span>লগআউট</span>
            </button>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;


