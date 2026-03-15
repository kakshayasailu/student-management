import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import API from '../utils/api';
import toast from 'react-hot-toast';

const BACKEND_URL = 'https://student-management-r9kr.onrender.com';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [pending, setPending] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);
  const [verifyingDoc, setVerifyingDoc] = useState(null);
  const [activeTab, setActiveTab] = useState('achievements');
  const [docFilter, setDocFilter] = useState('ALL');

  useEffect(() => {
    Promise.all([
      adminAPI.getAnalytics(),
      adminAPI.getPendingAchievements(),
      API.get('/admin/documents')
    ]).then(([aRes, pRes, dRes]) => {
      setAnalytics(aRes.data);
      setPending(pRes.data);
      setDocuments(dRes.data);
    }).catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false));
  }, []);

  const handleVerify = async (id, status) => {
    const notes = status === 'REJECTED' ? window.prompt('Rejection reason (optional):') : '';
    setVerifying(id);
    try {
      await adminAPI.verifyAchievement(id, { status, verificationNotes: notes || '' });
      toast.success(`Achievement ${status.toLowerCase()}`);
      setPending(prev => prev.filter(a => a._id !== id));
    } catch { toast.error('Verification failed'); }
    finally { setVerifying(null); }
  };

  const handleVerifyDoc = async (id) => {
    setVerifyingDoc(id);
    try {
      await adminAPI.verifyDocument(id);
      toast.success('Document verified!');
      setDocuments(prev => prev.map(d => d._id === id ? { ...d, isVerified: true } : d));
    } catch { toast.error('Document verification failed'); }
    finally { setVerifyingDoc(null); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loader" /></div>;

  const LEVEL_BADGE = { COLLEGE: 'badge-gray', DISTRICT: 'badge-blue', STATE: 'badge-cyan', NATIONAL: 'badge-amber', INTERNATIONAL: 'badge-purple' };

  const filteredDocs = docFilter === 'ALL' ? documents : documents.filter(d =>
    docFilter === 'UNVERIFIED' ? !d.isVerified : d.isVerified
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">System overview and verification</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">👥</div>
          <div>
            <div className="stat-label">Total Students</div>
            <div className="stat-value blue">{analytics?.totalStudents || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">🏆</div>
          <div>
            <div className="stat-label">Total Achievements</div>
            <div className="stat-value green">{analytics?.totalAchievements || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">⏳</div>
          <div>
            <div className="stat-label">Pending Review</div>
            <div className="stat-value amber">{analytics?.pendingAchievements || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">📄</div>
          <div>
            <div className="stat-label">Total Documents</div>
            <div className="stat-value purple">{documents.length || 0}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* By Category */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>📊 Achievements by Category</div>
          {analytics?.achievementsByCategory?.slice(0, 8).map(({ _id, count }) => (
            <div key={_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{_id?.replace(/_/g, ' ')}</span>
              <span style={{ fontWeight: 600 }}>{count}</span>
            </div>
          ))}
        </div>

        {/* By Level */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>🌐 Achievements by Level</div>
          {analytics?.achievementsByLevel?.map(({ _id, count }) => (
            <div key={_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span className={`badge ${LEVEL_BADGE[_id] || 'badge-gray'}`}>{_id}</span>
              <span style={{ fontWeight: 700, fontSize: 18 }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
          <button
            className={`btn ${activeTab === 'achievements' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('achievements')}
          >
            ⏳ Pending Achievements ({pending.length})
          </button>
          <button
            className={`btn ${activeTab === 'documents' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('documents')}
          >
            📄 Student Documents ({documents.length})
          </button>
        </div>

        {/* Pending Achievements Tab */}
        {activeTab === 'achievements' && (
          <>
            {pending.length === 0 ? (
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="empty-icon">✅</div>
                <h3>All caught up!</h3>
                <p>No pending achievements to verify</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Achievement</th>
                      <th>Category</th>
                      <th>Level</th>
                      <th>Date</th>
                      <th>Certificate</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map(ach => (
                      <tr key={ach._id}>
                        <td>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>
                            {ach.student?.firstName} {ach.student?.lastName}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {ach.student?.registrationNumber}
                          </div>
                        </td>
                        <td>
                          <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
                            {ach.title}
                          </div>
                          {ach.organizingBody && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ach.organizingBody}</div>
                          )}
                        </td>
                        <td><span className="badge badge-blue" style={{ fontSize: 10 }}>{ach.category?.replace(/_/g, ' ')}</span></td>
                        <td><span className={`badge ${LEVEL_BADGE[ach.level]}`}>{ach.level}</span></td>
                        <td style={{ fontSize: 12 }}>{new Date(ach.startDate).toLocaleDateString('en-IN')}</td>
                        <td>
                          {ach.certificates?.length > 0 ? (
                            <a href={`${BACKEND_URL}${ach.certificates[0].path}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                              👁️ View
                            </a>
                          ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>None</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleVerify(ach._id, 'APPROVED')}
                              disabled={verifying === ach._id}
                            >✅</button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleVerify(ach._id, 'REJECTED')}
                              disabled={verifying === ach._id}
                            >❌</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Student Documents Tab */}
        {activeTab === 'documents' && (
          <>
            {/* Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {['ALL', 'UNVERIFIED', 'VERIFIED'].map(f => (
                <button
                  key={f}
                  className={`btn btn-sm ${docFilter === f ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setDocFilter(f)}
                >
                  {f === 'ALL' ? '📋 All' : f === 'UNVERIFIED' ? '⏳ Pending' : '✅ Verified'}
                </button>
              ))}
            </div>

            {filteredDocs.length === 0 ? (
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="empty-icon">📄</div>
                <h3>No documents found</h3>
                <p>No student documents uploaded yet</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Document Type</th>
                      <th>File Name</th>
                      <th>Uploaded On</th>
                      <th>Status</th>
                      <th>View</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.map(doc => (
                      <tr key={doc._id}>
                        <td>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>
                            {doc.student?.firstName} {doc.student?.lastName}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {doc.registrationNumber}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-blue" style={{ fontSize: 10 }}>
                            {doc.documentType?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ fontSize: 12 }}>{doc.originalName}</td>
                        <td style={{ fontSize: 12 }}>
                          {new Date(doc.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td>
                          {doc.isVerified ? (
                            <span className="badge badge-green">✅ Verified</span>
                          ) : (
                            <span className="badge badge-amber">⏳ Pending</span>
                          )}
                        </td>
                        <td>
                          <a
                            href={doc.path}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-ghost btn-sm"
                          >
                            👁️ View
                          </a>
                        </td>
                        <td>
                          {!doc.isVerified ? (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleVerifyDoc(doc._id)}
                              disabled={verifyingDoc === doc._id}
                            >
                              {verifyingDoc === doc._id ? '...' : '✅ Verify'}
                            </button>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Done</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Recent Students */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-title" style={{ marginBottom: 14 }}>🆕 Recently Registered Students</div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Name</th><th>Reg. No.</th><th>Program</th><th>Branch</th><th>Category</th><th>Joined</th></tr></thead>
            <tbody>
              {analytics?.recentStudents?.map(s => (
                <tr key={s._id}>
                  <td style={{ fontWeight: 500 }}>{s.firstName} {s.lastName}</td>
                  <td className="mono" style={{ fontSize: 12 }}>{s.registrationNumber}</td>
                  <td>{s.program}</td>
                  <td>{s.branch}</td>
                  <td><span className="badge badge-purple" style={{ fontSize: 10 }}>{s.admissionCategory}</span></td>
                  <td style={{ fontSize: 12 }}>{new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}