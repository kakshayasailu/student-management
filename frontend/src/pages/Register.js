import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const PROGRAMS = ['B.Tech', 'M.Tech', 'MBA', 'MCA', 'B.Sc', 'M.Sc', 'Ph.D'];
const BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML', 'DS', 'CHEM', 'MBA', 'MCA', 'Other'];
const CATEGORIES = ['VSAT', 'EAMCET', 'JEE', 'MANAGEMENT', 'NRI', 'LATERAL_ENTRY', 'OTHER'];

export default function Register() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    registrationNumber: '', firstName: '', lastName: '',
    email: '', phone: '', dateOfBirth: '', gender: '',
    admissionCategory: '', admissionYear: new Date().getFullYear(),
    program: '', branch: '', password: '', confirmPassword: ''
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await register(data);
      toast.success('Registration successful! Welcome to StudentHub!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-grid" />
      <div className="auth-bg-glow" />

      <div className="auth-card" style={{ maxWidth: 560 }}>
        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-icon">
            <img src="/college-logo.png" alt="College Logo" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#1a1a3e' }}>StudentHub Portal</div>
            <div style={{ fontSize: 12, color: '#8888aa' }}>Create your academic profile</div>
          </div>
        </div>

        {/* Color bar */}
        <div style={{ height: 4, borderRadius: 2, background: 'linear-gradient(90deg, #FF8243, #FCE883, #069494)', marginBottom: 24 }} />

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              flex: 1, height: 5, borderRadius: 3,
              background: step >= s
                ? 'linear-gradient(90deg, #FF8243, #069494)'
                : '#FFE8DF',
              transition: 'background 0.3s'
            }} />
          ))}
        </div>

        <h2 className="auth-title">{step === 1 ? '👤 Personal Details' : '🎓 Academic Details'}</h2>
        <p className="auth-subtitle">Step {step} of 2 — Fill in your information</p>

        <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); setStep(2); }}>
          {step === 1 && (
            <>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">First Name <span className="required">*</span></label>
                  <input className="form-input" placeholder="First name" value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name <span className="required">*</span></label>
                  <input className="form-input" placeholder="Last name" value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address <span className="required">*</span></label>
                <input className="form-input" type="email" placeholder="student@college.edu" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Phone <span className="required">*</span></label>
                  <input className="form-input" placeholder="10-digit mobile" value={form.phone} onChange={e => set('phone', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth <span className="required">*</span></label>
                  <input className="form-input" type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Gender <span className="required">*</span></label>
                <select className="form-select" value={form.gender} onChange={e => set('gender', e.target.value)} required>
                  <option value="">Select gender</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Password <span className="required">*</span></label>
                  <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password <span className="required">*</span></label>
                  <input className="form-input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-group">
                <label className="form-label">Registration Number <span className="required">*</span></label>
                <input className="form-input" placeholder="e.g. 21CSE1001" value={form.registrationNumber} onChange={e => set('registrationNumber', e.target.value)} required />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Program <span className="required">*</span></label>
                  <select className="form-select" value={form.program} onChange={e => set('program', e.target.value)} required>
                    <option value="">Select program</option>
                    {PROGRAMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Branch <span className="required">*</span></label>
                  <select className="form-select" value={form.branch} onChange={e => set('branch', e.target.value)} required>
                    <option value="">Select branch</option>
                    {BRANCHES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Admission Category <span className="required">*</span></label>
                  <select className="form-select" value={form.admissionCategory} onChange={e => set('admissionCategory', e.target.value)} required>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Admission Year <span className="required">*</span></label>
                  <input className="form-input" type="number" min="2015" max="2030" value={form.admissionYear} onChange={e => set('admissionYear', e.target.value)} required />
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            {step === 2 && (
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>
                ← Back
              </button>
            )}
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
              {loading ? <><span className="spinner" /> Registering...</> : step === 1 ? 'Next →' : '🎓 Create Account'}
            </button>
          </div>
        </form>

        <div className="auth-footer" style={{ marginTop: 20 }}>
          Already registered? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
}
