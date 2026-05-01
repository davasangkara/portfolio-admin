import { useState, useEffect } from 'react'
import { api } from '../lib/api.js'
import { useToast } from '../App.jsx'

export default function ExperienceEditor() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const toast = useToast()

  const fetchExp = () => {
    setLoading(true)
    api.getExperience()
      .then(setItems)
      .catch(() => toast('Failed to load experiences', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchExp() }, [])

  const handleOpenModal = (exp = null) => {
    if (exp) {
      setEditingData({
        ...exp,
        bullets: exp.bullets?.map(b => b.text).join('\n') || '',
        skills: exp.skills?.map(s => s.name).join(', ') || '',
        metrics: exp.metrics || []
      })
    } else {
      setEditingData({
        role: '', company: '', period: '', type: 'Full-time', color: 'var(--neo-pink)',
        bullets: '', skills: '', metrics: []
      })
    }
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...editingData,
        bullets: editingData.bullets.split('\n').filter(b => b.trim()),
        skills: editingData.skills.split(',').map(s => s.trim()).filter(Boolean),
        sort_order: editingData.sort_order || items.length,
      }

      if (editingData.id) {
        await api.updateExperience(editingData.id, payload)
        toast('Experience updated')
      } else {
        await api.createExperience(payload)
        toast('Experience added')
      }
      setShowModal(false)
      fetchExp()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this experience?')) return
    try {
      await api.deleteExperience(id)
      toast('Experience deleted')
      fetchExp()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const addMetric = () => {
    setEditingData(p => ({ ...p, metrics: [...p.metrics, { label: '', val: '' }] }))
  }

  const updateMetric = (i, field, value) => {
    setEditingData(p => {
      const newM = [...p.metrics]
      newM[i][field] = value
      return { ...p, metrics: newM }
    })
  }

  const removeMetric = (i) => {
    setEditingData(p => ({ ...p, metrics: p.metrics.filter((_, idx) => idx !== i) }))
  }

  if (loading) return <div className="loading-dots">Loading experience data...</div>

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Experience</h1>
          <p className="page-subtitle">Manage your work history and project experiences.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add New
        </button>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th>Role & Company</th>
              <th>Period & Type</th>
              <th>Metrics</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id}>
                <td>
                  <div className="color-swatch" style={{ background: item.color }} />
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>{item.role}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.company}</div>
                </td>
                <td>
                  <div style={{ fontSize: '0.8rem' }}>{item.period}</div>
                  <span className="badge badge-muted">{item.type}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {item.metrics?.map((m, i) => (
                      <span key={i} className="badge" style={{ background: 'var(--bg-input)' }}>
                        <strong style={{ color: item.color, marginRight: 4 }}>{m.val}</strong> {m.label}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleOpenModal(item)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleDelete(item.id)} style={{ color: 'var(--danger)' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="empty-state">No experiences found.</div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSave}>
              <div className="modal-header">
                <div className="modal-title">{editingData.id ? 'Edit Experience' : 'Add Experience'}</div>
                <button type="button" className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <input className="form-input" value={editingData.role} onChange={e => setEditingData({...editingData, role: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input className="form-input" value={editingData.company} onChange={e => setEditingData({...editingData, company: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Period</label>
                    <input className="form-input" value={editingData.period} onChange={e => setEditingData({...editingData, period: e.target.value})} placeholder="e.g. Nov 2025 - Present" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={editingData.type} onChange={e => setEditingData({...editingData, type: e.target.value})}>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Project">Project</option>
                      <option value="Thesis">Thesis</option>
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
                </div>

                <div className="divider" />

                <div className="form-group full">
                  <label className="form-label">Description Bullets (One per line)</label>
                  <textarea className="form-textarea" rows={4} value={editingData.bullets} onChange={e => setEditingData({...editingData, bullets: e.target.value})} />
                </div>

                <div className="form-group full" style={{ marginTop: 14 }}>
                  <label className="form-label">Skills (Comma separated)</label>
                  <input className="form-input" value={editingData.skills} onChange={e => setEditingData({...editingData, skills: e.target.value})} placeholder="React, Node.js, Agile" />
                </div>

                <div className="divider" />

                <div className="form-group full">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label className="form-label" style={{ margin: 0 }}>Metrics</label>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addMetric}>+ Add Metric</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {editingData.metrics.map((m, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8 }}>
                        <input className="form-input" placeholder="Label (e.g. Dev Speed)" value={m.label} onChange={e => updateMetric(i, 'label', e.target.value)} />
                        <input className="form-input" placeholder="Value (e.g. +20%)" value={m.val} onChange={e => updateMetric(i, 'val', e.target.value)} style={{ width: 120 }} />
                        <button type="button" className="btn btn-danger btn-icon" onClick={() => removeMetric(i)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    ))}
                    {editingData.metrics.length === 0 && <div className="empty-state" style={{ padding: 20 }}>No metrics added.</div>}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Experience</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
