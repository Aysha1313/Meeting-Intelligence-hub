import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import MeetingDetail from './pages/MeetingDetail';
import Sidebar from './components/Sidebar';
import { ToastProvider } from './components/Toast';
import './index.css';

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Clear any stale session only once on mount, not on every render
  useEffect(() => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userFullName');
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userFullName');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Sidebar onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/meeting/:id" element={<MeetingDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;
