import { useState, useEffect } from 'react'
import { api } from '../lib/api.js'
import { useToast } from '../App.jsx'

export default function CertificatesEditor() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const toast = useToast()

  const fetchCerts = () => {
    setLoading(true)
    api.getCertificates()
      .then(setItems)
      .catch(() => toast('Failed to load certificates', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCerts() }, [])

  const handleOpenModal = (cert = null) => {
    if (cert) {
      setEditingData({ ...cert, skills: cert.skills?.join(', ') || '' })
    } else {
      setEditingData({ 
        cert_id: `CERT-${new Date().getFullYear()}-XXX`, 
        title: '', issuer: '', issuer_short: '', date: '', expires: '', category: 'AI & ML', 
        credential_url: '', accent_color: '#5b5bf6', bg_color: '#1a1a26', badge_color: '#5b5bf6', 
        level: 'Professional', serial: '', skills: ''
      })
    }
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...editingData,
        skills: editingData.skills.split(',').map(s => s.trim()).filter(Boolean),
        sort_order: editingData.sort_order || items.length,
      }

      if (editingData.id) {
        await api.updateCertificate(editingData.id, payload)
        toast('Certificate updated')
      } else {
        await api.createCertificate(payload)
        toast('Certificate added')
      }
      setShowModal(false)
      fetchCerts()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return
    try {
      await api.deleteCertificate(id)
      toast('Certificate deleted')
      fetchCerts()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  if (loading) return <div className="loading-dots">Loading certificates data...</div>

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Certificates</h1>
          <p className="page-subtitle">Manage professional certifications and SVG generator properties.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Certificate
        </button>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID & Serial</th>
              <th>Certificate Details</th>
              <th>Visual Theme</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600 }}>{item.cert_id}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.serial}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>{item.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.issuer} • {item.level}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <div className="color-swatch" style={{ background: item.accent_color, border: '1px solid #444' }} title="Accent" />
                    <div className="color-swatch" style={{ background: item.bg_color, border: '1px solid #444' }} title="Background" />
                    <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>{item.accent_color}</span>
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
        {items.length === 0 && <div className="empty-state">No certificates found.</div>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 800 }}>
            <form onSubmit={handleSave}>
              <div className="modal-header">
                <div className="modal-title">{editingData.id ? 'Edit Certificate' : 'Add Certificate'}</div>
                <button type="button" className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Internal ID (e.g. CERT-2025-001)</label>
                    <input className="form-input" value={editingData.cert_id} onChange={e => setEditingData({...editingData, cert_id: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Serial / Credential ID</label>
                    <input className="form-input" value={editingData.serial} onChange={e => setEditingData({...editingData, serial: e.target.value})} required />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Certificate Title</label>
                    <input className="form-input" value={editingData.title} onChange={e => setEditingData({...editingData, title: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Issuer Full Name</label>
                    <input className="form-input" value={editingData.issuer} onChange={e => setEditingData({...editingData, issuer: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Issuer Short Name</label>
                    <input className="form-input" value={editingData.issuer_short} onChange={e => setEditingData({...editingData, issuer_short: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Issue Date</label>
                    <input className="form-input" value={editingData.date} onChange={e => setEditingData({...editingData, date: e.target.value})} placeholder="e.g. March 2025" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expires</label>
                    <input className="form-input" value={editingData.expires} onChange={e => setEditingData({...editingData, expires: e.target.value})} placeholder="e.g. March 2028 or 'No Expiry'" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input className="form-input" value={editingData.category} onChange={e => setEditingData({...editingData, category: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Level</label>
                    <input className="form-input" value={editingData.level} onChange={e => setEditingData({...editingData, level: e.target.value})} placeholder="e.g. Professional, Intermediate" required />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Verification URL</label>
                    <input type="url" className="form-input" value={editingData.credential_url} onChange={e => setEditingData({...editingData, credential_url: e.target.value})} required />
                  </div>
                </div>

                <div className="divider" />
                <h4 style={{ marginBottom: 12, fontSize: '0.9rem' }}>Visual Theme (Hex Colors)</h4>
                
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Accent Color</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input type="color" value={editingData.accent_color} onChange={e => setEditingData({...editingData, accent_color: e.target.value, badge_color: e.target.value})} style={{ width: 40, height: 38, padding: 0, border: 'none', background: 'none' }} />
                      <input className="form-input" value={editingData.accent_color} onChange={e => setEditingData({...editingData, accent_color: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Background Color (Light/Tint)</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input type="color" value={editingData.bg_color} onChange={e => setEditingData({...editingData, bg_color: e.target.value})} style={{ width: 40, height: 38, padding: 0, border: 'none', background: 'none' }} />
                      <input className="form-input" value={editingData.bg_color} onChange={e => setEditingData({...editingData, bg_color: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Skills (Comma separated, max 4 recommended for SVG)</label>
                    <input className="form-input" value={editingData.skills} onChange={e => setEditingData({...editingData, skills: e.target.value})} placeholder="TensorFlow, Python, ML" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Certificate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
