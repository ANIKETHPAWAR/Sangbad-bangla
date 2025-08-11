import React, { useState, useEffect } from 'react';
import Header from './layout/Header';
import Navigation from './layout/Navigation';
import { useNewsData } from '../hooks/useNewsData';
import { useNotifications } from '../hooks/useNotifications';
import './Navbar.css';

const Navbar = ({ onSidebarToggle }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Custom hooks
  const {
    isConnected,
    error: newsError,
    isLoading: newsLoading
  } = useNewsData();

  const {
    requestPermission
  } = useNotifications();





  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Handle navigation click
  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      {/* Header Component */}
      <Header
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        requestPermission={requestPermission}
        newsError={newsError}
        isConnected={isConnected}

      />

      {/* Separator Line */}
      <div className="navbar-separator"></div>

      {/* Navigation Component */}
      <Navigation
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleNavClick={handleNavClick}
        onSidebarToggle={onSidebarToggle}
      />


      </nav>
    );
  };

export default Navbar;