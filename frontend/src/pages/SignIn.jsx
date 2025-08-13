import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import './SignIn.css';

const SignIn = () => {
  const navigate = useNavigate();
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = () => {
    loginWithRedirect({
      appState: { returnTo: '/' }
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, redirect to Auth0 login
    loginWithRedirect({
      appState: { returnTo: '/' }
    });
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        {/* Back Button */}
        <button 
          className="back-button"
          onClick={() => navigate('/')}
          aria-label="Go back"
        >
          <FiArrowLeft />
          <span>Back to Home</span>
        </button>

        {/* Header */}
        <div className="signin-header">
          <h1>সাইন ইন করুন</h1>
          <p>আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Auth0 Login */}
        <div className="auth0-login-section">
          <div className="divider">
            <span>অথবা</span>
          </div>
          
          <div className="auth0-login-container">
            <button
              onClick={handleGoogleLogin}
              className="auth0-login-button"
              disabled={isLoading}
            >
              {isLoading ? 'সাইন ইন হচ্ছে...' : '🔑 Login with Auth0'}
            </button>
          </div>
        </div>

        {/* Traditional Form (for future use) */}
        <form onSubmit={handleSubmit} className="signin-form">
          <div className="form-group">
            <label htmlFor="email">ইমেইল</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="আপনার ইমেইল দিন"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">পাসওয়ার্ড</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="আপনার পাসওয়ার্ড দিন"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="signin-button"
            disabled={isLoading}
          >
            {isLoading ? 'সাইন ইন হচ্ছে...' : 'সাইন ইন করুন'}
          </button>
        </form>

        {/* Footer */}
        <div className="signin-footer">
          <p>
            অ্যাকাউন্ট নেই?{' '}
            <button 
              className="link-button"
              onClick={() => setError('Please use Auth0 login to create an account.')}
            >
              সাইন আপ করুন
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
