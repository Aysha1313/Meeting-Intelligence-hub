import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import MeetingDetail from './pages/MeetingDetail';
import './index.css';

import Login from './pages/Login';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('isAuthenticated'));

  if (!isAuthenticated) {
    return (
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/meeting/:id" element={<MeetingDetail />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;
