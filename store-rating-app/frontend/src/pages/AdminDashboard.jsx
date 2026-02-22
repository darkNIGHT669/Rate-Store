import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import SortableTable from '../components/SortableTable';
import { StarDisplay } from '../components/StarRating';

const ROLE_LABELS = { admin: 'Admin', user: 'User', store_owner: 'Store Owner' };

const validateForm = (form) => {
  const errors = {};
  if (form.name.length < 20) errors.name = 'Min 20 characters';
  if (form.name.length > 60) errors.name = 'Max 60 characters';
  if (form.address && form.address.length > 400) errors.address = 'Max 400 characters';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email';
  if (form.password.length < 8 || form.password.length > 16) errors.password = 'Password 8–16 chars';
  else if (!/[A-Z]/.test(form.password)) errors.password = 'Need uppercase';
  else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) errors.password = 'Need special char';
  return errors;
};

const emptyUser = { name: '', email: '', address: '', password: '', role: 'user' };
const emptyStore = { name: '', email: '', address: '' };

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [userForm, setUserForm] = useState(emptyUser);
  const [storeForm, setStoreForm] = useState(emptyStore);
  const [formErrors, setFormErrors] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/users/stats').then((r) => setStats(r.data)).catch(() => {});
  }, []);

  const loadUsers = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.email) params.append('email', filters.email);
    if (filters.address) params.append('address', filters.address);
    if (filters.role) params.append('role', filters.role);
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);
    api.get(`/users?${params}`).then((r) => setUsers(r.data)).catch(() => {});
  }, [filters, sortBy, sortOrder]);

  const loadStores = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.address) params.append('address', filters.address);
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);
    api.get(`/stores?${params}`).then((r) => setStores(r.data)).catch(() => {});
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    if (tab === 'users') loadUsers();
    if (tab === 'stores') loadStores();
  }, [tab, loadUsers, loadStores]);

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder((o) => (o === 'ASC' ? 'DESC' : 'ASC'));
    else { setSortBy(field); setSortOrder('ASC'); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const errs = validateForm(userForm);
    setFormErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      await api.post('/auth/users', userForm);
      toast.success('User created!');
      setShowUserModal(false);
      setUserForm(emptyUser);
      loadUsers();
      api.get('/users/stats').then((r) => setStats(r.data));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/stores', storeForm);
      toast.success('Store created!');
      setShowStoreModal(false);
      setStoreForm(emptyStore);
      loadStores();
      api.get('/users/stats').then((r) => setStats(r.data));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create store');
    } finally {
      setSubmitting(false);
    }
  };

  const viewUser = async (id) => {
    try {
      const res = await api.get(`/users/${id}`);
      setSelectedUser(res.data);
    } catch { toast.error('Failed to load user'); }
  };

  const userColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    { key: 'role', label: 'Role', render: (row) => <span className={`badge badge-${row.role}`}>{ROLE_LABELS[row.role]}</span> },
    { key: 'actions', label: '', sortable: false, render: (row) => <button className="btn btn-outline btn-sm" onClick={() => viewUser(row.id)}>View</button> },
  ];

  const storeColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    { key: 'averageRating', label: 'Rating', render: (row) => <><StarDisplay value={row.averageRating} /> <span style={{ marginLeft: 4, color: 'var(--text-2)', fontSize: '0.85rem' }}>{row.averageRating?.toFixed(1) || '—'}</span></> },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Admin <span>Dashboard</span></h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={() => setShowUserModal(true)}>+ Add User</button>
          <button className="btn btn-primary" onClick={() => setShowStoreModal(true)}>+ Add Store</button>
        </div>
      </div>

      <div className="tabs">
        {['overview', 'users', 'stores'].map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">{stats.totalUsers}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.totalStores}</span>
            <span className="stat-label">Total Stores</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.totalRatings}</span>
            <span className="stat-label">Total Ratings</span>
          </div>
        </div>
      )}

      {(tab === 'users' || tab === 'stores') && (
        <div className="filter-bar">
          <input className="form-control" placeholder="Search by name..." value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
          <input className="form-control" placeholder="Search by email..." value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
          <input className="form-control" placeholder="Search by address..." value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
          {tab === 'users' && (
            <select className="form-control select" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="store_owner">Store Owner</option>
            </select>
          )}
        </div>
      )}

      {tab === 'users' && <SortableTable columns={userColumns} data={users} onSort={handleSort} sortBy={sortBy} sortOrder={sortOrder} />}
      {tab === 'stores' && <SortableTable columns={storeColumns} data={stores} onSort={handleSort} sortBy={sortBy} sortOrder={sortOrder} />}

      {/* Create User Modal */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-control" placeholder="Min 20 characters" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
                {formErrors.name && <span className="form-error">{formErrors.name}</span>}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="form-control" type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
                {formErrors.email && <span className="form-error">{formErrors.email}</span>}
              </div>
              <div className="form-group">
                <label>Address</label>
                <input className="form-control" value={userForm.address} onChange={(e) => setUserForm({ ...userForm, address: e.target.value })} />
                {formErrors.address && <span className="form-error">{formErrors.address}</span>}
              </div>
              <div className="form-group">
                <label>Password</label>
                <input className="form-control" type="password" placeholder="8–16 chars, uppercase & special" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
                {formErrors.password && <span className="form-error">{formErrors.password}</span>}
              </div>
              <div className="form-group">
                <label>Role</label>
                <select className="form-control select" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                  <option value="user">Normal User</option>
                  <option value="admin">Admin</option>
                  <option value="store_owner">Store Owner</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowUserModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Store Modal */}
      {showStoreModal && (
        <div className="modal-overlay" onClick={() => setShowStoreModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Store</h2>
              <button className="modal-close" onClick={() => setShowStoreModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateStore}>
              <div className="form-group">
                <label>Store Name</label>
                <input className="form-control" placeholder="Min 20 characters" value={storeForm.name} onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="form-control" type="email" value={storeForm.email} onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input className="form-control" value={storeForm.address} onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowStoreModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Store'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[['Name', selectedUser.name], ['Email', selectedUser.email], ['Address', selectedUser.address || '—'], ['Role', <span className={`badge badge-${selectedUser.role}`}>{ROLE_LABELS[selectedUser.role]}</span>]].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>{label}</div>
                  <div>{val}</div>
                </div>
              ))}
              {selectedUser.storeRating !== undefined && (
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Store Rating</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <StarDisplay value={selectedUser.storeRating} />
                    <span className="text-accent">{selectedUser.storeRating}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
