import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
  HACKATHON: '💻', INTERNSHIP: '🏢', RESEARCH_PUBLICATION: '📄',
  TECHNICAL_COMPETITION: '⚡', CULTURAL: '🎭', SPORTS: '🏅',
  WORKSHOP_SEMINAR: '🎓', CERTIFICATION: '📜', PROJECT: '🚀',
  AWARD_RECOGNITION: '🏆', OTHER: '⭐'
};

const CATEGORY_COLORS = {
  HACKATHON: 'var(--accent)', INTERNSHIP: 'var(--green)',
  RESEARCH_PUBLICATION: 'var(--purple)', TECHNICAL_COMPETITION: 'var(--cyan)',
  CULTURAL: 'var(--amber)', SPORTS: 'var(--red)',
  WORKSHOP_SEMINAR: '#ec4899', CERTIFICATION: '#14b8a6',
  PROJECT: '#f97316', AWARD_RECOGNITION: 'gold', OTHER: 'var(--text-muted)'
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getDashboard()
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div className="loader" />
    </div>
  );

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return '🌅 Good Morning';
    if (h < 17) return '☀️ Good Afternoon';
    return '🌙 Good Evening';
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
        border: '1px solid rgba(59,130,246,0.2)',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.1), transparent)'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{greetingTime()}</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
              {user?.name?.split(' ')[0]} 👋
            </h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span className="chip">{user?.program} • {user?.branch}</span>
              <span className="chip">📅 Batch {user?.batch || `${user?.admissionYear || '2021'}-${(user?.admissionYear || 2021) + 4}`}</span>
              <span className="chip">📚 Semester {user?.currentSemester || 1}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/achievements/add" className="btn btn-primary">
              + Add Achievement
            </Link>
            <Link to="/documents" className="btn btn-secondary">
              📁 Documents
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">🏆</div>
          <div>
            <div className="stat-label">Total Achievements</div>
            <div className="stat-value blue">{data?.totalAchievements || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">📁</div>
          <div>
            <div className="stat-label">Documents Uploaded</div>
            <div className="stat-value green">{data?.totalDocuments || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">📊</div>
          <div>
            <div className="stat-label">Categories Active</div>
            <div className="stat-value purple">{data?.achievementsByCategory?.length || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">📚</div>
          <div>
            <div className="stat-label">Current Semester</div>
            <div className="stat-value amber">{data?.student?.currentSemester || 1}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Achievement Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🎯 Achievement Categories</div>
            <Link to="/achievements" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>View All →</Link>
          </div>
          {data?.achievementsByCategory?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.achievementsByCategory.slice(0, 6).map(({ _id, count }) => (
                <div key={_id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{CATEGORY_ICONS[_id] || '⭐'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13 }}>{_id?.replace('_', ' ')}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{count}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{
                        width: `${(count / data.totalAchievements) * 100}%`,
                        background: CATEGORY_COLORS[_id] || 'var(--accent)'
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 30 }}>
              <div className="empty-icon">🏆</div>
              <h3>No achievements yet</h3>
              <p>Start adding your achievements!</p>
            </div>
          )}
        </div>

        {/* Recent Achievements */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">⚡ Recent Activity</div>
            <Link to="/achievements" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>View All →</Link>
          </div>
          {data?.recentAchievements?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.recentAchievements.map(ach => (
                <div key={ach._id} style={{
                  display: 'flex', gap: 12, padding: '10px',
                  background: 'var(--bg-secondary)', borderRadius: 8,
                  border: '1px solid var(--border)'
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: `${CATEGORY_COLORS[ach.category]}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, flexShrink: 0
                  }}>
                    {CATEGORY_ICONS[ach.category] || '⭐'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ach.title}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className={`badge badge-${ach.status === 'APPROVED' ? 'green' : ach.status === 'REJECTED' ? 'red' : 'amber'}`}>
                        {ach.status}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(ach.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 30 }}>
              <div className="empty-icon">📋</div>
              <h3>No recent activity</h3>
              <p>Your recent achievements will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>⚡ Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { icon: '💻', label: 'Add Hackathon', path: '/achievements/add', color: 'var(--accent)' },
            { icon: '🏢', label: 'Add Internship', path: '/achievements/add', color: 'var(--green)' },
            { icon: '📄', label: 'Add Publication', path: '/achievements/add', color: 'var(--purple)' },
            { icon: '📁', label: 'Upload Document', path: '/documents', color: 'var(--amber)' },
            { icon: '✨', label: 'AI Analysis', path: '/ai-assistant', color: '#ec4899' },
            { icon: '👤', label: 'Edit Profile', path: '/profile', color: 'var(--cyan)' },
          ].map(action => (
            <Link key={action.label} to={action.path} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: 16, borderRadius: 10,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 8, textAlign: 'center', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = action.color;
                  e.currentTarget.style.background = `${action.color}15`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                }}
              >
                <span style={{ fontSize: 24 }}>{action.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
