import React, { useState } from 'react';
import '../signup/Signup.css';
import HomePage from '../home/HomePage';
import FloatingChatbot from '/src/chatbot/FloatingChatbot';

const Login = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Username or email is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      setIsLoggedIn(true);
    }, 1500);
  };

  const handleGoogleLogin = () => {
    // Google login logic
  };

  if (isLoggedIn) {
    return <HomePage />;
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
        <div className="signup-welcome-text" style={{ gap: '0.1rem' }}>
          <span className="signup-welcome-small">Welcome to</span>
          <span className="signup-welcome-brand">LoopTech</span>
        </div>
      </div>
      {/* Right side - Login form */}
      <div className="signup-form-side">
        <form className="signup-form-box" onSubmit={handleSubmit}>
          <div className="signup-title" style={{marginBottom: '0.5rem'}}>Welcome back!</div>
          <div className="signup-desc" style={{marginBottom: '1.7rem'}}>It's nice to see you again. Ready to learn?</div>
          <div className="signup-fields">
            <input
              type="text"
              name="usernameOrEmail"
              placeholder="Your username or email"
              value={formData.usernameOrEmail}
              onChange={handleInputChange}
              className={`signup-input${errors.usernameOrEmail ? ' error' : ''}`}
              autoComplete="username"
            />
            {errors.usernameOrEmail && <div className="signup-error">{errors.usernameOrEmail}</div>}
            <input
              type="password"
              name="password"
              placeholder="Your password"
              value={formData.password}
              onChange={handleInputChange}
              className={`signup-input${errors.password ? ' error' : ''}`}
              autoComplete="current-password"
            />
            {errors.password && <div className="signup-error">{errors.password}</div>}
            <div className="login-btn-row">
              <button
                type="submit"
                className="signup-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log In'}
              </button>
              <div className="login-forgot-row">
                <a href="#">Forget Password?</a>
              </div>
            </div>
          </div>
          <div className="signup-divider-row">
            <div className="signup-divider" />
            <span className="signup-divider-text">or</span>
            <div className="signup-divider" />
          </div>
          <button type="button" className="signup-google-btn" onClick={handleGoogleLogin}>
            <svg className="signup-google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="signup-google-text">Continue with Google</span>
          </button>
          <div className="signup-login-row" style={{marginTop: '1.2rem'}}>
            Don't have an account? <a href="/signup">Sign up</a>
          </div>
        </form>
      </div>
      <FloatingChatbot />
    </div>
  );
};

export default Login; 