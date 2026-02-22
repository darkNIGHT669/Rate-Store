import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { StarDisplay } from '../components/StarRating';
import SortableTable from '../components/SortableTable';

export default function StoreOwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('ratedAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  useEffect(() => {
    api.get('/stores/owner-dashboard')
      .then((r) => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder((o) => (o === 'ASC' ? 'DESC' : 'ASC'));
    else { setSortBy(field); setSortOrder('ASC'); }
  };

  const sortedRaters = data?.raters?.slice().sort((a, b) => {
    const valA = a[sortBy]; const valB = b[sortBy];
    const mult = sortOrder === 'ASC' ? 1 : -1;
    if (typeof valA === 'number') return (valA - valB) * mult;
    return String(valA).localeCompare(String(valB)) * mult;
  });

  const raterColumns = [
    { key: 'name', label: 'Customer Name' },
    { key: 'email', label: 'Email' },
    { key: 'rating', label: 'Rating', render: (row) => <StarDisplay value={row.rating} /> },
    { key: 'ratedAt', label: 'Date', render: (row) => new Date(row.ratedAt).toLocaleDateString() },
  ];

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Store <span>Dashboard</span></h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>{data?.store?.name}</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <span className="stat-number">{data?.averageRating?.toFixed(1) || '—'}</span>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '0.25rem 0' }}>
            <StarDisplay value={data?.averageRating || 0} />
          </div>
          <span className="stat-label">Average Rating</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{data?.totalRatings}</span>
          <span className="stat-label">Total Ratings</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontFamily: 'DM Serif Display, serif' }}>Store Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[['Store Name', data?.store?.name], ['Email', data?.store?.email], ['Address', data?.store?.address || '—']].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>{label}</div>
              <div>{val}</div>
            </div>
          ))}
        </div>
      </div>

      <h2 style={{ marginBottom: '1rem', fontFamily: 'DM Serif Display, serif', fontSize: '1.5rem' }}>
        Customer Ratings
      </h2>

      {data?.raters?.length === 0 ? (
        <div className="empty-state">
          <h3>No ratings yet</h3>
          <p>Your store hasn't received any ratings yet.</p>
        </div>
      ) : (
        <SortableTable columns={raterColumns} data={sortedRaters || []} onSort={handleSort} sortBy={sortBy} sortOrder={sortOrder} />
      )}
    </div>
  );
}
