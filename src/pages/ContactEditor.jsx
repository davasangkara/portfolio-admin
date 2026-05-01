import { useState, useEffect } from 'react'
import { api } from '../lib/api.js'
import { useToast } from '../App.jsx'

export default function ContactEditor() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    api.getContact()
      .then(setItems)
      .catch(() => toast('Failed to load contact data', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (index, field, value) => {
    setItems(prev => {
      const newItems = [...prev]
      newItems[index][field] = value
      return newItems
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.updateContact(items)
      toast('Contact links updated successfully!')
    } catch (err) {
      toast(err.message, 'error')
    }
    setSaving(false)
  }

  if (loading) return <div className="loading-dots">Loading contact data...</div>

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Contact Links</h1>
        <p className="page-subtitle">Manage your contact information and social media links.</p>
      </div>

      <form onSubmit={handleSave}>
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">Contact Channels</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {items.map((item, idx) => (
              <div key={item.id} style={{ display: 'flex', gap: 20, paddingBottom: 24, borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.is_fill ? item.color : '#fff', position: 'relative' }}>
                  {item.is_fill && <div style={{ position: 'absolute', inset: 0, background: '#fff', borderRadius: 'inherit' }} />}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={item.is_fill ? 'currentColor' : 'none'} stroke={item.is_fill ? 'none' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: item.svg }} style={{ position: 'relative', zIndex: 1 }} />
                </div>
                
                <div className="form-grid-2" style={{ flex: 1 }}>
                  <div className="form-group">
                    <label className="form-label">Platform / Label</label>
                    <input className="form-input" value={item.label} onChange={e => handleChange(idx, 'label', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Display Value</label>
                    <input className="form-input" value={item.value} onChange={e => handleChange(idx, 'value', e.target.value)} required />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Link URL (href)</label>
                    <input type="url" className="form-input" value={item.href} onChange={e => handleChange(idx, 'href', e.target.value)} required />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, marginBottom: 40 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            {saving ? 'Saving...' : 'Save Contacts'}
          </button>
        </div>
      </form>
    </div>
  )
}
