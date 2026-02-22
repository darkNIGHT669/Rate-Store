import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const validatePassword = (pw) => {
  if (pw.length < 8 || pw.length > 16) return 'Password must be 8–16 characters';
  if (!/[A-Z]/.test(pw)) return 'Must include at least one uppercase letter';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) return 'Must include at least one special character';
  return null;
};

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validatePassword(newPassword);
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      await api.patch('/auth/password', { newPassword });
      toast.success('Password updated successfully!');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Change <span>Password</span></h1>
      </div>

      <div className="card" style={{ maxWidth: 440 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input
              className="form-control"
              type="password"
              placeholder="8–16 chars, uppercase & special char"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {error && <span className="form-error">{error}</span>}
            <small className="text-muted" style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>
              Must be 8–16 characters with at least one uppercase letter and one special character.
            </small>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
