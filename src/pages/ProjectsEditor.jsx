import { useState, useEffect } from 'react'
import { api } from '../lib/api.js'
import { useToast } from './App.jsx'

export default function ProjectsEditor() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const toast = useToast()

  const fetchProjects = () => {
    setLoading(true)
    api.getProjects()
      .then(setItems)
      .catch(() => toast('Failed to load projects', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProjects() }, [])

  const handleOpenModal = (proj = null) => {
    if (proj) {
      setEditingData({ ...proj, tags: proj.tags?.join(', ') || '' })
    } else {
      setEditingData({ name: '', description: '', lang: '', color: 'var(--neo-pink)', url: '', category: 'AI', featured: false, tags: '' })
    }
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...editingData,
        tags: editingData.tags.split(',').map(t => t.trim()).filter(Boolean),
        sort_order: editingData.sort_order || items.length,
      }

      if (editingData.id) {
        await api.updateProject(editingData.id, payload)
        toast('Project updated')
      } else {
        await api.createProject(payload)
        toast('Project added')
      }
      setShowModal(false)
      fetchProjects()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    try {
      await api.deleteProject(id)
      toast('Project deleted')
      fetchProjects()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  if (loading) return <div className="loading-dots">Loading projects data...</div>

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage your portfolio projects and filter categories.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Project
        </button>
      </div>

      <div className="form-grid">
        {items.map((item) => (
          <div key={item.id} className="admin-card" style={{ borderTop: `4px solid ${item.color}`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 700, margin: 0, paddingRight: 10 }}>{item.name}</h3>
              {item.featured && <span className="badge badge-accent" style={{ background: item.color, color: '#fff' }}>★</span>}
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14, flex: 1 }}>
              {item.description.length > 100 ? item.description.substring(0, 100) + '...' : item.description}
            </p>
            
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              <span className="badge badge-muted">{item.category}</span>
              <span className="badge badge-muted">{item.lang}</span>
            </div>

            <div style={{ display: 'flex', gap: 8, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleOpenModal(item)}>Edit</button>
              <button className="btn btn-danger btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleDelete(item.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      
      {items.length === 0 && <div className="empty-state">No projects found.</div>}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSave}>
              <div className="modal-header">
                <div className="modal-title">{editingData.id ? 'Edit Project' : 'Add Project'}</div>
                <button type="button" className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group full">
                    <label className="form-label">Project Name</label>
                    <input className="form-input" value={editingData.name} onChange={e => setEditingData({...editingData, name: e.target.value})} required />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" rows={3} value={editingData.description} onChange={e => setEditingData({...editingData, description: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Primary Language/Tool</label>
                    <input className="form-input" value={editingData.lang} onChange={e => setEditingData({...editingData, lang: e.target.value})} placeholder="e.g. Kotlin" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={editingData.category} onChange={e => setEditingData({...editingData, category: e.target.value})}>
                      <option value="AI">AI</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Web">Web</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color (Hex/Var)</label>
                    <input className="form-input" value={editingData.color} onChange={e => setEditingData({...editingData, color: e.target.value})} placeholder="var(--neo-pink)" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sort Order</label>
                    <input type="number" className="form-input" value={editingData.sort_order || 0} onChange={e => setEditingData({...editingData, sort_order: parseInt(e.target.value)})} />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Repository / Live URL</label>
                    <input type="url" className="form-input" value={editingData.url} onChange={e => setEditingData({...editingData, url: e.target.value})} required />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Tags (Comma separated)</label>
                    <input className="form-input" value={editingData.tags} onChange={e => setEditingData({...editingData, tags: e.target.value})} placeholder="Python, OpenCV, Tracking" />
                  </div>
                  <div className="form-group full" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
                    <input type="checkbox" id="featured" style={{ width: 18, height: 18, accentColor: 'var(--accent)' }} checked={editingData.featured} onChange={e => setEditingData({...editingData, featured: e.target.checked})} />
                    <label htmlFor="featured" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Featured Project (shows star badge)</label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
