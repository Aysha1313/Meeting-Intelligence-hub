import React, { useState, useEffect } from 'react';
import './Auth.css';

/* ── Geometric gold M mark — stroked outline, no fill inside ── */
export const MLogoMark = ({ size = 40, gold = '#C8A96E' }) => {
  /* Stroke width scales with size so it looks right at any dimension */
  const sw = Math.max(5, size * 0.13);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/*
        Classic M outline — 5 points, stroke only, nothing filled:
          (8,92)  = bottom-left
          (8,8)   = top-left
          (50,58) = centre valley
          (92,8)  = top-right
          (92,92) = bottom-right
      */}
      <polyline
        points="8,92 8,8 50,58 92,8 92,92"
        stroke={gold}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

/* ══════════════════
   PHASE 1 — Splash
══════════════════ */
const Splash = ({ onDone }) => {
  const [show, setShow] = useState(false);
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 300);
    const t2 = setTimeout(() => setExit(true), 2200);
    const t3 = setTimeout(() => onDone(), 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className={`splash-page ${exit ? 'splash-exit' : ''}`}>
      <div className="splash-glow splash-glow-purple"/>
      <div className="splash-glow splash-glow-orange"/>
      <div className="splash-glow splash-glow-blue"/>
      <div className="splash-grid"/>
      <div className={`splash-center ${show ? 'splash-center-show' : ''}`}>
        <div className="splash-logo-wrap">
          <MLogoMark size={88} gold="#C8A96E"/>
        </div>
        <div className="splash-wordmark">
          <span className="splash-word">Meeting</span>
          <span className="splash-word splash-word-light">Intelligence</span>
          <span className="splash-tm">™</span>
        </div>
        <div className="splash-tagline">AI-Powered Meeting Analysis</div>
      </div>
    </div>
  );
};

/* ══════════════════════════════
   PHASE 2 — Hero / Landing
══════════════════════════════ */
const Hero = ({ onGetStarted }) => {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div className={`hero-page ${vis ? 'hero-visible' : ''}`}>
      {/* Corner glows */}
      <div className="hero-glow hero-glow-tl"/>
      <div className="hero-glow hero-glow-br"/>
      <div className="splash-grid"/>

      {/* Nav */}
      <nav className="hero-nav">
        <div className="features-brand">
          <MLogoMark size={24} gold="#C8A96E"/>
          <span className="features-brand-name">Meeting Intelligence</span>
        </div>
        <a href="#signin" className="features-contact-btn" onClick={e => { e.preventDefault(); onGetStarted(); }}>
          Get in touch
        </a>
      </nav>

      {/* Hero center */}
      <div className="hero-body">
        <p className="features-kicker">AI-Powered Workspace</p>
        <h1 className="hero-heading">
          An Intelligence Layer<br/>Built For Every Meeting
        </h1>
        <p className="hero-sub">
          Transcribe, analyse sentiment, track action items, and chat<br/>
          with your meeting data — all in one seamless workspace.
        </p>

        {/* Glass "Get Started" button */}
        <button className="glass-btn" onClick={onGetStarted}>
          <span className="glass-btn-inner">
            Get Started
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════
   PHASE 3 — Login
══════════════════════════════ */
const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({ fullName: '', username: '', password: '' });
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.username && formData.password) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userFullName', formData.fullName || formData.username);
      onLogin();
    }
  };

  return (
    <div className={`login-backdrop ${vis ? 'login-backdrop-vis' : ''}`}>
      <div className="splash-glow splash-glow-purple" style={{ opacity: 0.5 }}/>
      <div className="splash-glow splash-glow-blue" style={{ opacity: 0.4 }}/>
      <div className="splash-grid"/>

      <div className="login-glass-card">
        {/* Brand */}
        <div className="login-brand-row">
          <MLogoMark size={26} gold="#C8A96E"/>
          <span className="login-brand-name">Meeting Intelligence</span>
        </div>

        <h2 className="login-title">Welcome back</h2>
        <p className="login-sub">Sign in to access your workspace</p>

        <form onSubmit={handleSubmit} className="login-form-clean">
          <div className="lcf-field">
            <label>Full Name</label>
            <input type="text" placeholder="Jane Smith"
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              required/>
          </div>
          <div className="lcf-field">
            <label>Username</label>
            <input type="text" placeholder="your_username"
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
              required/>
          </div>
          <div className="lcf-field">
            <label>Password</label>
            <input type="password" placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required/>
          </div>
          <button type="submit" className="login-submit-btn">Sign In →</button>
        </form>
      </div>
    </div>
  );
};

/* ══════════════════════════════
   Root Auth component
══════════════════════════════ */
const Auth = ({ onAuthSuccess }) => {
  const [phase, setPhase] = useState('splash'); // splash | hero | login

  return (
    <>
      {phase === 'splash' && <Splash onDone={() => setPhase('hero')} />}
      {phase === 'hero'   && <Hero onGetStarted={() => setPhase('login')} />}
      {phase === 'login'  && <LoginForm onLogin={onAuthSuccess} />}
    </>
  );
};

export default Auth;
