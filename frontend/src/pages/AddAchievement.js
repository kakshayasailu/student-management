import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { achievementAPI } from '../utils/api';

const CATEGORIES = [
  { value: 'HACKATHON', label: '💻 Hackathon', fields: ['teamEvent', 'prize'] },
  { value: 'INTERNSHIP', label: '🏢 Internship', fields: ['company', 'internship'] },
  { value: 'RESEARCH_PUBLICATION', label: '📄 Research Publication', fields: ['publication'] },
  { value: 'TECHNICAL_COMPETITION', label: '⚡ Technical Competition', fields: ['teamEvent', 'prize'] },
  { value: 'CULTURAL', label: '🎭 Cultural Activity', fields: ['teamEvent'] },
  { value: 'SPORTS', label: '🏅 Sports', fields: ['teamEvent', 'prize'] },
  { value: 'WORKSHOP_SEMINAR', label: '🎓 Workshop/Seminar', fields: [] },
  { value: 'CERTIFICATION', label: '📜 Certification', fields: [] },
  { value: 'PROJECT', label: '🚀 Project', fields: ['teamEvent'] },
  { value: 'AWARD_RECOGNITION', label: '🏆 Award/Recognition', fields: ['prize'] },
  { value: 'OTHER', label: '⭐ Other', fields: [] },
];

const LEVELS = ['COLLEGE', 'DISTRICT', 'STATE', 'NATIONAL', 'INTERNATIONAL'];
const ACADEMIC_YEARS = ['2024-25', '2023-24', '2022-23', '2021-22', '2020-21'];

