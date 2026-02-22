import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import SortableTable from '../../components/common/SortableTable';
import Modal from '../../components/common/Modal';
import RoleBadge from '../../components/common/RoleBadge';
import { Stars } from '../../components/common/Stars';
import { validateRegister } from '../../utils/validators';
import { useSortFilter } from '../../hooks/useSortFilter';

// ── Helpers ───────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleDateString() : '—';

// ── Sub-components ────────────────────────────────────────────
function StatsBar({ stats }) {
  return (
    <div className="stats-grid">
      {[
        ['Total Users',   stats.totalUsers],
        ['Total Stores',  stats.totalStores],
        ['Total Ratings', stats.totalRatings],
      ].map(([label, val]) => (
        <div className="stat-card" key={label}>
          <span className="stat-number">{val ?? '—'}</span>
          <span className="stat-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab]     = useState('overview');
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);

  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });

  const userSort  = useSortFilter('name', 'ASC');
  const storeSort = useSortFilter('name', 'ASC');

  // Modals
  const [modal, setModal] = useState(null);
  const [selectedUser, setSelectedUser]   = useState(null);
  const [submitting, setSubmitting]       = useState(false);

  // Forms
  const EMPTY_USER  = { name:'', email:'', address:'', password:'', role:'user' };
  const EMPTY_STORE = { name:'', email:'', address:'', ownerId:'' };
  const [userForm,  setUserForm]   = useState(EMPTY_USER);
  const [storeForm, setStoreForm]  = useState(EMPTY_STORE);
  const [formErrors, setFormErrors] = useState({});

  // Store owners list for the Add Store dropdown
  const [storeOwners, setStoreOwners] = useState([]);

  // ── Data loaders ─────────────────────────────────────────────
  const loadStats = useCallback(() => {
    api.get('/users/stats').then((r) => setStats(r.data)).catch(() => {});
  }, []);

  const loadUsers = useCallback(() => {
    const p = new URLSearchParams();
    if (filters.name)    p.set('name',    filters.name);
    if (filters.email)   p.set('email',   filters.email);
    if (filters.address) p.set('address', filters.address);
    if (filters.role)    p.set('role',    filters.role);
    p.set('sortBy',    userSort.sortBy);
    p.set('sortOrder', userSort.sortOrder);
    api.get(`/users?${p}`).then((r) => setUsers(r.data)).catch(() => {});
  }, [filters, userSort.sortBy, userSort.sortOrder]);

  const loadStores = useCallback(() => {
    const p = new URLSearchParams();
    if (filters.name)    p.set('name',    filters.name);
    if (filters.address) p.set('address', filters.address);
    p.set('sortBy',    storeSort.sortBy);
    p.set('sortOrder', storeSort.sortOrder);
    api.get(`/stores?${p}`).then((r) => setStores(r.data)).catch(() => {});
  }, [filters, storeSort.sortBy, storeSort.sortOrder]);

  // Fetch all store_owner users for the dropdown
  const loadStoreOwners = useCallback(() => {
    api.get('/users?role=store_owner&sortBy=name&sortOrder=ASC')
      .then((r) => setStoreOwners(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  useEffect(() => {
    if (tab === 'users')  loadUsers();
    if (tab === 'stores') loadStores();
  }, [tab, loadUsers, loadStores]);

  // ── Handlers ─────────────────────────────────────────────────
  const openStoreModal = () => {
    setStoreForm(EMPTY_STORE);
    loadStoreOwners(); // fresh list every time modal opens
    setModal('store');
  };

  const viewUser = async (id) => {
    try {
      const { data } = await api.get(`/users/${id}`);
      setSelectedUser(data);
      setModal('user-detail');
    } catch { toast.error('Failed to load user details'); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const errs = validateRegister(userForm);
    setFormErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      await api.post('/auth/users', userForm);
      toast.success('User created successfully!');
      setModal(null);
      setUserForm(EMPTY_USER);
      setFormErrors({});
      loadUsers();
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally { setSubmitting(false); }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Only send ownerId if one was actually selected
      const payload = { ...storeForm };
      if (!payload.ownerId) delete payload.ownerId;
      await api.post('/stores', payload);
      toast.success('Store created successfully!');
      setModal(null);
      setStoreForm(EMPTY_STORE);
      loadStores();
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create store');
    } finally { setSubmitting(false); }
  };

  const setFilter = (f) => (e) => setFilters((p) => ({ ...p, [f]: e.target.value }));

  // ── Table column definitions ──────────────────────────────────
  const userCols = [
    { key: 'name',     label: 'Name' },
    { key: 'email',    label: 'Email' },
    { key: 'address',  label: 'Address', render: (r) => r.address || <span className="td-muted">—</span> },
    { key: 'role',     label: 'Role',    render: (r) => <RoleBadge role={r.role} /> },
    { key: 'created_at', label: 'Joined', render: (r) => <span className="td-muted">{fmt(r.created_at)}</span> },
    { key: 'actions',  label: '', sortable: false,
      render: (r) => <button className="btn btn-ghost btn-sm" onClick={() => viewUser(r.id)}>Details →</button> },
  ];

  const storeCols = [
    { key: 'name',           label: 'Name' },
    { key: 'email',          label: 'Email' },
    { key: 'address',        label: 'Address', render: (r) => r.address || <span className="td-muted">—</span> },
    { key: 'average_rating', label: 'Rating',
      render: (r) => (
        <span style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
          <Stars value={parseFloat(r.average_rating)} />
          <span className="text-gold" style={{ fontWeight:700 }}>
            {parseFloat(r.average_rating).toFixed(1)}
          </span>
          <span className="td-muted">({r.total_ratings})</span>
        </span>
      )},
    { key: 'created_at', label: 'Added', render: (r) => <span className="td-muted">{fmt(r.created_at)}</span> },
  ];

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Admin <em>Dashboard</em></h1>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          <button className="btn btn-outline" onClick={() => { setUserForm(EMPTY_USER); setFormErrors({}); setModal('user'); }}>
            + Add User
          </button>
          <button className="btn btn-primary" onClick={openStoreModal}>
            + Add Store
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['overview', 'users', 'stores'].map((t) => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && <StatsBar stats={stats} />}

      {/* Users */}
      {tab === 'users' && (
        <>
          <div className="filter-bar">
            <input className="form-control" placeholder="Name…"    value={filters.name}    onChange={setFilter('name')} />
            <input className="form-control" placeholder="Email…"   value={filters.email}   onChange={setFilter('email')} />
            <input className="form-control" placeholder="Address…" value={filters.address} onChange={setFilter('address')} />
            <select className="form-control" value={filters.role} onChange={setFilter('role')}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>
          <SortableTable
            columns={userCols}
            rows={users}
            sortBy={userSort.sortBy}
            sortOrder={userSort.sortOrder}
            onSort={userSort.handleSort}
          />
        </>
      )}

      {/* Stores */}
      {tab === 'stores' && (
        <>
          <div className="filter-bar">
            <input className="form-control" placeholder="Name…"    value={filters.name}    onChange={setFilter('name')} />
            <input className="form-control" placeholder="Address…" value={filters.address} onChange={setFilter('address')} />
          </div>
          <SortableTable
            columns={storeCols}
            rows={stores}
            sortBy={storeSort.sortBy}
            sortOrder={storeSort.sortOrder}
            onSort={storeSort.handleSort}
          />
        </>
      )}

      {/* ── Modal: Create User ────────────────────────────────── */}
      {modal === 'user' && (
        <Modal
          title="Add New User"
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateUser} disabled={submitting}>
                {submitting ? 'Creating…' : 'Create User'}
              </button>
            </>
          }
        >
          <form onSubmit={handleCreateUser}>
            {[
              ['name',     'Full Name',     'text',     'Min 20 characters'],
              ['email',    'Email Address', 'email',    'user@example.com'],
              ['address',  'Address',       'text',     'Optional'],
              ['password', 'Password',      'password', '8–16 chars, uppercase & special char'],
            ].map(([key, label, type, ph]) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <input
                  className="form-control"
                  type={type}
                  placeholder={ph}
                  value={userForm[key]}
                  onChange={(e) => setUserForm((p) => ({ ...p, [key]: e.target.value }))}
                />
                {formErrors[key] && <span className="form-error">{formErrors[key]}</span>}
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-control"
                value={userForm.role}
                onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value }))}
              >
                <option value="user">Normal User</option>
                <option value="admin">Admin</option>
                <option value="store_owner">Store Owner</option>
              </select>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal: Create Store ───────────────────────────────── */}
      {modal === 'store' && (
        <Modal
          title="Add New Store"
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateStore} disabled={submitting}>
                {submitting ? 'Creating…' : 'Create Store'}
              </button>
            </>
          }
        >
          <form onSubmit={handleCreateStore}>
            {[
              ['name',    'Store Name',    'text',  'Min 20 characters'],
              ['email',   'Email Address', 'email', 'store@example.com'],
              ['address', 'Address',       'text',  'Optional'],
            ].map(([key, label, type, ph]) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <input
                  className="form-control"
                  type={type}
                  placeholder={ph}
                  value={storeForm[key]}
                  onChange={(e) => setStoreForm((p) => ({ ...p, [key]: e.target.value }))}
                  required={key !== 'address'}
                />
              </div>
            ))}

            {/* Owner dropdown */}
            <div className="form-group">
              <label className="form-label">Assign Store Owner</label>
              <select
                className="form-control"
                value={storeForm.ownerId}
                onChange={(e) => setStoreForm((p) => ({ ...p, ownerId: e.target.value }))}
              >
                <option value="">— No owner assigned —</option>
                {storeOwners.length === 0 && (
                  <option disabled>No store owner accounts exist yet</option>
                )}
                {storeOwners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.email})
                  </option>
                ))}
              </select>
              {storeOwners.length === 0 && (
                <span className="form-error" style={{ color: 'var(--text-2)' }}>
                  Create a Store Owner user first to assign one.
                </span>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal: User Detail ────────────────────────────────── */}
      {modal === 'user-detail' && selectedUser && (
        <Modal title="User Details" onClose={() => setModal(null)}>
          <div className="detail-grid">
            {[
              ['Name',    selectedUser.name],
              ['Email',   selectedUser.email],
              ['Address', selectedUser.address || '—'],
              ['Joined',  fmt(selectedUser.created_at)],
            ].map(([label, val]) => (
              <div key={label}>
                <div className="detail-field-label">{label}</div>
                <div className="detail-field-value">{val}</div>
              </div>
            ))}
            <div>
              <div className="detail-field-label">Role</div>
              <div className="detail-field-value"><RoleBadge role={selectedUser.role} /></div>
            </div>
            {selectedUser.store && (
              <div>
                <div className="detail-field-label">Store Rating</div>
                <div className="detail-field-value" style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <Stars value={parseFloat(selectedUser.store.average_rating)} />
                  <span className="text-gold" style={{ fontWeight:700 }}>
                    {parseFloat(selectedUser.store.average_rating).toFixed(1)}
                  </span>
                  <span className="td-muted">({selectedUser.store.total_ratings} ratings)</span>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
