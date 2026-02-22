import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { StarDisplay, StarInput } from '../components/StarRating';

export default function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [ratingModal, setRatingModal] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadStores = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.name) params.append('name', search.name);
    if (search.address) params.append('address', search.address);
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);
    api.get(`/stores?${params}`)
      .then((r) => setStores(r.data))
      .catch(() => toast.error('Failed to load stores'))
      .finally(() => setLoading(false));
  }, [search, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(loadStores, 300);
    return () => clearTimeout(timer);
  }, [loadStores]);

  const openRatingModal = (store) => {
    setRatingModal(store);
    setSelectedRating(store.userRating || 0);
  };

  const submitRating = async () => {
    if (!selectedRating) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await api.post('/ratings', { storeId: ratingModal.id, value: selectedRating });
      toast.success(ratingModal.userRating ? 'Rating updated!' : 'Rating submitted!');
      setRatingModal(null);
      loadStores();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSortChange = (field) => {
    if (sortBy === field) setSortOrder((o) => (o === 'ASC' ? 'DESC' : 'ASC'));
    else { setSortBy(field); setSortOrder('ASC'); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Browse <span>Stores</span></h1>
        <span className="text-muted" style={{ fontSize: '0.9rem' }}>{stores.length} stores found</span>
      </div>

      <div className="filter-bar" style={{ marginBottom: '1rem' }}>
        <input
          className="form-control"
          placeholder="Search by store name..."
          value={search.name}
          onChange={(e) => setSearch({ ...search, name: e.target.value })}
        />
        <input
          className="form-control"
          placeholder="Search by address..."
          value={search.address}
          onChange={(e) => setSearch({ ...search, address: e.target.value })}
        />
        <select className="form-control select" value={`${sortBy}:${sortOrder}`} onChange={(e) => { const [f, o] = e.target.value.split(':'); setSortBy(f); setSortOrder(o); }}>
          <option value="name:ASC">Name A–Z</option>
          <option value="name:DESC">Name Z–A</option>
          <option value="createdAt:DESC">Newest First</option>
          <option value="createdAt:ASC">Oldest First</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
      ) : stores.length === 0 ? (
        <div className="empty-state">
          <h3>No stores found</h3>
          <p>Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="stores-grid">
          {stores.map((store) => (
            <div key={store.id} className="store-card">
              <div className="store-name">{store.name}</div>
              <div className="store-address">📍 {store.address || 'No address provided'}</div>

              <div className="store-rating-display">
                <span className="store-rating-avg">{store.averageRating?.toFixed(1) || '—'}</span>
                <StarDisplay value={store.averageRating || 0} />
                <span className="store-rating-count">({store.totalRatings})</span>
              </div>

              <div className="store-user-rating">
                {store.userRating
                  ? <>Your rating: <span className="text-accent">{'★'.repeat(store.userRating)}{'☆'.repeat(5 - store.userRating)}</span></>
                  : <span style={{ color: 'var(--text-2)' }}>You haven't rated this store yet</span>
                }
              </div>

              <button
                className="btn btn-outline btn-sm"
                onClick={() => openRatingModal(store)}
                style={{ width: '100%' }}
              >
                {store.userRating ? '✏️ Modify Rating' : '⭐ Rate This Store'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal && (
        <div className="modal-overlay" onClick={() => setRatingModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{ratingModal.userRating ? 'Update Rating' : 'Rate Store'}</h2>
              <button className="modal-close" onClick={() => setRatingModal(null)}>✕</button>
            </div>
            <p style={{ marginBottom: '1rem', color: 'var(--text-2)' }}>{ratingModal.name}</p>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0' }}>
              <StarInput value={selectedRating} onChange={setSelectedRating} />
            </div>
            <p style={{ textAlign: 'center', color: 'var(--text-2)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {selectedRating > 0 ? `You selected ${selectedRating} star${selectedRating !== 1 ? 's' : ''}` : 'Click a star to rate'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setRatingModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitRating} disabled={submitting || !selectedRating}>
                {submitting ? 'Submitting...' : (ratingModal.userRating ? 'Update Rating' : 'Submit Rating')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
