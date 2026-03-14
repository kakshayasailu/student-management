import React, { useState } from 'react';
import { aiAPI, studentAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AI_FEATURES = [
  {
    id: 'profile-analysis',
    icon: '🧠',
    title: 'Profile Analysis',
    description: 'Get an AI-powered assessment of your academic profile, strengths, areas of improvement, and career readiness score.',
    color: 'var(--purple)',
    btnLabel: 'Analyze My Profile'
  },
  {
    id: 'resume-content',
    icon: '📄',
    title: 'Resume Content Generator',
    description: 'Generate professional resume content based on your achievements — professional summary, skills, and accomplishments.',
    color: 'var(--accent)',
    btnLabel: 'Generate Resume Content'
  },
  {
    id: 'recommendations',
    icon: '🎯',
    title: 'Opportunity Recommendations',
    description: 'Get personalized recommendations for hackathons, internships, competitions, and certifications to enhance your profile.',
    color: 'var(--green)',
    btnLabel: 'Get Recommendations'
  },
  {
    id: 'achievement-summary',
    icon: '✨',
    title: 'Achievement Summarizer',
    description: 'Generate a professional summary for any of your achievements to make it portfolio-ready.',
    color: 'var(--amber)',
    btnLabel: 'Summarize Achievement'
  },
];

export default function AIAssistant() {
  const [loading, setLoading] = useState(null);
  const [results, setResults] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [selectedAch, setSelectedAch] = useState('');
  const [showAchPicker, setShowAchPicker] = useState(false);

  const handleFeature = async (id) => {
    setLoading(id);
    try {
      let result;
      if (id === 'profile-analysis') {
        const res = await aiAPI.analyzeProfile();
        result = res.data.analysis;
      } else if (id === 'resume-content') {
        const res = await aiAPI.generateResume();
        result = res.data.resumeContent;
      } else if (id === 'recommendations') {
        const res = await aiAPI.getRecommendations();
        result = res.data.recommendations;
      } else if (id === 'achievement-summary') {
        if (!selectedAch) {
          // load achievements
          const res = await studentAPI.getAchievements({ limit: 50 });
          setAchievements(res.data.achievements);
          setShowAchPicker(true);
          setLoading(null);
          return;
        }
        const res = await aiAPI.generateSummary(selectedAch);
        result = res.data.summary;
        setSelectedAch('');
      }
      setResults(prev => ({ ...prev, [id]: result }));
      toast.success('AI response generated!');
    } catch (err) {
      if (err.response?.status === 500 && err.response?.data?.message?.includes('API')) {
        toast.error('Please configure your Anthropic API key in backend/.env');
        setResults(prev => ({ ...prev, [id]: '⚠️ Please add your ANTHROPIC_API_KEY to the backend .env file to use AI features.\n\nGet your API key from: https://console.anthropic.com' }));
      } else {
        toast.error('AI request failed');
      }
    } finally {
      setLoading(null);
    }
  };

  const handleAchievementSelect = async () => {
    if (!selectedAch) return toast.error('Please select an achievement');
    setShowAchPicker(false);
    await handleFeature('achievement-summary');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">✨ AI Assistant</h1>
          <p className="page-subtitle">Powered by Claude AI — your intelligent academic companion</p>
        </div>
      </div>

      <div className="alert alert-info" style={{ marginBottom: 24 }}>
        <span>🤖</span>
        <div>
          <strong>AI-Powered Features</strong> — These tools use Claude AI to analyze your profile and achievements.
          Make sure your Anthropic API key is configured in the backend <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: 4 }}>.env</code> file.
        </div>
      </div>

      {/* Achievement Picker Modal */}
      {showAchPicker && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAchPicker(false)}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div className="modal-title">Select Achievement to Summarize</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAchPicker(false)}>✕</button>
            </div>
            <div className="modal-body">
              {achievements.length === 0 ? (
                <div className="empty-state" style={{ padding: 30 }}>
                  <div className="empty-icon">🏆</div>
                  <h3>No achievements found</h3>
                  <p>Add achievements first to use this feature</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {achievements.map(ach => (
                    <div
                      key={ach._id}
                      onClick={() => setSelectedAch(ach._id)}
                      style={{
                        padding: 12, borderRadius: 8, cursor: 'pointer',
                        border: '1px solid',
                        borderColor: selectedAch === ach._id ? 'var(--amber)' : 'var(--border)',
                        background: selectedAch === ach._id ? 'rgba(245,158,11,0.1)' : 'var(--bg-secondary)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{ach.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {ach.category?.replace('_', ' ')} • {ach.level}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAchPicker(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAchievementSelect} disabled={!selectedAch}>
                ✨ Generate Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {AI_FEATURES.map(feature => (
          <div key={feature.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: `${feature.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, border: `1px solid ${feature.color}30`
              }}>
                {feature.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{feature.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{feature.description}</div>
              </div>
            </div>

            <button
              className="btn"
              style={{
                background: `${feature.color}20`,
                color: feature.color,
                border: `1px solid ${feature.color}30`,
                justifyContent: 'center',
                marginBottom: results[feature.id] ? 14 : 0,
              }}
              onClick={() => handleFeature(feature.id)}
              disabled={loading === feature.id}
            >
              {loading === feature.id ? (
                <><span className="spinner" style={{ borderTopColor: feature.color }} /> Generating...</>
              ) : (
                <>{feature.icon} {feature.btnLabel}</>
              )}
            </button>

            {results[feature.id] && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: feature.color }}>✨</span> AI Response
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(results[feature.id]);
                      toast.success('Copied to clipboard!');
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ marginLeft: 'auto', padding: '2px 8px', fontSize: 11 }}
                  >
                    📋 Copy
                  </button>
                </div>
                <div className="ai-response" style={{ borderLeftColor: feature.color, maxHeight: 300, overflow: 'auto' }}>
                  {results[feature.id]}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-title" style={{ marginBottom: 12 }}>💡 Tips for Better Results</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { icon: '📊', tip: 'Add semester results in your profile for better career readiness scoring' },
            { icon: '🏆', tip: 'Upload certificates with achievements to verify them with admin' },
            { icon: '📝', tip: 'Write detailed descriptions for achievements for richer AI summaries' },
            { icon: '🔄', tip: 'Regenerate responses anytime — AI improves as you add more data' },
          ].map((item, i) => (
            <div key={i} style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
