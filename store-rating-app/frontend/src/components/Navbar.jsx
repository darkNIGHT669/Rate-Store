import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = { admin: 'Administrator', user: 'Member', store_owner: 'Store Owner' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">★ RateStore</Link>
      <div className="nav-actions">
        <span className="nav-user">
          {user?.name?.split(' ')[0]} · {ROLE_LABELS[user?.role]}
        </span>
        <Link to="/change-password" className="btn btn-outline btn-sm">Password</Link>
        <button onClick={handleLogout} className="btn btn-danger btn-sm">Log Out</button>
      </div>
    </nav>
  );
}
