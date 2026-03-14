import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.identifier || !form.password) {
      return toast.error('Please fill in all fields');
    }
    setLoading(true);
    try {
      const data = await login(form);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-grid" />
      <div className="auth-bg-glow" />

      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon" style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎓</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>StudentHub Portal</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Achievement Management System</div>
          </div>
        </div>

        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in with your registration number or email</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Registration No. / Email</label>
            <input
              className="form-input"
              placeholder="e.g. 21CSE1001 or student@college.edu"
              value={form.identifier}
              onChange={e => setForm({ ...form, identifier: e.target.value })}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15, marginTop: 8 }} disabled={loading}>
            {loading ? <><span className="spinner" /> Signing in...</> : '🔐 Sign In'}
          </button>
        </form>

        <div style={{ margin: '20px 0', height: 1, background: 'var(--border)' }} />

        <div className="alert alert-info" style={{ fontSize: 12 }}>
          <span>ℹ️</span>
          <div>
            <strong>Demo Credentials:</strong><br />
            Admin: admin@college.edu / admin123<br />
            Student: Register a new account to get started
          </div>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
}
