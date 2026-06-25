import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { MLogoMark } from '../pages/Auth';
import './Sidebar.css';

const Sidebar = ({ onLogout }) => {
  const userFullName = localStorage.getItem('userFullName') || 'User';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo-wrap">
          <MLogoMark size={22} gold="#C8A96E"/>
        </div>
        <span className="sidebar-title">Meeting Intel</span>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-section-label">Workspace</span>
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={16}/>
          <span>Dashboard</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">{userFullName.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <span className="user-name">{userFullName}</span>
            <span className="user-status">Member</span>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout} aria-label="Logout">
          <LogOut size={15}/>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
