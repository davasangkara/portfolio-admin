import { useState, useEffect } from 'react'
import { api } from '../lib/api.js'
import { useToast } from './App.jsx'

export default function ProfileEditor() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    api.getProfile()
      .then(setData)
      .catch(() => toast('Failed to load profile', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleRolesChange = (e) => {
    setData(prev => ({ ...prev, roles: e.target.value.split('\n').filter(r => r.trim()) }))
  }

  const handleTagsChange = (e) => {
    setData(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.updateProfile(data)
      toast('Profile updated successfully!')
    } catch (err) {
      toast(err.message, 'error')
    }
    setSaving(false)
  }

  if (loading) return <div className="loading-dots">Loading profile data...</div>

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">Manage your personal information and hero section text.</p>
      </div>

      <form onSubmit={handleSave}>
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">Basic Info</div>
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input name="name" className="form-input" value={data.name || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Initials</label>
              <input name="initials" className="form-input" value={data.initials || ''} onChange={handleChange} required />
            </div>
            <div className="form-group full">
              <label className="form-label">Greeting</label>
              <input name="greeting" className="form-input" value={data.greeting || ''} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">Biography</div>
          </div>
          <div className="form-grid">
            <div className="form-group full">
              <label className="form-label">Short Bio (Hero Section)</label>
              <textarea name="bio_short" className="form-textarea" value={data.bio_short || ''} onChange={handleChange} rows={2} />
            </div>
            <div className="form-group full">
              <label className="form-label">Long Bio - Paragraph 1</label>
              <textarea name="bio_long" className="form-textarea" value={data.bio_long || ''} onChange={handleChange} rows={3} />
            </div>
            <div className="form-group full">
              <label className="form-label">Long Bio - Paragraph 2</label>
              <textarea name="bio_para2" className="form-textarea" value={data.bio_para2 || ''} onChange={handleChange} rows={3} />
            </div>
            <div className="form-group full">
              <label className="form-label">Long Bio - Paragraph 3</label>
              <textarea name="bio_para3" className="form-textarea" value={data.bio_para3 || ''} onChange={handleChange} rows={3} />
            </div>
            <div className="form-group full">
              <label className="form-label">Long Bio - Paragraph 4</label>
              <textarea name="bio_para4" className="form-textarea" value={data.bio_para4 || ''} onChange={handleChange} rows={3} />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">Stats & Links</div>
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">GPA</label>
              <input type="number" step="0.01" name="gpa" className="form-input" value={data.gpa || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Max GPA</label>
              <input type="number" step="0.01" name="gpa_max" className="form-input" value={data.gpa_max || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">GitHub Repos Count</label>
              <input type="number" name="repos" className="form-input" value={data.repos || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Projects Count</label>
              <input type="number" name="projects_count" className="form-input" value={data.projects_count || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input name="years_exp" className="form-input" value={data.years_exp || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">GitHub URL</label>
              <input name="github_url" className="form-input" value={data.github_url || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Open to Work Banner</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" name="is_open_to_work" checked={data.is_open_to_work || false} onChange={handleChange} style={{ width: 18, height: 18 }} />
                <input name="open_to_work_text" className="form-input" value={data.open_to_work_text || ''} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">Lists & Tags</div>
          </div>
          <div className="form-grid">
            <div className="form-group full">
              <label className="form-label">Hero Typing Roles (One per line)</label>
              <textarea className="form-textarea" value={(data.roles || []).join('\n')} onChange={handleRolesChange} rows={5} />
            </div>
            <div className="form-group full">
              <label className="form-label">About Me Tags (Comma separated)</label>
              <textarea className="form-textarea" value={(data.tags || []).join(', ')} onChange={handleTagsChange} rows={3} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, marginBottom: 40 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
