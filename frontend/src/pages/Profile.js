import React, { useState, useEffect } from 'react';
import { studentAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [semForm, setSemForm] = useState({ semester: '', academicYear: '', sgpa: '', cgpa: '', backlogs: 0, status: 'PASS' });

  useEffect(() => {
    studentAPI.getProfile()
      .then(res => setProfile(res.data))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (path, value) => {
    setProfile(prev => {
      const next = { ...prev };
      const parts = path.split('.');
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) {
        cur[parts[i]] = { ...cur[parts[i]] };
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await studentAPI.updateProfile(profile);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSemResult = async () => {
    if (!semForm.semester || !semForm.academicYear || !semForm.sgpa) {
      return toast.error('Please fill all required semester fields');
    }
    try {
      const res = await studentAPI.addSemesterResult(semForm);
      setProfile(prev => ({ ...prev, semesterResults: res.data.semesterResults }));
      setSemForm({ semester: '', academicYear: '', sgpa: '', cgpa: '', backlogs: 0, status: 'PASS' });
      toast.success('Semester result saved!');
    } catch (err) {
      toast.error('Failed to save result');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('photo', file);
    try {
      await studentAPI.uploadPhoto(fd);
      toast.success('Profile photo updated!');
      window.location.reload();
    } catch {
      toast.error('Failed to upload photo');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loader" /></div>;
  if (!profile) return null;

  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div>
      <div style={{ display: 'flex', gap: 20, marginBottom: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Profile Card */}
        <div className="card" style={{ width: 220, flexShrink: 0, textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
            <div style={{
              width: 90, height: 90, borderRadius: '50%', margin: '0 auto',
              background: 'linear-gradient(135deg, var(--accent), var(--purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontWeight: 700, overflow: 'hidden',
              border: '3px solid var(--border)'
            }}>
              {profile.profilePhoto
                ? <img src={`http://localhost:5000${profile.profilePhoto}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials
              }
            </div>
            <label style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--accent)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', fontSize: 12,
              border: '2px solid var(--bg-card)'
            }}>
              📷
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
            </label>
          </div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{profile.firstName} {profile.lastName}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{profile.email}</div>
          <div className="badge badge-blue" style={{ margin: '0 auto 8px', display: 'inline-flex' }}>
            {profile.registrationNumber}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
            {profile.program} • {profile.branch}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Batch: {profile.batch}
          </div>
          <div className="divider" style={{ margin: '12px 0' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
            <div>📋 {profile.admissionCategory}</div>
            <div>📚 Semester {profile.currentSemester}</div>
            {profile.bloodGroup && <div>🩸 {profile.bloodGroup}</div>}
          </div>
        </div>

        {/* Form Tabs */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="tabs">
            {[['personal','👤 Personal'],['contact','📞 Contact'],['academic','🎓 Academic'],['results','📊 Results']].map(([k, l]) => (
              <button key={k} className={`tab ${activeTab === k ? 'active' : ''}`} onClick={() => setActiveTab(k)}>{l}</button>
            ))}
          </div>

          <div className="card">
            {activeTab === 'personal' && (
              <div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">First Name</label><input className="form-input" value={profile.firstName || ''} onChange={e => updateField('firstName', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" value={profile.lastName || ''} onChange={e => updateField('lastName', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Date of Birth</label><input className="form-input" type="date" value={profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : ''} readOnly /></div>
                  <div className="form-group"><label className="form-label">Gender</label><input className="form-input" value={profile.gender || ''} readOnly /></div>
                  <div className="form-group"><label className="form-label">Blood Group</label>
                    <select className="form-select" value={profile.bloodGroup || ''} onChange={e => updateField('bloodGroup', e.target.value)}>
                      <option value="">Select</option>
                      {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Nationality</label><input className="form-input" value={profile.nationality || 'Indian'} onChange={e => updateField('nationality', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Religion</label><input className="form-input" value={profile.religion || ''} onChange={e => updateField('religion', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Caste</label><input className="form-input" value={profile.caste || ''} onChange={e => updateField('caste', e.target.value)} /></div>
                </div>
                <div style={{ fontWeight: 600, marginBottom: 12, marginTop: 8 }}>Parent/Guardian Information</div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Father's Name</label><input className="form-input" value={profile.fatherName || ''} onChange={e => updateField('fatherName', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Father's Phone</label><input className="form-input" value={profile.fatherPhone || ''} onChange={e => updateField('fatherPhone', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Mother's Name</label><input className="form-input" value={profile.motherName || ''} onChange={e => updateField('motherName', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Mother's Phone</label><input className="form-input" value={profile.motherPhone || ''} onChange={e => updateField('motherPhone', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Annual Family Income</label><input className="form-input" type="number" value={profile.annualFamilyIncome || ''} onChange={e => updateField('annualFamilyIncome', e.target.value)} /></div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={profile.phone || ''} onChange={e => updateField('phone', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Alternate Phone</label><input className="form-input" value={profile.alternatePhone || ''} onChange={e => updateField('alternatePhone', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={profile.email || ''} readOnly /></div>
                </div>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>Permanent Address</div>
                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Street</label><input className="form-input" value={profile.permanentAddress?.street || ''} onChange={e => updateField('permanentAddress.street', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">City</label><input className="form-input" value={profile.permanentAddress?.city || ''} onChange={e => updateField('permanentAddress.city', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">District</label><input className="form-input" value={profile.permanentAddress?.district || ''} onChange={e => updateField('permanentAddress.district', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">State</label><input className="form-input" value={profile.permanentAddress?.state || ''} onChange={e => updateField('permanentAddress.state', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Pincode</label><input className="form-input" value={profile.permanentAddress?.pincode || ''} onChange={e => updateField('permanentAddress.pincode', e.target.value)} /></div>
                </div>
              </div>
            )}

            {activeTab === 'academic' && (
              <div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Registration No.</label><input className="form-input" value={profile.registrationNumber || ''} readOnly /></div>
                  <div className="form-group"><label className="form-label">Roll Number</label><input className="form-input" value={profile.rollNumber || ''} onChange={e => updateField('rollNumber', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Hall Ticket No.</label><input className="form-input" value={profile.hallTicketNumber || ''} onChange={e => updateField('hallTicketNumber', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Program</label><input className="form-input" value={profile.program || ''} readOnly /></div>
                  <div className="form-group"><label className="form-label">Branch</label><input className="form-input" value={profile.branch || ''} readOnly /></div>
                  <div className="form-group"><label className="form-label">Section</label><input className="form-input" value={profile.section || ''} onChange={e => updateField('section', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Current Semester</label>
                    <select className="form-select" value={profile.currentSemester || 1} onChange={e => updateField('currentSemester', parseInt(e.target.value))}>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Admission Category</label><input className="form-input" value={profile.admissionCategory || ''} readOnly /></div>
                  <div className="form-group"><label className="form-label">Entrance Score</label><input className="form-input" type="number" value={profile.entranceExamScore || ''} onChange={e => updateField('entranceExamScore', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Entrance Rank</label><input className="form-input" type="number" value={profile.entranceExamRank || ''} onChange={e => updateField('entranceExamRank', e.target.value)} /></div>
                </div>
              </div>
            )}

            {activeTab === 'results' && (
              <div>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, marginBottom: 20, border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 12 }}>Add Semester Result</div>
                  <div className="form-grid-3">
                    <div className="form-group"><label className="form-label">Semester</label>
                      <select className="form-select" value={semForm.semester} onChange={e => setSemForm(s => ({ ...s, semester: parseInt(e.target.value) }))}>
                        <option value="">Select</option>
                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                      </select>
                    </div>
                    <div className="form-group"><label className="form-label">Academic Year</label><input className="form-input" placeholder="2023-24" value={semForm.academicYear} onChange={e => setSemForm(s => ({ ...s, academicYear: e.target.value }))} /></div>
                    <div className="form-group"><label className="form-label">SGPA</label><input className="form-input" type="number" min="0" max="10" step="0.01" value={semForm.sgpa} onChange={e => setSemForm(s => ({ ...s, sgpa: e.target.value }))} /></div>
                    <div className="form-group"><label className="form-label">CGPA</label><input className="form-input" type="number" min="0" max="10" step="0.01" value={semForm.cgpa} onChange={e => setSemForm(s => ({ ...s, cgpa: e.target.value }))} /></div>
                    <div className="form-group"><label className="form-label">Backlogs</label><input className="form-input" type="number" min="0" value={semForm.backlogs} onChange={e => setSemForm(s => ({ ...s, backlogs: parseInt(e.target.value) }))} /></div>
                    <div className="form-group"><label className="form-label">Status</label>
                      <select className="form-select" value={semForm.status} onChange={e => setSemForm(s => ({ ...s, status: e.target.value }))}>
                        <option>PASS</option><option>FAIL</option><option>PENDING</option>
                      </select>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={handleAddSemResult}>+ Add Result</button>
                </div>

                {profile.semesterResults?.length > 0 ? (
                  <div className="table-wrapper">
                    <table>
                      <thead><tr><th>Semester</th><th>Academic Year</th><th>SGPA</th><th>CGPA</th><th>Backlogs</th><th>Status</th></tr></thead>
                      <tbody>
                        {profile.semesterResults.sort((a,b) => a.semester - b.semester).map(r => (
                          <tr key={r.semester}>
                            <td>Semester {r.semester}</td>
                            <td>{r.academicYear}</td>
                            <td><strong>{r.sgpa?.toFixed(2)}</strong></td>
                            <td><strong>{r.cgpa?.toFixed(2)}</strong></td>
                            <td>{r.backlogs}</td>
                            <td><span className={`badge badge-${r.status === 'PASS' ? 'green' : r.status === 'FAIL' ? 'red' : 'amber'}`}>{r.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state"><div className="empty-icon">📊</div><h3>No results added</h3><p>Add your semester results above</p></div>
                )}
              </div>
            )}

            {activeTab !== 'results' && (
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <><span className="spinner" /> Saving...</> : '💾 Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
