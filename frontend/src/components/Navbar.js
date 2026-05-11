import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const close = () => setOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" onClick={close}>HabitTracker</Link>
      </div>

      {/* Hamburger */}
      <button
        className={`navbar-toggle ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      {/* Links */}
      <div className={`navbar-links ${open ? 'open' : ''}`}>
        <Link to="/"       onClick={close}>Dashboard</Link>
        <Link to="/weekly" onClick={close}>Weekly analysis</Link>
        <Link to="/goals"  onClick={close}>Set-up Goals</Link>
        <Link to="/tasks"  onClick={close}>Configure Tasks</Link>
        <span className="navbar-user">👤 {user?.name}</span>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>
    </nav>
  );
}
