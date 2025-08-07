import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import './SignIn.css';

const SignIn = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = login(credentialResponse.credential);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred during login');
      console.error('Google login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('Please use Google login to sign in.');
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

        {/* Google Login */}
        <div className="google-login-section">
          <div className="divider">
            <span>অথবা</span>
          </div>
          
          <div className="google-login-container">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="rectangular"
              locale="bn"
              disabled={isLoading}
            />
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
              onClick={() => setError('Please use Google login to create an account.')}
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
