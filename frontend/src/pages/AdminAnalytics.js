import React, { useState, useEffect } from 'react';
import { adminAPI, aiAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiReport, setAiReport] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [reportForm, setReportForm] = useState({ academicYear: '2024-25', branch: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [toggleLoading, setToggleLoading] = useState(null);
  const [studentPage, setStudentPage] = useState(1);
  const [studentTotal, setStudentTotal] = useState(0);

  useEffect(() => {
    Promise.all([
      adminAPI.getAnalytics(),
      adminAPI.getStudents({ page: studentPage, limit: 15, search: searchQuery })
    ]).then(([aRes, sRes]) => {
      setAnalytics(aRes.data);
      setStudents(sRes.data.students);
      setStudentTotal(sRes.data.total);
    }).catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [studentPage, searchQuery]);

  const handleGenerateReport = async () => {
    setAiLoading(true);
    try {
      const res = await aiAPI.accreditationReport(reportForm);
      setAiReport(res.data.report);
      toast.success('Accreditation report generated!');
    } catch (err) {
      if (err.response?.data?.message?.includes('API')) {
        setAiReport('⚠️ Please configure ANTHROPIC_API_KEY in backend/.env to use AI features.');
      } else {
        toast.error('Failed to generate report');
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleToggleStudent = async (id) => {
    setToggleLoading(id);
    try {
      const res = await adminAPI.toggleStudent(id);
      setStudents(prev => prev.map(s => s._id === id ? { ...s, isActive: res.data.isActive } : s));
      toast.success(res.data.message);
    } catch { toast.error('Toggle failed'); }
    finally { setToggleLoading(null); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loader" /></div>;

  const programData = {};
  analytics?.programDistribution?.forEach(({ _id, count }) => {
    const key = `${_id.program}/${_id.branch}`;
    programData[key] = count;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="page-subtitle">Institution-wide academic achievement analytics</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Category Distribution */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>📊 Category Distribution</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {analytics?.achievementsByCategory?.map(({ _id, count }) => {
              const total = analytics.totalAchievements || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={_id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{_id?.replace(/_/g, ' ')}</span>
                    <span style={{ fontWeight: 600 }}>{count} ({pct}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Program Distribution */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>🎓 Program / Branch Distribution</div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Program</th><th>Branch</th><th>Students</th></tr></thead>
              <tbody>
                {analytics?.programDistribution?.sort((a, b) => b.count - a.count).map(({ _id, count }) => (
                  <tr key={`${_id.program}-${_id.branch}`}>
                    <td>{_id.program}</td>
                    <td>{_id.branch}</td>
                    <td style={{ fontWeight: 700 }}>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Accreditation Report */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">🤖 AI Accreditation Report Generator</div>
          <span className="badge badge-purple">NAAC / NBA</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          Generate a formal accreditation-ready summary of student achievements for NAAC/NBA documentation.
        </p>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Academic Year</label>
            <select className="form-select" value={reportForm.academicYear} onChange={e => setReportForm(f => ({ ...f, academicYear: e.target.value }))}>
              {['2024-25', '2023-24', '2022-23', '2021-22'].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary" onClick={handleGenerateReport} disabled={aiLoading}>
              {aiLoading ? <><span className="spinner" /> Generating...</> : '✨ Generate Report'}
            </button>
          </div>
        </div>
        {aiReport && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>AI Generated Report — {reportForm.academicYear}</span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { navigator.clipboard.writeText(aiReport); toast.success('Copied!'); }}
              >
                📋 Copy Report
              </button>
            </div>
            <div className="ai-response">{aiReport}</div>
          </div>
        )}
      </div>

      {/* Student Management */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">👥 Student Management ({studentTotal} total)</div>
        </div>

        <div className="search-bar" style={{ marginBottom: 16 }}>
          <span>🔍</span>
          <input
            placeholder="Search by name, reg no., email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Reg. No.</th>
                <th>Program</th>
                <th>Category</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s._id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{s.firstName} {s.lastName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.email}</div>
                  </td>
                  <td className="mono" style={{ fontSize: 12 }}>{s.registrationNumber}</td>
                  <td>
                    <div style={{ fontSize: 12 }}>{s.program}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.branch}</div>
                  </td>
                  <td><span className="badge badge-blue" style={{ fontSize: 10 }}>{s.admissionCategory}</span></td>
                  <td style={{ fontSize: 12 }}>{new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <span className={`badge ${s.isActive ? 'badge-green' : 'badge-red'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${s.isActive ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => handleToggleStudent(s._id)}
                      disabled={toggleLoading === s._id}
                      style={{ fontSize: 11 }}
                    >
                      {toggleLoading === s._id ? '...' : s.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {studentTotal > 15 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            <button className="btn btn-secondary btn-sm" disabled={studentPage === 1} onClick={() => setStudentPage(p => p - 1)}>← Prev</button>
            <span style={{ padding: '6px 12px', fontSize: 13, color: 'var(--text-muted)' }}>Page {studentPage}</span>
            <button className="btn btn-secondary btn-sm" disabled={students.length < 15} onClick={() => setStudentPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
