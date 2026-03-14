import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Achievements from './pages/Achievements';
import AddAchievement from './pages/AddAchievement';
import Documents from './pages/Documents';
import AIAssistant from './pages/AIAssistant';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudentSearch from './pages/AdminStudentSearch';
import AdminAnalytics from './pages/AdminAnalytics';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen" style={{ background: '#0a0f1e' }}>
      <div className="loader"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1a2035', color: '#e2e8f0', border: '1px solid #2d3748' },
          success: { iconTheme: { primary: '#48bb78', secondary: '#1a2035' } },
          error: { iconTheme: { primary: '#fc8181', secondary: '#1a2035' } }
        }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="achievements/add" element={<AddAchievement />} />
            <Route path="documents" element={<Documents />} />
            <Route path="ai-assistant" element={<AIAssistant />} />
            <Route path="admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/search" element={<ProtectedRoute adminOnly><AdminStudentSearch /></ProtectedRoute>} />
            <Route path="admin/analytics" element={<ProtectedRoute adminOnly><AdminAnalytics /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
