import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiTrendingUp, FiTag, FiX } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const sections = [
    { id: 'all-news', name: 'এক নজরে সব খবর', path: '/all-news' },
    { id: 'popular', name: 'জনপ্রিয়', path: '/popular' },
    { id: 'cricket', name: 'ক্রিকেট', path: '/cricket' },
    { id: 'football', name: 'ফুটবলের মহারণ', path: '/football' },
    { id: 'bengal-face', name: 'বাংলার মুখ', path: '/bengal-face' },
    { id: 'astrology', name: 'ভাগ্যলিপি', path: '/astrology' },
    { id: 'bioscope', name: 'বায়োস্কোপ', path: '/bioscope' },
    { id: 'photo-gallery', name: 'ছবিঘর', path: '/photo-gallery' },
    { id: 'kolkata', name: 'কলকাতা', path: '/kolkata' },
    { id: 'web-stories', name: 'ওয়েবস্টোরি', path: '/web-stories' },
    { id: 'lifestyle', name: 'টুকিটাকি', path: '/lifestyle' },
    { id: 'careers', name: 'কর্মখালি', path: '/careers' }
  ];

  const trendingTopics = [
    'লাইভ ক্রিকেট স্কোর',
    'আইপিএলের সাতকাহন',
    'আইপিএলের সূচি',
    'পয়েন্ট তালিকা',
    'আইপিএলের অরেঞ্জ ক্যাপ',
    'পার্পল ক্যাপ',
    'পরিসংখ্যান',
    'ফিরে দেখুন IPL'
  ];

  return (
    <>
      {/* Sidebar Overlay - Only shows when isOpen is true */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose}>
          <div className="sidebar mobile-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-header">
              <h3>মেনু</h3>
              <button className="sidebar-close" onClick={onClose}>
                <FiX />
              </button>
            </div>
            
            <div className="sidebar-section">
              <h3 className="sidebar-title">বিভাগ</h3>
              <nav className="sidebar-nav">
                {sections.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="sidebar-section">
              <h3 className="sidebar-title with-icon">
                <FiTrendingUp className="sidebar-icon" />
                ট্রেন্ডিং টপিকস
              </h3>
              <div className="sidebar-tags">
                {trendingTopics.map((topic, idx) => (
                  <Link 
                    key={idx} 
                    to={`/search?q=${encodeURIComponent(topic)}`} 
                    className="sidebar-tag"
                    onClick={onClose}
                  >
                    <FiTag />
                    <span>{topic}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;


