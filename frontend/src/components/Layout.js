import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { path: '/profile', icon: '👤', label: 'My Profile' },
  { path: '/achievements', icon: '🏆', label: 'Achievements' },
  { path: '/documents', icon: '📁', label: 'Documents' },
  { path: '/ai-assistant', icon: '✨', label: 'AI Assistant' },
];

const ADMIN_NAV_ITEMS = [
  { path: '/admin', icon: '🎛️', label: 'Admin Dashboard' },
  { path: '/admin/search', icon: '🔍', label: 'Search Student' },
  { path: '/admin/analytics', icon: '📊', label: 'Analytics' },
];

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/profile': 'My Profile',
  '/achievements': 'Achievements',
  '/achievements/add': 'Add Achievement',
  '/documents': 'Documents',
  '/ai-assistant': 'AI Assistant',
  '/admin': 'Admin Dashboard',
  '/admin/search': 'Student Search',
  '/admin/analytics': 'Analytics & Reports',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user ? `${user.name?.split(' ')[0]?.[0] || ''}${user.name?.split(' ')[1]?.[0] || ''}`.toUpperCase() : 'U';
  const pageTitle = PAGE_TITLES[location.pathname] || 'Student Portal';

  return (
    <div className="app-layout">
      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-icon">🎓</div>
            <div className="logo-text">
              <div>Student<span>Hub</span></div>
              <div style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-muted)', letterSpacing: 0.3 }}>Achievement Portal</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="nav-section-label" style={{ marginTop: 12 }}>Admin Panel</div>
              {ADMIN_NAV_ITEMS.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                  end
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">
              {user?.profilePhoto
                ? <img src={`http://localhost:5000${user.profilePhoto}`} alt="profile" />
                : initials
              }
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role === 'admin' ? '👑 Admin' : user?.registrationNumber}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 8 }} onClick={handleLogout}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="top-bar">
          <button
            className="btn btn-ghost btn-sm"
            style={{ display: 'none', padding: '6px' }}
            onClick={() => setSidebarOpen(true)}
            id="menu-btn"
          >
            ☰
          </button>
          <h1 className="top-bar-title">{pageTitle}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user?.role !== 'admin' && (
              <span className="chip">
                📚 Sem {user?.currentSemester || '-'}
              </span>
            )}
            <span className="chip" style={{ background: 'var(--accent-glow)', borderColor: 'rgba(59,130,246,0.2)', color: 'var(--accent)' }}>
              {user?.program} • {user?.branch}
            </span>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
