import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LogOut } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ onLogout }) => {
  const userFullName = localStorage.getItem('userFullName') || 'User';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
           <span>M</span>
           <span>I</span>
        </div>
        <span className="sidebar-title">Intellect</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>


      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">{userFullName.charAt(0)}</div>
          <div className="user-info">
            <span className="user-name">{userFullName}</span>
            <span className="user-status">Pro Member</span>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout} aria-label="Logout">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
