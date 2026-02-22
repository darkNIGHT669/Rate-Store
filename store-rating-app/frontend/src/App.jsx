import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';

// Pages
import LoginPage     from './pages/auth/LoginPage';
import RegisterPage  from './pages/auth/RegisterPage';
import ChangePassword from './pages/auth/ChangePassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserStores    from './pages/user/UserStores';
import OwnerDashboard from './pages/owner/OwnerDashboard';

// ── Route guards ──────────────────────────────────────────────
function Protected({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="spinner-wrap" style={{ minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function HomeRedirect() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'store_owner') return <Navigate to="/owner" replace />;
  return <Navigate to="/stores" replace />;
}

// ── Layout with Navbar ────────────────────────────────────────
function AppShell() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/" element={<Protected><HomeRedirect /></Protected>} />

        <Route path="/admin"  element={<Protected roles={['admin']}><AdminDashboard /></Protected>} />
        <Route path="/stores" element={<Protected roles={['user']}><UserStores /></Protected>} />
        <Route path="/owner"  element={<Protected roles={['store_owner']}><OwnerDashboard /></Protected>} />

        <Route path="/change-password" element={<Protected><ChangePassword /></Protected>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="dark"
          hideProgressBar={false}
          closeOnClick
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
