import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Stars, StarPicker } from '../../components/common/Stars';
import Modal from '../../components/common/Modal';

export default function UserStores() {
  const [stores,  setStores]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState({ name: '', address: '' });
  const [sortBy,  setSortBy]  = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');

  const [ratingStore, setRatingStore] = useState(null); // store being rated
  const [ratingVal,   setRatingVal]   = useState(0);
  const [submitting,  setSubmitting]  = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (search.name)    p.set('name',    search.name);
    if (search.address) p.set('address', search.address);
    p.set('sortBy',    sortBy);
    p.set('sortOrder', sortOrder);
    api.get(`/stores?${p}`)
      .then((r) => setStores(r.data))
      .catch(() => toast.error('Failed to load stores'))
      .finally(() => setLoading(false));
  }, [search, sortBy, sortOrder]);

  // Debounce search changes
  useEffect(() => {
    const t = setTimeout(load, 320);
    return () => clearTimeout(t);
  }, [load]);

  const openRating = (store) => {
    setRatingStore(store);
    setRatingVal(store.user_rating || 0);
  };

  const submitRating = async () => {
    if (!ratingVal) { toast.error('Please select a star rating'); return; }
    setSubmitting(true);
    try {
      await api.post('/ratings', { storeId: ratingStore.id, value: ratingVal });
      toast.success(ratingStore.user_rating ? 'Rating updated!' : 'Rating submitted!');
      setRatingStore(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit rating');
    } finally { setSubmitting(false); }
  };

  const sortLabel = {
    'name:ASC': 'Name A → Z', 'name:DESC': 'Name Z → A',
    'average_rating:DESC': 'Highest Rated', 'average_rating:ASC': 'Lowest Rated',
    'created_at:DESC': 'Newest First', 'created_at:ASC': 'Oldest First',
  };

  const handleSortChange = (e) => {
    const [sb, so] = e.target.value.split(':');
    setSortBy(sb); setSortOrder(so);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Browse <em>Stores</em></h1>
        <span className="text-muted" style={{ fontSize:'0.88rem' }}>
          {stores.length} store{stores.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          className="form-control"
          placeholder="Search by name…"
          value={search.name}
          onChange={(e) => setSearch((p) => ({ ...p, name: e.target.value }))}
        />
        <input
          className="form-control"
          placeholder="Search by address…"
          value={search.address}
          onChange={(e) => setSearch((p) => ({ ...p, address: e.target.value }))}
        />
        <select
          className="form-control"
          style={{ maxWidth: 200 }}
          value={`${sortBy}:${sortOrder}`}
          onChange={handleSortChange}
        >
          {Object.entries(sortLabel).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : stores.length === 0 ? (
        <div className="empty-state">
          <h3>No stores found</h3>
          <p>Try adjusting your search filters.</p>
        </div>
      ) : (
        <div className="stores-grid">
          {stores.map((store) => (
            <div key={store.id} className="store-card">
              <div>
                <div className="store-card-name">{store.name}</div>
                <div className="store-card-addr">
                  {store.address || <span className="td-muted">No address provided</span>}
                </div>
              </div>

              <div className="store-avg">
                <span className="store-avg-number">
                  {parseFloat(store.average_rating).toFixed(1)}
                </span>
                <Stars value={parseFloat(store.average_rating)} />
                <span className="store-avg-count">({store.total_ratings})</span>
              </div>

              <div className="store-my-rating">
                {store.user_rating
                  ? <>Your rating: <span>{'★'.repeat(store.user_rating)}{'☆'.repeat(5 - store.user_rating)}</span></>
                  : <span className="td-muted">You haven't rated this store yet.</span>
                }
              </div>

              <button
                className="btn btn-outline btn-sm btn-full"
                onClick={() => openRating(store)}
              >
                {store.user_rating ? '✏ Modify Rating' : '⭐ Rate This Store'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {ratingStore && (
        <Modal
          title={ratingStore.user_rating ? 'Update Your Rating' : 'Rate This Store'}
          onClose={() => setRatingStore(null)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setRatingStore(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={submitRating}
                disabled={!ratingVal || submitting}
              >
                {submitting ? 'Submitting…' : (ratingStore.user_rating ? 'Update' : 'Submit')}
              </button>
            </>
          }
        >
          <p className="text-muted mb-2" style={{ fontSize:'0.9rem' }}>{ratingStore.name}</p>

          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.75rem', margin:'1.5rem 0' }}>
            <StarPicker value={ratingVal} onChange={setRatingVal} />
            <p className="text-muted" style={{ fontSize:'0.85rem' }}>
              {ratingVal ? `${ratingVal} star${ratingVal !== 1 ? 's' : ''}` : 'Tap a star to rate'}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
