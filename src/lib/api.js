const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function getToken() {
  const { data: { session } } = await import('./supabase.js').then(m => m.supabase.auth.getSession())
  return session?.access_token || null
}

async function request(method, path, body = null) {
  const token = await getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }

  return res.json()
}

export const api = {
  // Profile
  getProfile: () => request('GET', '/api/profile'),
  updateProfile: (data) => request('PUT', '/api/profile', data),

  // Experience
  getExperience: () => request('GET', '/api/experience'),
  createExperience: (data) => request('POST', '/api/experience', data),
  updateExperience: (id, data) => request('PUT', `/api/experience/${id}`, data),
  deleteExperience: (id) => request('DELETE', `/api/experience/${id}`),

  // Education
  getEducation: () => request('GET', '/api/education'),
  updateEducation: (data) => request('PUT', '/api/education', data),

  // Skills
  getSkills: () => request('GET', '/api/skills'),
  createSkillCategory: (data) => request('POST', '/api/skills/category', data),
  updateSkillCategory: (id, data) => request('PUT', `/api/skills/category/${id}`, data),
  deleteSkillCategory: (id) => request('DELETE', `/api/skills/category/${id}`),

  // Projects
  getProjects: () => request('GET', '/api/projects'),
  createProject: (data) => request('POST', '/api/projects', data),
  updateProject: (id, data) => request('PUT', `/api/projects/${id}`, data),
  deleteProject: (id) => request('DELETE', `/api/projects/${id}`),

  // Certificates
  getCertificates: () => request('GET', '/api/certificates'),
  createCertificate: (data) => request('POST', '/api/certificates', data),
  updateCertificate: (id, data) => request('PUT', `/api/certificates/${id}`, data),
  deleteCertificate: (id) => request('DELETE', `/api/certificates/${id}`),

  // Contact
  getContact: () => request('GET', '/api/contact'),
  updateContact: (contacts) => request('PUT', '/api/contact', contacts),
}
