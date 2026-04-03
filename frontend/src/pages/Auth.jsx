import React, { useState, useEffect } from 'react';
import './Auth.css';

export const LandingAnimation = ({ onComplete }) => {
  const [phase, setPhase] = useState('initial'); // initial, expanding, complete

  useEffect(() => {
    // Delay before starting expansion
    const timer1 = setTimeout(() => setPhase('expanding'), 800);
    // Delay before ending animation
    const timer2 = setTimeout(() => setPhase('complete'), 2500);
    // Callback after completion
    const timer3 = setTimeout(() => onComplete(), 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className={`landing-container ${phase === 'complete' ? 'fade-out' : ''}`}>
      <div className="logo-wrapper">
        <div className={`logo-square ${phase === 'expanding' ? 'pulse' : ''}`}>
           <span className="logo-letter">M</span>
           <span className="logo-letter">I</span>
        </div>
        <div className={`expanding-text ${phase === 'expanding' ? 'show' : ''}`}>
          <span className="word">eeting</span>
          <span className="space">&nbsp;</span>
          <span className="word">ntelligence</span>
        </div>
      </div>
    </div>
  );
};

export const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: ''
  });
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Small delay to ensure landing animation fade-out feels smooth
    const timer = setTimeout(() => setIsAnimating(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.username && formData.password) {
      // For demo purposes, we'll just store the full name
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userFullName', formData.fullName || formData.username);
      onLogin();
    }
  };

  return (
    <div className={`login-page ${isAnimating ? 'fade-in' : ''}`}>
      <div className="login-card animate-fade-up">
        <div className="login-header">
          <h2>Welcome back</h2>
          <p>Login to access your meeting insights</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              placeholder="e.g. John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

const Auth = ({ onAuthSuccess }) => {
  const [showLanding, setShowLanding] = useState(true);

  if (showLanding) {
    return <LandingAnimation onComplete={() => setShowLanding(false)} />;
  }

  return <Login onLogin={onAuthSuccess} />;
};

export default Auth;
