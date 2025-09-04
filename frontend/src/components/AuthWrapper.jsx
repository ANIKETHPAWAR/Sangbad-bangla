import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

// Wrapper component to handle Auth0 context safely
const AuthWrapper = ({ children }) => {
  try {
    const auth0 = useAuth0();
    return children(auth0);
  } catch (error) {
    console.warn('Auth0 not available, using fallback authentication state');
    // Return fallback auth state
    return children({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      loginWithRedirect: () => console.log('Auth0 not configured'),
      logout: () => console.log('Auth0 not configured')
    });
  }
};

export default AuthWrapper;
