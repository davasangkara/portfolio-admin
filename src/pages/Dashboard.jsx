import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api.js'

const SECTIONS = [
  { to: '/profile', label: 'Profile', color: 'var(--accent)', desc: 'Name, bio, stats, social links' },
  { to: '/experience', label: 'Experience', color: 'var(--pink)', desc: 'Work & project experiences' },
  { to: '/education', label: 'Education', color: 'var(--green)', desc: 'Degree, thesis, coursework' },
  { to: '/skills', label: 'Skills', color: 'var(--yellow)', desc: 'Tech stack & proficiency levels' },
  { to: '/projects', label: 'Projects', color: 'var(--blue)', desc: 'Featured & all projects' },
  { to: '/certificates', label: 'Certificates', color: 'var(--purple)', desc: 'Professional certifications' },
  { to: '/contact', label: 'Contact', color: 'var(--orange)', desc: 'Email, WhatsApp, GitHub, links' },
]

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    Promise.all([
      api.getExperience().catch(() => []),
      api.getProjects().catch(() => []),
      api.getCertificates().catch(() => []),
      api.getSkills().catch(() => []),
    ]).then(([exp, proj, certs, skills]) => {
      setStats({
        experience: exp.length,
        projects: proj.length,
        certificates: certs.length,
        skills: skills.reduce((acc, cat) => acc + (cat.skills?.length || 0), 0),
      })
    })
  }, [])

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, Daffa! Here's your portfolio overview.</p>
      </div>

      {stats && (
        <div className="stat-grid">
          {[
            { label: 'Experiences', value: stats.experience, color: 'var(--pink)' },
            { label: 'Projects', value: stats.projects, color: 'var(--blue)' },
            { label: 'Certificates', value: stats.certificates, color: 'var(--purple)' },
            { label: 'Skills', value: stats.skills, color: 'var(--yellow)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Quick Access
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {SECTIONS.map(s => (
            <Link
              key={s.to}
              to={s.to}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                padding: '14px 16px',
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                borderLeft: `4px solid ${s.color}`,
                transition: 'var(--transition)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = s.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 4, color: s.color }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-title" style={{ marginBottom: 12 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Live URLs
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Portfolio', url: import.meta.env.VITE_PORTFOLIO_URL || 'https://portfolio-dava.vercel.app' },
            { label: 'Backend API', url: import.meta.env.VITE_API_URL || 'http://localhost:3001' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', minWidth: 100 }}>{item.label}</span>
              <a href={item.url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '0.82rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}
              >
                {item.url}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
