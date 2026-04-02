import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Settings, User, Menu, X } from 'lucide-react';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
    { name: 'All Meetings', icon: <Calendar size={18} />, path: '/meetings' },
    { name: 'Settings', icon: <Settings size={18} />, path: '/settings' },
  ];

  return (
    <>
      {isMobile && (
        <button 
          className="mobile-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle menu"
        >
          {collapsed ? <Menu size={24} /> : <X size={24} />}
        </button>
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${isMobile && !collapsed ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-box" />
          <span className="logo-text">Intellect</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => isMobile && setCollapsed(true)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <User size={16} />
            </div>
            <div className="user-info">
              <p className="user-name">{localStorage.getItem('userName') || 'Member B'}</p>
              <div className="badge-wrapper">
                <span className="user-badge">Free Tier</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          height: 100vh;
          background-color: var(--bg-surface);
          border-right: 1px solid var(--border);
          padding: 2rem 1.25rem;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 100;
          transition: transform var(--duration-normal) var(--ease-smooth);
        }
        
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 3rem;
          padding-left: 0.5rem;
        }
        
        .logo-box {
          width: 24px;
          height: 24px;
          background-color: var(--accent);
          border-radius: 6px;
        }
        
        .logo-text {
          font-family: 'Sora', sans-serif;
          font-weight: 300;
          font-size: 1.25rem;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }
        
        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 0.9rem;
          border-left: 3px solid transparent;
        }
        
        .sidebar-item:hover {
          color: var(--text-primary);
          background-color: var(--bg-card);
        }
        
        .sidebar-item.active {
          color: var(--text-primary);
          background-color: var(--accent-glow);
          border-left-color: var(--accent);
        }
        
        .sidebar-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .sidebar-footer {
          margin-top: auto;
          padding: 1rem 0;
          border-top: 1px solid var(--border);
        }
        
        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
        }
        
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: var(--bg-card);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          border: 1px solid var(--border);
        }
        
        .user-info {
          display: flex;
          flex-direction: column;
        }
        
        .user-name {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .user-badge {
          font-size: 0.7rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .mobile-toggle {
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 200;
          color: var(--text-secondary);
          padding: 0.5rem;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
        }
        
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
