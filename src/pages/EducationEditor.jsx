import { useState, useEffect } from 'react'
import { api } from '../lib/api.js'
import { useToast } from '../App.jsx'

export default function EducationEditor() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    api.getEducation()
      .then(res => {
        setData({
          ...res,
          courses: res.courses?.sort((a,b) => a.sort_order - b.sort_order).map(c => c.name).join('\n') || ''
        })
      })
      .catch(() => toast('Failed to load education data', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...data,
        courses: data.courses.split('\n').filter(c => c.trim())
      }
      await api.updateEducation(payload)
      toast('Education updated successfully!')
    } catch (err) {
      toast(err.message, 'error')
    }
    setSaving(false)
  }

  if (loading) return <div className="loading-dots">Loading education data...</div>

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Education</h1>
        <p className="page-subtitle">Manage your academic background, degree, and coursework.</p>
      </div>

      <form onSubmit={handleSave}>
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">Degree Information</div>
          </div>
          <div className="form-grid-2">
            <div className="form-group full">
              <label className="form-label">Degree Name</label>
              <input name="degree" className="form-input" value={data.degree || ''} onChange={handleChange} required />
            </div>
            <div className="form-group full">
              <label className="form-label">School / University</label>
              <input name="school" className="form-input" value={data.school || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Graduation Year / Status</label>
              <input name="grad_year" className="form-input" value={data.grad_year || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">GPA Display</label>
              <input name="gpa_display" className="form-input" value={data.gpa_display || ''} onChange={handleChange} />
            </div>
            <div className="form-group full">
              <label className="form-label">Honor / Achievement</label>
              <input name="honor" className="form-input" value={data.honor || ''} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">Final Thesis</div>
          </div>
          <div className="form-grid">
            <div className="form-group full">
              <label className="form-label">Thesis Title</label>
              <input name="thesis_title" className="form-input" value={data.thesis_title || ''} onChange={handleChange} />
            </div>
            <div className="form-group full">
              <label className="form-label">Thesis Description</label>
              <textarea name="thesis_desc" className="form-textarea" value={data.thesis_desc || ''} onChange={handleChange} rows={3} />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">Relevant Coursework</div>
          </div>
          <div className="form-group">
            <label className="form-label">Courses (One per line)</label>
            <textarea name="courses" className="form-textarea" value={data.courses || ''} onChange={handleChange} rows={6} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
              Each course will be displayed as a colored tag in the education section.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, marginBottom: 40 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            {saving ? 'Saving...' : 'Save Education'}
          </button>
        </div>
      </form>
    </div>
  )
}
