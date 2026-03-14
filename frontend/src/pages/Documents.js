import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { documentAPI } from '../utils/api';

const DOC_TYPES = [
  { value: 'MARK_MEMO', label: '📊 Mark Memo', needsSem: true },
  { value: 'AADHAAR_CARD', label: '🪪 Aadhaar Card' },
  { value: 'PAN_CARD', label: '💳 PAN Card' },
  { value: 'VOTER_ID', label: '🗳️ Voter ID' },
  { value: 'APAAR_ABC_ID', label: '🎓 APAAR / ABC ID' },
  { value: 'PASSPORT', label: '📘 Passport' },
  { value: 'BIRTH_CERTIFICATE', label: '📃 Birth Certificate' },
  { value: 'TRANSFER_CERTIFICATE', label: '📋 Transfer Certificate' },
  { value: 'INCOME_CERTIFICATE', label: '💰 Income Certificate' },
  { value: 'CASTE_CERTIFICATE', label: '📜 Caste Certificate' },
  { value: 'DOMICILE_CERTIFICATE', label: '🏠 Domicile Certificate' },
  { value: 'CHARACTER_CERTIFICATE', label: '⭐ Character Certificate' },
  { value: 'SCHOLARSHIP_DOCUMENT', label: '🎁 Scholarship Document' },
  { value: 'ENTRANCE_SCORECARD', label: '📝 Entrance Scorecard' },
  { value: 'DEGREE_CERTIFICATE', label: '🎓 Degree Certificate' },
  { value: 'OTHER', label: '📁 Other' },
];

const DOC_ICONS = {
  MARK_MEMO: '📊', AADHAAR_CARD: '🪪', PAN_CARD: '💳', VOTER_ID: '🗳️',
  APAAR_ABC_ID: '🎓', PASSPORT: '📘', BIRTH_CERTIFICATE: '📃',
  TRANSFER_CERTIFICATE: '📋', INCOME_CERTIFICATE: '💰', CASTE_CERTIFICATE: '📜',
  DOMICILE_CERTIFICATE: '🏠', CHARACTER_CERTIFICATE: '⭐', SCHOLARSHIP_DOCUMENT: '🎁',
  ENTRANCE_SCORECARD: '📝', DEGREE_CERTIFICATE: '🎓', OTHER: '📁'
};

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [filterType, setFilterType] = useState('');

  const [form, setForm] = useState({
    documentType: 'AADHAAR_CARD', semester: '', academicYear: '',
    examType: '', description: '', issueDate: '', issuingAuthority: ''
  });

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await documentAPI.getAll(filterType ? { documentType: filterType } : {});
      setDocuments(res.data);
    } catch { toast.error('Failed to load documents'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDocs(); }, [filterType]);

  const onDrop = useCallback(acceptedFiles => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, maxFiles: 1, maxSize: 10 * 1024 * 1024,
    accept: { 'image/*': [], 'application/pdf': [] }
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('document', file);
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      await documentAPI.upload(fd);
      toast.success('Document uploaded successfully!');
      setShowUpload(false);
      setFile(null);
      setForm({ documentType: 'AADHAAR_CARD', semester: '', academicYear: '', examType: '', description: '', issueDate: '', issuingAuthority: '' });
      fetchDocs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this document?')) return;
    try {
      await documentAPI.delete(id);
      toast.success('Document removed');
      fetchDocs();
    } catch { toast.error('Failed to remove'); }
  };

  const selectedDocType = DOC_TYPES.find(d => d.value === form.documentType);
  const formatSize = (bytes) => bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Document Repository</h1>
          <p className="page-subtitle">Secure storage for all your official documents</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowUpload(true)}>⬆️ Upload Document</button>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowUpload(false)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div className="modal-title">📁 Upload Document</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowUpload(false)}>✕</button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Document Type <span className="required">*</span></label>
                  <select className="form-select" value={form.documentType} onChange={e => setForm(f => ({ ...f, documentType: e.target.value }))}>
                    {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>

                {selectedDocType?.needsSem && (
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Semester</label>
                      <select className="form-select" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>
                        <option value="">Select</option>
                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Academic Year</label>
                      <input className="form-input" placeholder="2023-24" value={form.academicYear} onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Exam Type</label>
                      <select className="form-select" value={form.examType} onChange={e => setForm(f => ({ ...f, examType: e.target.value }))}>
                        <option value="">Select</option>
                        <option value="REGULAR">Regular</option>
                        <option value="SUPPLEMENTARY">Supplementary</option>
                        <option value="IMPROVEMENT">Improvement</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Issue Date</label>
                    <input className="form-input" type="date" value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Issuing Authority</label>
                    <input className="form-input" placeholder="e.g. UIDAI, Income Tax Dept" value={form.issuingAuthority} onChange={e => setForm(f => ({ ...f, issuingAuthority: e.target.value }))} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-input" placeholder="Additional notes (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>

                <div {...getRootProps()} className={`file-dropzone ${isDragActive ? 'active' : ''}`} style={file ? { borderColor: 'var(--green)', background: 'var(--green-glow)' } : {}}>
                  <input {...getInputProps()} />
                  {file ? (
                    <>
                      <div className="drop-icon">✅</div>
                      <p><strong>{file.name}</strong></p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatSize(file.size)}</p>
                    </>
                  ) : (
                    <>
                      <div className="drop-icon">📄</div>
                      <p><span>Click to upload</span> or drag & drop</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>PDF or image, max 10MB</p>
                    </>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUpload(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? <><span className="spinner" /> Uploading...</> : '⬆️ Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setFilterType('')} className={`btn btn-sm ${!filterType ? 'btn-primary' : 'btn-secondary'}`}>All</button>
          {DOC_TYPES.map(d => (
            <button key={d.value} onClick={() => setFilterType(d.value)} className={`btn btn-sm ${filterType === d.value ? 'btn-primary' : 'btn-secondary'}`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loader" /></div>
      ) : documents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No documents uploaded</h3>
          <p>Upload your official documents for secure storage</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowUpload(true)}>⬆️ Upload First Document</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {documents.map(doc => (
            <div key={doc._id} className="card" style={{ display: 'flex', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                background: 'var(--bg-secondary)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0
              }}>
                {DOC_ICONS[doc.documentType] || '📁'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                  {DOC_TYPES.find(d => d.value === doc.documentType)?.label || doc.documentType}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                  {doc.originalName?.substring(0, 30)}
                </div>
                {doc.semester && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Sem {doc.semester} • {doc.academicYear}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 6 }}>
                  {doc.isVerified && <span className="badge badge-green" style={{ fontSize: 10 }}>✅ Verified</span>}
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                    <a
                      href={`http://localhost:5000${doc.path}`}
                      target="_blank" rel="noreferrer"
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '4px 8px', fontSize: 12 }}
                    >
                      👁️ View
                    </a>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '4px 8px', fontSize: 12, color: 'var(--red)' }}
                      onClick={() => handleDelete(doc._id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
