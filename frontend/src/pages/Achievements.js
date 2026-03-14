import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI, achievementAPI } from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
  HACKATHON: '💻', INTERNSHIP: '🏢', RESEARCH_PUBLICATION: '📄',
  TECHNICAL_COMPETITION: '⚡', CULTURAL: '🎭', SPORTS: '🏅',
  WORKSHOP_SEMINAR: '🎓', CERTIFICATION: '📜', PROJECT: '🚀',
  AWARD_RECOGNITION: '🏆', OTHER: '⭐'
};

const LEVEL_BADGE = {
  COLLEGE: 'badge-gray', DISTRICT: 'badge-blue', STATE: 'badge-cyan',
  NATIONAL: 'badge-amber', INTERNATIONAL: 'badge-purple'
};

const STATUS_BADGE = { APPROVED: 'badge-green', REJECTED: 'badge-red', PENDING: 'badge-amber' };

const CATEGORIES = ['ALL', 'HACKATHON', 'INTERNSHIP', 'RESEARCH_PUBLICATION', 'TECHNICAL_COMPETITION', 'CULTURAL', 'SPORTS', 'WORKSHOP_SEMINAR', 'CERTIFICATION', 'PROJECT', 'AWARD_RECOGNITION', 'OTHER'];

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: 'ALL', academicYear: '', status: '' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState(null);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (filter.category !== 'ALL') params.category = filter.category;
      if (filter.academicYear) params.academicYear = filter.academicYear;
      if (filter.status) params.status = filter.status;
      const res = await studentAPI.getAchievements(params);
      setAchievements(res.data.achievements);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAchievements(); }, [filter, page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this achievement?')) return;
    setDeleting(id);
    try {
      await achievementAPI.delete(id);
      toast.success('Achievement deleted');
      fetchAchievements();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = achievements.filter(a =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.organizingBody?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Achievements</h1>
          <p className="page-subtitle">{total} total achievements in your portfolio</p>
        </div>
        <Link to="/achievements/add" className="btn btn-primary">+ Add Achievement</Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <span>🔍</span>
            <input placeholder="Search achievements..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <input className="form-input" style={{ width: 120 }} placeholder="Year e.g. 2023-24" value={filter.academicYear} onChange={e => setFilter(f => ({ ...f, academicYear: e.target.value }))} />
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(f => ({ ...f, category: cat }))}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', border: '1px solid',
                background: filter.category === cat ? 'var(--accent)' : 'transparent',
                borderColor: filter.category === cat ? 'var(--accent)' : 'var(--border)',
                color: filter.category === cat ? 'white' : 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', gap: 4
              }}
            >
              {cat !== 'ALL' && CATEGORY_ICONS[cat]} {cat === 'ALL' ? 'All' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loader" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <h3>No achievements found</h3>
          <p>Start building your portfolio by adding achievements</p>
          <Link to="/achievements/add" className="btn btn-primary" style={{ marginTop: 16 }}>+ Add First Achievement</Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map(ach => (
              <div key={ach._id} className="achievement-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'var(--bg-secondary)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 20
                  }}>
                    {CATEGORY_ICONS[ach.category] || '⭐'}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    <span className={`badge ${STATUS_BADGE[ach.status]}`}>{ach.status}</span>
                    {ach.isVerified && <span title="Verified" style={{ fontSize: 14 }}>✅</span>}
                  </div>
                </div>

                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>{ach.title}</h3>

                {ach.organizingBody && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                    🏛️ {ach.organizingBody}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  <span className={`badge ${LEVEL_BADGE[ach.level] || 'badge-gray'}`}>{ach.level}</span>
                  {ach.position && <span className="badge badge-amber">🥇 {ach.position}</span>}
                  {ach.academicYear && <span className="chip" style={{ fontSize: 10 }}>{ach.academicYear}</span>}
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                  📅 {new Date(ach.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>

                {ach.aiSummary && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 10, padding: '8px', background: 'var(--bg-secondary)', borderRadius: 6, borderLeft: '2px solid var(--purple)' }}>
                    ✨ {ach.aiSummary.substring(0, 120)}...
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  {ach.certificates?.length > 0 && (
                    <a href={`http://localhost:5000${ach.certificates[0].path}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                      📎 Certificate
                    </a>
                  )}
                  {ach.status !== 'APPROVED' && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--red)', marginLeft: 'auto' }}
                      onClick={() => handleDelete(ach._id)}
                      disabled={deleting === ach._id}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {total > 12 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span style={{ padding: '6px 12px', fontSize: 13, color: 'var(--text-muted)' }}>Page {page}</span>
              <button className="btn btn-secondary btn-sm" disabled={achievements.length < 12} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