export default function AddAchievement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);

  const [form, setForm] = useState({
    category: 'HACKATHON', title: '', description: '', organizingBody: '', venue: '',
    level: 'COLLEGE', position: '', prize: '', isTeamEvent: false, teamSize: '',
    teamName: '', startDate: '', endDate: '', duration: '', academicYear: '2024-25',
    semester: '', publicationTitle: '', journalConferenceName: '', issn: '', doi: '',
    impactFactor: '', companyName: '', internshipRole: '', stipend: '', mentorName: ''
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const onDrop = useCallback(acceptedFiles => {
    setFiles(prev => [...prev, ...acceptedFiles].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [] },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024
  });

  const selectedCat = CATEGORIES.find(c => c.value === form.category);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.startDate || !form.academicYear) {
      return toast.error('Please fill all required fields');
    }
    setLoading(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) fd.append(k, v);
      });
      files.forEach(file => fd.append('certificates', file));

      await achievementAPI.create(fd);
      toast.success('Achievement added successfully!');
      navigate('/achievements');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add achievement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Add Achievement</h1>
          <p className="page-subtitle">Document your accomplishment for your portfolio</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Category Selection */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title" style={{ marginBottom: 14 }}>📂 Achievement Category</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 8 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value} type="button"
                onClick={() => set('category', cat.value)}
                style={{
                  padding: '10px 12px', borderRadius: 8, border: '1px solid',
                  cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: 500,
                  fontFamily: 'inherit',
                  background: form.category === cat.value ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                  borderColor: form.category === cat.value ? 'rgba(59,130,246,0.4)' : 'var(--border)',
                  color: form.category === cat.value ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Basic Details */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title" style={{ marginBottom: 14 }}>📝 Basic Details</div>

          <div className="form-group">
            <label className="form-label">Title <span className="required">*</span></label>
            <input className="form-input" placeholder="e.g. Smart India Hackathon 2024 - Winner" value={form.title} onChange={e => set('title', e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Describe your achievement, what you did, impact created..." value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Organizing Body</label>
              <input className="form-input" placeholder="e.g. AICTE, IEEE, Company Name" value={form.organizingBody} onChange={e => set('organizingBody', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Venue</label>
              <input className="form-input" placeholder="e.g. IIT Bombay, Online" value={form.venue} onChange={e => set('venue', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Level <span className="required">*</span></label>
              <select className="form-select" value={form.level} onChange={e => set('level', e.target.value)}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Position/Result</label>
              <input className="form-input" placeholder="e.g. 1st Place, Participant, Winner" value={form.position} onChange={e => set('position', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Academic Year <span className="required">*</span></label>
              <select className="form-select" value={form.academicYear} onChange={e => set('academicYear', e.target.value)}>
                {ACADEMIC_YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Semester</label>
              <select className="form-select" value={form.semester} onChange={e => set('semester', e.target.value)}>
                <option value="">Select</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Start Date <span className="required">*</span></label>
              <input className="form-input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input className="form-input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Category-specific fields */}
        {(selectedCat?.fields.includes('teamEvent')) && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 14 }}>👥 Team Details</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <input type="checkbox" id="teamEvent" checked={form.isTeamEvent} onChange={e => set('isTeamEvent', e.target.checked)} />
              <label htmlFor="teamEvent" style={{ fontSize: 14, cursor: 'pointer' }}>This was a team event</label>
            </div>
            {form.isTeamEvent && (
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Team Name</label><input className="form-input" value={form.teamName} onChange={e => set('teamName', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Team Size</label><input className="form-input" type="number" min="2" max="20" value={form.teamSize} onChange={e => set('teamSize', e.target.value)} /></div>
              </div>
            )}
            {selectedCat?.fields.includes('prize') && (
              <div className="form-group"><label className="form-label">Prize/Award</label><input className="form-input" placeholder="e.g. ₹50,000 cash prize, Certificate" value={form.prize} onChange={e => set('prize', e.target.value)} /></div>
            )}
          </div>
        )}

        {form.category === 'INTERNSHIP' && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 14 }}>🏢 Internship Details</div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Company Name</label><input className="form-input" value={form.companyName} onChange={e => set('companyName', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Role/Domain</label><input className="form-input" placeholder="e.g. Software Developer Intern" value={form.internshipRole} onChange={e => set('internshipRole', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Stipend (₹/month)</label><input className="form-input" type="number" value={form.stipend} onChange={e => set('stipend', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Duration</label><input className="form-input" placeholder="e.g. 3 months" value={form.duration} onChange={e => set('duration', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Mentor Name</label><input className="form-input" value={form.mentorName} onChange={e => set('mentorName', e.target.value)} /></div>
            </div>
          </div>
        )}

        {form.category === 'RESEARCH_PUBLICATION' && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 14 }}>📄 Publication Details</div>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Publication Title</label><input className="form-input" value={form.publicationTitle} onChange={e => set('publicationTitle', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Journal/Conference Name</label><input className="form-input" value={form.journalConferenceName} onChange={e => set('journalConferenceName', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">ISSN</label><input className="form-input" value={form.issn} onChange={e => set('issn', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">DOI</label><input className="form-input" value={form.doi} onChange={e => set('doi', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Impact Factor</label><input className="form-input" type="number" step="0.001" value={form.impactFactor} onChange={e => set('impactFactor', e.target.value)} /></div>
            </div>
          </div>
        )}

        {/* Certificate Upload */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title" style={{ marginBottom: 14 }}>📎 Supporting Documents (Optional)</div>
          <div {...getRootProps()} className={`file-dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            <div className="drop-icon">📄</div>
            <p>
              <span>Click to upload</span> or drag & drop certificates here
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>PDF, JPG, PNG up to 10MB each (max 5 files)</p>
          </div>
          {files.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {files.map((f, i) => (
                <div key={i} className="chip" style={{ paddingRight: 6 }}>
                  📎 {f.name.length > 20 ? f.name.substring(0, 20) + '...' : f.name}
                  <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', marginLeft: 4, fontSize: 12 }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? <><span className="spinner" /> Saving...</> : '🏆 Submit Achievement'}
          </button>
        </div>
      </form>
    </div>
  );
}
