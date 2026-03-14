import React, { useState } from 'react';
import { adminAPI } from '../utils/api';
import toast from 'react-hot-toast';

const DOC_ICONS = {
  MARK_MEMO: '📊', AADHAAR_CARD: '🪪', PAN_CARD: '💳', VOTER_ID: '🗳️',
  APAAR_ABC_ID: '🎓', PASSPORT: '📘', OTHER: '📁'
};

const LEVEL_BADGE = { COLLEGE: 'badge-gray', DISTRICT: 'badge-blue', STATE: 'badge-cyan', NATIONAL: 'badge-amber', INTERNATIONAL: 'badge-purple' };
const STATUS_BADGE = { APPROVED: 'badge-green', REJECTED: 'badge-red', PENDING: 'badge-amber' };

const CATEGORY_ICONS = {
  HACKATHON: '💻', INTERNSHIP: '🏢', RESEARCH_PUBLICATION: '📄',
  TECHNICAL_COMPETITION: '⚡', CULTURAL: '🎭', SPORTS: '🏅',
  WORKSHOP_SEMINAR: '🎓', CERTIFICATION: '📜', PROJECT: '🚀',
  AWARD_RECOGNITION: '🏆', OTHER: '⭐'
};

export default function AdminStudentSearch() {
  const [regNo, setRegNo] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!regNo.trim()) return toast.error('Enter a registration number');
    setLoading(true);
    try {
      const res = await adminAPI.searchStudent(regNo.trim());
      setResult(res.data);
      setActiveTab('profile');
      toast.success('Student found!');
    } catch (err) {
      if (err.response?.status === 404) toast.error('Student not found');
      else toast.error('Search failed');
      setResult(null);
    } finally { setLoading(false); }
  };

  const handleVerifyDoc = async (docId) => {
    try {
      await adminAPI.verifyDocument(docId);
      toast.success('Document verified!');
      setResult(prev => ({
        ...prev,
        documents: prev.documents.map(d => d._id === docId ? { ...d, isVerified: true } : d)
      }));
    } catch { toast.error('Verification failed'); }
  };

  const s = result?.student;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Search</h1>
          <p className="page-subtitle">Look up complete student profiles by registration number</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: 24 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12 }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <span>🔍</span>
            <input
              placeholder="Enter Registration Number (e.g. 21CSE1001)"
              value={regNo}
              onChange={e => setRegNo(e.target.value.toUpperCase())}
              style={{ textTransform: 'uppercase' }}
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><span className="spinner" /> Searching...</> : '🔍 Search'}
          </button>
        </form>
      </div>

      {result && s && (
        <>
          {/* Student Header Card */}
          <div className="card" style={{
            marginBottom: 20,
            background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))',
            border: '1px solid rgba(59,130,246,0.2)'
          }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--accent), var(--purple))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 700, overflow: 'hidden',
                border: '3px solid rgba(59,130,246,0.3)'
              }}>
                {s.profilePhoto
                  ? <img src={`http://localhost:5000${s.profilePhoto}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : `${s.firstName?.[0]}${s.lastName?.[0]}`
                }
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{s.firstName} {s.lastName}</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
                  <span className="badge badge-blue">{s.registrationNumber}</span>
                  <span className="chip">{s.program} • {s.branch}</span>
                  <span className="chip">📅 {s.batch}</span>
                  <span className="chip">📚 Sem {s.currentSemester}</span>
                  <span className={`badge ${s.isActive ? 'badge-green' : 'badge-red'}`}>
                    {s.isActive ? '✅ Active' : '❌ Deactivated'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ textAlign: 'right', marginRight: 8 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>
                    {result.achievements.length}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Achievements</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>
                    {result.documents.length}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Documents</div>
                </div>
              </div>
            </div>
          </div>

          <div className="tabs">
            {[['profile','👤 Profile'],['achievements','🏆 Achievements'],['documents','📁 Documents'],['results','📊 Results']].map(([k, l]) => (
              <button key={k} className={`tab ${activeTab === k ? 'active' : ''}`} onClick={() => setActiveTab(k)}>{l}</button>
            ))}
          </div>

          {activeTab === 'profile' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}>Personal Details</div>
                {[
                  ['Email', s.email], ['Phone', s.phone],
                  ['Date of Birth', s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString('en-IN') : '-'],
                  ['Gender', s.gender], ['Blood Group', s.bloodGroup || '-'],
                  ['Nationality', s.nationality], ['Religion', s.religion || '-'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}>Academic Details</div>
                {[
                  ['Roll No.', s.rollNumber || '-'],
                  ['Hall Ticket', s.hallTicketNumber || '-'],
                  ['Section', s.section || '-'],
                  ['Admission Category', s.admissionCategory],
                  ['Admission Year', s.admissionYear],
                  ['Entrance Rank', s.entranceExamRank || '-'],
                  ['Last Login', s.lastLogin ? new Date(s.lastLogin).toLocaleDateString('en-IN') : 'Never'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}>Parent Info</div>
                {[
                  ['Father', s.fatherName || '-'],
                  ['Father Phone', s.fatherPhone || '-'],
                  ['Mother', s.motherName || '-'],
                  ['Mother Phone', s.motherPhone || '-'],
                  ['Family Income', s.annualFamilyIncome ? `₹${s.annualFamilyIncome.toLocaleString('en-IN')}` : '-'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}>Address</div>
                {s.permanentAddress?.city && (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                    {s.permanentAddress.street && <div>{s.permanentAddress.street}</div>}
                    <div>{s.permanentAddress.city}, {s.permanentAddress.district}</div>
                    <div>{s.permanentAddress.state} - {s.permanentAddress.pincode}</div>
                  </div>
                ) || <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Not provided</div>}
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">🏆 All Achievements ({result.achievements.length})</div>
              </div>
              {result.achievements.length === 0 ? (
                <div className="empty-state" style={{ padding: 40 }}><div className="empty-icon">🏆</div><h3>No achievements yet</h3></div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead><tr><th>Title</th><th>Category</th><th>Level</th><th>Position</th><th>Year</th><th>Status</th><th>Certificate</th></tr></thead>
                    <tbody>
                      {result.achievements.map(a => (
                        <tr key={a._id}>
                          <td style={{ maxWidth: 220 }}>
                            <div style={{ fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
                            {a.organizingBody && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.organizingBody}</div>}
                          </td>
                          <td><span style={{ fontSize: 16 }}>{CATEGORY_ICONS[a.category]}</span></td>
                          <td><span className={`badge ${LEVEL_BADGE[a.level]}`}>{a.level}</span></td>
                          <td style={{ fontSize: 12 }}>{a.position || '-'}</td>
                          <td style={{ fontSize: 12 }}>{a.academicYear}</td>
                          <td><span className={`badge ${STATUS_BADGE[a.status]}`}>{a.status}</span></td>
                          <td>
                            {a.certificates?.length > 0
                              ? <a href={`http://localhost:5000${a.certificates[0].path}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">👁️ View</a>
                              : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>None</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">📁 Documents ({result.documents.length})</div>
              </div>
              {result.documents.length === 0 ? (
                <div className="empty-state" style={{ padding: 40 }}><div className="empty-icon">📁</div><h3>No documents uploaded</h3></div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {result.documents.map(doc => (
                    <div key={doc._id} style={{ padding: 14, background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)', display: 'flex', gap: 12 }}>
                      <div style={{ fontSize: 24 }}>{DOC_ICONS[doc.documentType] || '📁'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{doc.documentType.replace(/_/g, ' ')}</div>
                        {doc.semester && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sem {doc.semester} • {doc.academicYear}</div>}
                        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                          {doc.isVerified
                            ? <span className="badge badge-green" style={{ fontSize: 10 }}>✅ Verified</span>
                            : <button className="btn btn-success btn-sm" style={{ fontSize: 11 }} onClick={() => handleVerifyDoc(doc._id)}>✅ Verify</button>
                          }
                          <a href={`http://localhost:5000${doc.path}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>👁️ View</a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'results' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 14 }}>📊 Semester Results</div>
              {s.semesterResults?.length > 0 ? (
                <div className="table-wrapper">
                  <table>
                    <thead><tr><th>Semester</th><th>Academic Year</th><th>SGPA</th><th>CGPA</th><th>Backlogs</th><th>Status</th></tr></thead>
                    <tbody>
                      {s.semesterResults.sort((a,b) => a.semester - b.semester).map(r => (
                        <tr key={r.semester}>
                          <td>Semester {r.semester}</td>
                          <td>{r.academicYear}</td>
                          <td style={{ fontWeight: 700, color: r.sgpa >= 8 ? 'var(--green)' : r.sgpa >= 6 ? 'var(--amber)' : 'var(--red)' }}>{r.sgpa?.toFixed(2)}</td>
                          <td style={{ fontWeight: 700 }}>{r.cgpa?.toFixed(2)}</td>
                          <td>{r.backlogs}</td>
                          <td><span className={`badge badge-${r.status === 'PASS' ? 'green' : r.status === 'FAIL' ? 'red' : 'amber'}`}>{r.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: 40 }}><div className="empty-icon">📊</div><h3>No results entered</h3></div>
              )}
            </div>
          )}
        </>
      )}

      {!result && !loading && (
        <div className="empty-state" style={{ padding: 80 }}>
          <div className="empty-icon">🔍</div>
          <h3>Search for a Student</h3>
          <p>Enter a registration number to view the complete student profile, documents, and achievements</p>
        </div>
      )}
    </div>
  );
}
