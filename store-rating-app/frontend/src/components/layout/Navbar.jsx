import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RoleBadge from '../common/RoleBadge';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">⭐ RateStore</Link>

      <div className="nav-right">
        <div className="nav-user-tag">
          <span className="nav-name">{firstName}</span>
          <RoleBadge role={user?.role} />
        </div>
        <Link to="/change-password" className="btn btn-ghost btn-sm">Password</Link>
        <button onClick={handleLogout} className="btn btn-danger btn-sm">Log out</button>
      </div>
    </nav>
  );
}
