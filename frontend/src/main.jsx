import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';

import App from './App.jsx'
import { Auth0Provider } from '@auth0/auth0-react';

// Error boundary for iPhone Safari compatibility
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1 style={{ color: '#dc3545', marginBottom: '20px' }}>Something went wrong</h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Please refresh the page or try again later.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Check if we're on iPhone Safari
const isIphoneSafari = () => {
  const ua = navigator.userAgent;
  return /iPhone/.test(ua) && /Safari/.test(ua) && !/Chrome/.test(ua);
};

// Add iPhone Safari specific fixes
if (isIphoneSafari()) {
  // Fix for iPhone Safari viewport issues
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  window.addEventListener('resize', () => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  });
  
  // Fix for iPhone Safari touch events
  document.addEventListener('touchstart', function() {}, { passive: true });
  document.addEventListener('touchmove', function() {}, { passive: true });
}

// Check if environment variables are available
const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

// If Auth0 is not configured, render app without Auth0
if (!auth0Domain || !auth0ClientId) {
  console.warn('Auth0 not configured, running without authentication');
  try {
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    )
  } catch (error) {
    console.error('Failed to render app:', error);
    // Fallback rendering
    document.getElementById('root').innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h1>Loading Error</h1>
        <p>Please refresh the page or try again later.</p>
        <button onclick="window.location.reload()">Refresh</button>
      </div>
    `;
  }
} else {
  try {
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <ErrorBoundary>
          <Auth0Provider
            domain={auth0Domain}
            clientId={auth0ClientId}
            authorizationParams={{
              redirect_uri: window.location.origin
            }}
          >
            <App />
          </Auth0Provider>
        </ErrorBoundary>
      </StrictMode>,
    )
  } catch (error) {
    console.error('Failed to render app:', error);
    // Fallback rendering
    document.getElementById('root').innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h1>Loading Error</h1>
        <p>Please refresh the page or try again later.</p>
        <button onclick="window.location.reload()">Refresh</button>
      </div>
    `;
  }
}
