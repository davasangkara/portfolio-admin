import { useState, useEffect } from 'react'
import { api } from '../lib/api.js'
import { useToast } from '../App.jsx'

export default function SkillsEditor() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const toast = useToast()

  const fetchSkills = () => {
    setLoading(true)
    api.getSkills()
      .then(setCategories)
      .catch(() => toast('Failed to load skills', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSkills() }, [])

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingData({ ...cat })
    } else {
      setEditingData({ title: '', color: 'var(--neo-pink)', svg: '', sort_order: categories.length, skills: [] })
    }
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...editingData,
        skills: editingData.skills.map((s, i) => ({ ...s, sort_order: i }))
      }

      if (editingData.id) {
        await api.updateSkillCategory(editingData.id, payload)
        toast('Skill category updated')
      } else {
        await api.createSkillCategory(payload)
        toast('Skill category added')
      }
      setShowModal(false)
      fetchSkills()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category and ALL its skills?')) return
    try {
      await api.deleteSkillCategory(id)
      toast('Category deleted')
      fetchSkills()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const addSkill = () => {
    setEditingData(p => ({ ...p, skills: [...p.skills, { name: '', level: 80 }] }))
  }

  const updateSkill = (i, field, value) => {
    setEditingData(p => {
      const newS = [...p.skills]
      newS[i][field] = field === 'level' ? parseInt(value) : value
      return { ...p, skills: newS }
    })
  }

  const removeSkill = (i) => {
    setEditingData(p => ({ ...p, skills: p.skills.filter((_, idx) => idx !== i) }))
  }

  const moveSkill = (index, direction) => {
    setEditingData(p => {
      if (index + direction < 0 || index + direction >= p.skills.length) return p;
      const newS = [...p.skills];
      const temp = newS[index];
      newS[index] = newS[index + direction];
      newS[index + direction] = temp;
      return { ...p, skills: newS };
    });
  }

  if (loading) return <div className="loading-dots">Loading skills data...</div>

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Skills</h1>
          <p className="page-subtitle">Manage skill categories and proficiency levels.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Category
        </button>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        {categories.map((cat, idx) => (
          <div key={cat.id} style={{ borderBottom: idx < categories.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--bg-input)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="sidebar-logo-icon" style={{ background: cat.color, width: 32, height: 32 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" dangerouslySetInnerHTML={{ __html: cat.svg }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{cat.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat.skills?.length || 0} skills</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handleOpenModal(cat)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id)}>Delete</button>
              </div>
            </div>
            <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {cat.skills?.map((s, i) => (
                <div key={i} style={{ padding: 10, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{s.name}</span>
                    <span style={{ fontSize: '0.75rem', color: cat.color, fontFamily: 'var(--font-mono)' }}>{s.level}%</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${s.level}%`, height: '100%', background: cat.color }} />
                  </div>
                </div>
              ))}
              {(!cat.skills || cat.skills.length === 0) && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No skills in this category.</div>
              )}
            </div>
          </div>
        ))}
        {categories.length === 0 && <div className="empty-state">No skill categories found.</div>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <form onSubmit={handleSave}>
              <div className="modal-header">
                <div className="modal-title">{editingData.id ? 'Edit Category' : 'Add Category'}</div>
                <button type="button" className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group full">
                    <label className="form-label">Category Title</label>
                    <input className="form-input" value={editingData.title} onChange={e => setEditingData({...editingData, title: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color (Hex/Var)</label>
                    <input className="form-input" value={editingData.color} onChange={e => setEditingData({...editingData, color: e.target.value})} placeholder="var(--neo-blue)" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sort Order</label>
                    <input type="number" className="form-input" value={editingData.sort_order || 0} onChange={e => setEditingData({...editingData, sort_order: parseInt(e.target.value)})} />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Icon SVG Content (inside viewBox 0 0 24 24)</label>
                    <textarea className="form-textarea" rows={2} value={editingData.svg} onChange={e => setEditingData({...editingData, svg: e.target.value})} placeholder='<path d="..." />' />
                  </div>
                </div>

                <div className="divider" />

                <div className="form-group full">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <label className="form-label" style={{ margin: 0 }}>Skills</label>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addSkill}>+ Add Skill</button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {editingData.skills.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--bg-input)', padding: 10, borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <button type="button" className="btn btn-ghost btn-icon" style={{ padding: 2, height: 16 }} onClick={() => moveSkill(i, -1)} disabled={i === 0}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
                          </button>
                          <button type="button" className="btn btn-ghost btn-icon" style={{ padding: 2, height: 16 }} onClick={() => moveSkill(i, 1)} disabled={i === editingData.skills.length - 1}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                          </button>
                        </div>
                        <input className="form-input" style={{ flex: 1 }} placeholder="Skill Name (e.g. ReactJS)" value={s.name} onChange={e => updateSkill(i, 'name', e.target.value)} required />
                        <div style={{ width: 140 }} className="range-row">
                          <input type="range" className="form-range" min="0" max="100" value={s.level} onChange={e => updateSkill(i, 'level', e.target.value)} style={{ accentColor: editingData.color }} />
                          <span className="range-val" style={{ color: editingData.color }}>{s.level}%</span>
                        </div>
                        <button type="button" className="btn btn-danger btn-icon" onClick={() => removeSkill(i)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    ))}
                    {editingData.skills.length === 0 && <div className="empty-state" style={{ padding: 20 }}>No skills in this category.</div>}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
