import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { FaBook } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <FaBook className="brand-icon" />
          <span>StayDisciple</span>
        </Link>
        <div className="navbar-links">
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
            Dashboard
          </Link>
          <Link to="/journal" className={`nav-link ${isActive('/journal') ? 'active' : ''}`}>
            Goal
          </Link>
          <Link to="/history" className={`nav-link ${isActive('/history') ? 'active' : ''}`}>
            History
          </Link>
          <div className="user-menu">
            <FiUser className="user-icon" />
            <span className="user-name">{user?.name}</span>
            <button onClick={handleLogout} className="logout-btn" title="Logout">
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

