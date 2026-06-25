import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import MeetingDetail from './pages/MeetingDetail';
import { ToastProvider } from './components/Toast';
import { MLogoMark } from './pages/Auth';
import './index.css';

/* ── Top navigation bar shown when logged in ── */
const TopNav = ({ onLogout }) => {
  const userFullName = localStorage.getItem('userFullName') || 'User';
  return (
    <header className="top-nav">
      <div className="top-nav-brand">
        <MLogoMark size={22} gold="#C8A96E"/>
        <span className="top-nav-title">Meeting Intelligence</span>
      </div>
      <div className="top-nav-right">
        <span className="top-nav-user">{userFullName}</span>
        <button className="top-nav-signout" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </header>
  );
};

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userFullName');
  }, []);

  const handleLogin  = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userFullName');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <TopNav onLogout={handleLogout} />
      <main className="app-main">
        <Routes>
          <Route path="/"            element={<Dashboard />} />
          <Route path="/meeting/:id" element={<MeetingDetail />} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <ToastProvider>
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </ToastProvider>
);

export default App;
