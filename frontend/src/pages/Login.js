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
    if (!form.identifier || !form.password) return toast.error('Please fill in all fields');
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

      {/* Left side — college visuals (hidden on small screens) */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 16,
        marginRight: 48, maxWidth: 340,
        display: window.innerWidth < 900 ? 'none' : 'flex'
      }}>
        <div style={{ color: 'white', marginBottom: 8 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
            Welcome to
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
            Student Achievement<br />
            <span style={{ color: '#FCE883' }}>Management Portal</span>
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
            Track your academic journey, showcase achievements, and build your digital portfolio — all in one place.
          </div>
        </div>

        {/* Feature highlights */}
        {[
          { icon: '🏆', label: 'Track Achievements', desc: 'Hackathons, internships, publications & more' },
          { icon: '📁', label: 'Document Storage', desc: 'Secure cloud storage for all certificates' },
          { icon: '✨', label: 'AI-Powered Insights', desc: 'Career analysis & personalized recommendations' },
        ].map(f => (
          <div key={f.label} style={{
            display: 'flex', gap: 14, padding: '14px 16px',
            background: 'rgba(255,255,255,0.07)',
            borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(4px)'
          }}>
            <span style={{ fontSize: 24 }}>{f.icon}</span>
            <div>
              <div style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{f.label}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Login Card */}
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-icon">
            <img src="/college-logo.png" alt="College Logo" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#1a1a3e' }}>StudentHub Portal</div>
            <div style={{ fontSize: 12, color: '#8888aa' }}>Achievement Management System</div>
          </div>
        </div>

        {/* Orange top bar accent */}
        <div style={{ height: 4, borderRadius: 2, background: 'linear-gradient(90deg, #FF8243, #FCE883, #069494)', marginBottom: 24 }} />

        <h2 className="auth-title">Welcome Back 👋</h2>
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

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15, marginTop: 8 }}
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Signing in...</> : '🔐 Sign In'}
          </button>
        </form>

        <div style={{ margin: '20px 0', height: 1, background: '#FFE8DF' }} />

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
