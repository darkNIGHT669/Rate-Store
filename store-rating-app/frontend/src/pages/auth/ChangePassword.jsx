import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { validatePassword } from '../../utils/validators';

export default function ChangePassword() {
  const [pw, setPw]         = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validatePassword(pw);
    setError(err || '');
    if (err) return;

    setLoading(true);
    try {
      await api.patch('/auth/password', { newPassword: pw });
      toast.success('Password updated successfully!');
      setPw('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Change <em>Password</em></h1>
      </div>

      <div className="card" style={{ maxWidth: 440 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              className="form-control"
              type="password"
              placeholder="8–16 chars, uppercase & special character"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
            {error && <span className="form-error">{error}</span>}
            <p className="text-muted mt-1" style={{ fontSize: '0.78rem' }}>
              Must be 8–16 characters and include at least one uppercase letter and one special character.
            </p>
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
