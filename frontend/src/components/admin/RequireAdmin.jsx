import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../../services/authService';

const RequireAdmin = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasAdminRole, setHasAdminRole] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await authService.isAuthenticated();
        const adminRole = await authService.hasAdminRole();
        
        setIsAuthenticated(authenticated);
        setHasAdminRole(adminRole);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setHasAdminRole(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect to admin login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  // Check if user has admin role
  if (!hasAdminRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-black mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You need admin permissions to view this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // User has admin role, render the protected content
  return children;
};

export default RequireAdmin;
