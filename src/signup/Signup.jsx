import React, { useState } from 'react';
import './Signup.css';
import Onboarding from '../onboarding/Onboarding';
import FloatingChatbot from '/src/chatbot/FloatingChatbot';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!agreed) {
      newErrors.agreement = 'Please agree to the Terms of Service and Privacy Policy';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSuccess(true);
      setTimeout(() => {
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setAgreed(false);
        setIsSuccess(false);
        setShowOnboarding(true);
      }, 1000);
    } catch (error) {
      setErrors({ submit: 'An error occurred during signup. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Google signup logic
  };

  const handleOnboardingFinish = (data) => {
    // Handle onboarding finish (e.g., redirect or show a message)
    // For now, just log the data
    console.log('Onboarding complete:', data);
  };

  if (showOnboarding) {
    return <Onboarding onFinish={handleOnboardingFinish} />;
  }

  return (
    <div className="signup-container">
      {/* Left side - Background image and welcome text */}
      <div className="signup-bg-side">
        <video
          className="signup-bg-video"
          src="/images/login/bg-video.mp4"
          autoPlay
          muted
          loop
          playsInline
          controls={false}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div className="signup-welcome-text">
          <span className="signup-welcome-small">Welcome to</span>
          <span className="signup-welcome-brand">LoopTech</span>
        </div>
      </div>
      {/* Right side - Signup form */}
      <div className="signup-form-side">
        <form className="signup-form-box" onSubmit={handleSubmit}>
          <div className="signup-title">Join Us!</div>
          <div className="signup-desc">Grow alongside thousands in our learning community.</div>
          <div className="signup-fields">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              className={`signup-input${errors.username ? ' error' : ''}`}
              autoComplete="username"
            />
            {errors.username && <div className="signup-error">{errors.username}</div>}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className={`signup-input${errors.email ? ' error' : ''}`}
              autoComplete="email"
            />
            {errors.email && <div className="signup-error">{errors.email}</div>}
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className={`signup-input${errors.password ? ' error' : ''}`}
              autoComplete="new-password"
            />
            {errors.password && <div className="signup-error">{errors.password}</div>}
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`signup-input${errors.confirmPassword ? ' error' : ''}`}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <div className="signup-error">{errors.confirmPassword}</div>}
            <div className="signup-btn-row">
              <button
                type="submit"
                className="signup-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </div>
            {errors.submit && <div className="signup-error">{errors.submit}</div>}
            <div className="signup-checkbox-row">
              <input
                type="checkbox"
                id="agreement"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="signup-checkbox"
              />
              <label htmlFor="agreement" className="signup-checkbox-label">
                I agree to <span className="signup-brand">LoopTech</span> <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
              </label>
            </div>
            {errors.agreement && <div className="signup-error">{errors.agreement}</div>}
          </div>
          <div className="signup-divider-row">
            <div className="signup-divider" />
            <span className="signup-divider-text">or</span>
            <div className="signup-divider" />
          </div>
          <button
            type="button"
            className="signup-google-btn"
            onClick={handleGoogleSignup}
          >
            <svg className="signup-google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="signup-google-text">Continue with Google</span>
          </button>
          <div className="signup-login-row">
            Already have an account? <a href="/login">Log in</a>
          </div>
        </form>
      </div>
      <FloatingChatbot />
    </div>
  );
};

export default Signup;