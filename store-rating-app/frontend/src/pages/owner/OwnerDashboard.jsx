import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Stars } from '../../components/common/Stars';
import SortableTable from '../../components/common/SortableTable';
import { useSortFilter } from '../../hooks/useSortFilter';

const fmt = (d) => d ? new Date(d).toLocaleDateString() : '—';

export default function OwnerDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const { sortBy, sortOrder, handleSort } = useSortFilter('rated_at', 'DESC');

  useEffect(() => {
    api.get('/stores/my-dashboard')
      .then((r) => setData(r.data))
      .catch(() => toast.error('Failed to load your store dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap" style={{ minHeight:'60vh' }}><div className="spinner" /></div>;
  if (!data)   return <div className="page"><p className="text-muted">No store data available.</p></div>;

  // Sort raters client-side
  const sorted = [...(data.raters || [])].sort((a, b) => {
    const av = a[sortBy], bv = b[sortBy];
    const m  = sortOrder === 'ASC' ? 1 : -1;
    if (typeof av === 'number') return (av - bv) * m;
    return String(av ?? '').localeCompare(String(bv ?? '')) * m;
  });

  const raterCols = [
    { key: 'name',     label: 'Customer' },
    { key: 'email',    label: 'Email' },
    { key: 'rating',   label: 'Rating',
      render: (r) => (
        <span style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
          <Stars value={r.rating} />
          <span className="text-gold" style={{ fontWeight:700 }}>{r.rating}</span>
        </span>
      )},
    { key: 'rated_at', label: 'Date',
      render: (r) => <span className="td-muted">{fmt(r.rated_at)}</span> },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My <em>Store</em></h1>
          <p className="text-muted mt-1" style={{ fontSize:'0.9rem' }}>{data.store.name}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom:'2rem' }}>
        <div className="stat-card">
          <span className="stat-number">{data.averageRating.toFixed(1)}</span>
          <div style={{ display:'flex', justifyContent:'center', margin:'0.3rem 0 0' }}>
            <Stars value={data.averageRating} />
          </div>
          <span className="stat-label">Average Rating</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{data.totalRatings}</span>
          <span className="stat-label">Total Ratings</span>
        </div>
      </div>

      {/* Store info */}
      <div className="card mb-3">
        <h3 style={{ fontFamily:'Syne,sans-serif', marginBottom:'1.25rem' }}>Store Information</h3>
        <div className="detail-grid">
          {[
            ['Name',    data.store.name],
            ['Email',   data.store.email],
            ['Address', data.store.address || '—'],
          ].map(([label, val]) => (
            <div key={label}>
              <div className="detail-field-label">{label}</div>
              <div className="detail-field-value">{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Raters table */}
      <h2 style={{ fontFamily:'Syne,sans-serif', marginBottom:'1rem' }}>
        Customer Ratings
      </h2>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <h3>No ratings yet</h3>
          <p>When customers rate your store, they'll appear here.</p>
        </div>
      ) : (
        <SortableTable
          columns={raterCols}
          rows={sorted}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      )}
    </div>
  );
}
