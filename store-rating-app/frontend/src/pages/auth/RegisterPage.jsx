import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { validateRegister } from '../../utils/validators';

const EMPTY = { name: '', email: '', address: '', password: '' };

export default function RegisterPage() {
  const navigate  = useNavigate();
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateRegister(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        className="form-control"
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={set(key)}
      />
      {errors[key] && <span className="form-error">{errors[key]}</span>}
    </div>
  );

  return (
    <div className="auth-wrap">
      <div className="auth-box" style={{ maxWidth: 460 }}>
        <div className="auth-logo">
          <div className="auth-logo-mark">⭐</div>
          <h1>Create Account</h1>
          <p>Join the platform and start rating stores</p>
        </div>

        <form onSubmit={handleSubmit}>
          {field('name',     'Full Name',       'text',     'Min 20 characters')}
          {field('email',    'Email Address',   'email',    'you@example.com')}
          {field('address',  'Address',         'text',     'Your address (optional)')}
          {field('password', 'Password',        'password', '8–16 chars, uppercase & special char')}

          <button className="btn btn-primary btn-full mt-2" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?&nbsp;<Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
