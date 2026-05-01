import { useState, useEffect, createContext, useContext } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation, NavLink } from 'react-router-dom'
import { supabase } from './lib/supabase.js'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ProfileEditor from './pages/ProfileEditor.jsx'
import ExperienceEditor from './pages/ExperienceEditor.jsx'
import EducationEditor from './pages/EducationEditor.jsx'
import SkillsEditor from './pages/SkillsEditor.jsx'
import ProjectsEditor from './pages/ProjectsEditor.jsx'
import CertificatesEditor from './pages/CertificatesEditor.jsx'
import ContactEditor from './pages/ContactEditor.jsx'

// ── Auth Context ──────────────────────────────────────────────────────────────
export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

// ── Toast Context ─────────────────────────────────────────────────────────────
export const ToastContext = createContext(null)
export const useToast = () => useContext(ToastContext)

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = (msg, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success'
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            }
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ── Nav Items ─────────────────────────────────────────────────────────────────
const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { to: '/profile', label: 'Profile', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { to: '/experience', label: 'Experience', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
  { to: '/education', label: 'Education', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
  { to: '/skills', label: 'Skills', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
  { to: '/projects', label: 'Projects', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
  { to: '/certificates', label: 'Certificates', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg> },
  { to: '/contact', label: 'Contact', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
]

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ user, onLogout }) {
  const location = useLocation()

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">DA</div>
        <div>
          <div className="sidebar-logo-text">Admin Panel</div>
          <div className="sidebar-logo-sub">Portfolio Daffa</div>
        </div>
      </div>

      <div className="sidebar-section-label">Navigation</div>
      <nav className="sidebar-nav">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8, padding: '0 4px' }}>
          Logged in as<br />
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{user?.email}</span>
        </div>
        <button className="sidebar-link" onClick={onLogout} style={{ color: 'var(--danger)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </div>
    </aside>
  )
}

// ── Protected Layout ──────────────────────────────────────────────────────────
function AdminLayout({ user, onLogout }) {
  const location = useLocation()
  const current = NAV.find(n => location.pathname.startsWith(n.to))

  return (
    <div className="admin-shell">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {current?.icon}
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem' }}>
              {current?.label || 'Admin'}
            </span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <a
              href={import.meta.env.VITE_PORTFOLIO_URL || 'https://portfolio-dava.vercel.app'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              View Portfolio
            </a>
          </div>
        </header>
        <main className="admin-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfileEditor />} />
            <Route path="/experience" element={<ExperienceEditor />} />
            <Route path="/education" element={<EducationEditor />} />
            <Route path="/skills" element={<SkillsEditor />} />
            <Route path="/projects" element={<ProjectsEditor />} />
            <Route path="/certificates" element={<CertificatesEditor />} />
            <Route path="/contact" element={<ContactEditor />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

// ── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(undefined) // undefined = loading
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (user === undefined) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <div className="loading-dots">Loading...</div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={user}>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route
            path="/*"
            element={user
              ? <AdminLayout user={user} onLogout={handleLogout} />
              : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </ToastProvider>
    </AuthContext.Provider>
  )
}
