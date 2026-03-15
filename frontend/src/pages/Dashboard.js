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
  HACKATHON: '#FF8243', INTERNSHIP: '#069494',
  RESEARCH_PUBLICATION: '#5b4fcf', TECHNICAL_COMPETITION: '#e06530',
  CULTURAL: '#FCE883', SPORTS: '#e05555',
  WORKSHOP_SEMINAR: '#ec4899', CERTIFICATION: '#14b8a6',
  PROJECT: '#f97316', AWARD_RECOGNITION: '#gold', OTHER: '#8888aa'
};

// College-related Unsplash image URLs
const COLLEGE_IMAGES = [
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80', // students in library
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80', // college campus
  'https://images.unsplash.com/photo-1581726707445-75cbe4efc586?w=800&q=80', // students studying
];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx] = useState(Math.floor(Math.random() * COLLEGE_IMAGES.length));

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
      {/* College Banner Image */}
      <div style={{
        width: '100%', height: 160, borderRadius: 16, overflow: 'hidden',
        marginBottom: 20, position: 'relative'
      }}>
        <img
          src={COLLEGE_IMAGES[imgIdx]}
          alt="College"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(26,26,62,0.85) 0%, rgba(6,148,148,0.4) 100%)',
          display: 'flex', alignItems: 'center', padding: '0 28px'
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4, letterSpacing: 1 }}>
              {greetingTime()}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'white' }}>
              Welcome, {user?.name?.split(' ')[0]}! 👋
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
              {user?.program} • {user?.branch} • Batch {user?.batch}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon amber">🏆</div>
          <div>
            <div className="stat-label">Total Achievements</div>
            <div className="stat-value amber">{data?.totalAchievements || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📁</div>
          <div>
            <div className="stat-label">Documents Uploaded</div>
            <div className="stat-value blue">{data?.totalDocuments || 0}</div>
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
          <div className="stat-icon green">📚</div>
          <div>
            <div className="stat-label">Current Semester</div>
            <div className="stat-value green">{data?.student?.currentSemester || 1}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Achievement Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🎯 Achievement Categories</div>
            <Link to="/achievements" style={{ fontSize: 12, color: '#FF8243', textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
          </div>
          {data?.achievementsByCategory?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.achievementsByCategory.slice(0, 6).map(({ _id, count }) => (
                <div key={_id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{CATEGORY_ICONS[_id] || '⭐'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{_id?.replace(/_/g, ' ')}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#FF8243' }}>{count}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(count / data.totalAchievements) * 100}%` }} />
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

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">⚡ Recent Activity</div>
            <Link to="/achievements" style={{ fontSize: 12, color: '#FF8243', textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
          </div>
          {data?.recentAchievements?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.recentAchievements.map(ach => (
                <div key={ach._id} style={{
                  display: 'flex', gap: 12, padding: 10,
                  background: '#FFF8F5', borderRadius: 10,
                  border: '1px solid #FFE8DF'
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: `rgba(255,130,67,0.12)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, flexShrink: 0
                  }}>
                    {CATEGORY_ICONS[ach.category] || '⭐'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1a1a3e' }}>
                      {ach.title}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className={`badge badge-${ach.status === 'APPROVED' ? 'green' : ach.status === 'REJECTED' ? 'red' : 'amber'}`}>
                        {ach.status}
                      </span>
                      <span style={{ fontSize: 11, color: '#8888aa' }}>
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

      {/* Students image strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[
          { img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=80', label: '🏆 Achievements' },
          { img: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=400&q=80', label: '📚 Learning' },
          { img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80', label: '🤝 Collaboration' },
        ].map(({ img, label }) => (
          <div key={label} style={{ borderRadius: 12, overflow: 'hidden', position: 'relative', height: 100 }}>
            <img src={img} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.parentElement.style.background = '#FFE8DF'; e.target.style.display = 'none'; }} />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(transparent, rgba(26,26,62,0.8))',
              padding: '16px 12px 8px', color: 'white', fontSize: 12, fontWeight: 600
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>⚡ Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { icon: '💻', label: 'Add Hackathon', path: '/achievements/add', color: '#FF8243' },
            { icon: '🏢', label: 'Add Internship', path: '/achievements/add', color: '#069494' },
            { icon: '📄', label: 'Add Publication', path: '/achievements/add', color: '#5b4fcf' },
            { icon: '📁', label: 'Upload Document', path: '/documents', color: '#FCE883', textColor: '#c05000' },
            { icon: '✨', label: 'AI Analysis', path: '/ai-assistant', color: '#ec4899' },
            { icon: '👤', label: 'Edit Profile', path: '/profile', color: '#069494' },
          ].map(action => (
            <Link key={action.label} to={action.path} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: 16, borderRadius: 12,
                background: `${action.color}12`,
                border: `1.5px solid ${action.color}30`,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 8, textAlign: 'center', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${action.color}20`;
                  e.currentTarget.style.borderColor = action.color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = `${action.color}12`;
                  e.currentTarget.style.borderColor = `${action.color}30`;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: 26 }}>{action.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: action.textColor || action.color }}>{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
