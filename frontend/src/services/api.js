import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

// Setup axios instance with auth token
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('admin_token');
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ---- PUBLIC APIs ----
export const publicApi = {
  getSettings: () => axios.get(`${API_URL}/settings`).then(r => r.data),
  getMotors: () => axios.get(`${API_URL}/motors`).then(r => r.data),
  getPromos: () => axios.get(`${API_URL}/promos`).then(r => r.data),
  getTestimonials: () => axios.get(`${API_URL}/testimonials`).then(r => r.data),
  getManifesto: () => axios.get(`${API_URL}/manifesto`).then(r => r.data),
  createInterest: (data) => axios.post(`${API_URL}/interests`, data).then(r => r.data),
};

// ---- ADMIN APIs ----
export const adminApi = {
  login: (username, password) =>
    axios.post(`${API_URL}/admin/login`, { username, password }).then(r => r.data),
  me: () => api.get('/admin/me').then(r => r.data),
  changeCredentials: (current_password, new_username, new_password) =>
    api.put('/admin/credentials', { current_password, new_username, new_password }).then(r => r.data),

  // Stats
  getStats: () => api.get('/admin/stats').then(r => r.data),

  // Motors
  createMotor: (data) => api.post('/admin/motors', data).then(r => r.data),
  updateMotor: (id, data) => api.put(`/admin/motors/${id}`, data).then(r => r.data),
  deleteMotor: (id) => api.delete(`/admin/motors/${id}`).then(r => r.data),

  // Promos
  createPromo: (data) => api.post('/admin/promos', data).then(r => r.data),
  updatePromo: (id, data) => api.put(`/admin/promos/${id}`, data).then(r => r.data),
  deletePromo: (id) => api.delete(`/admin/promos/${id}`).then(r => r.data),

  // Testimonials
  createTestimonial: (data) => api.post('/admin/testimonials', data).then(r => r.data),
  updateTestimonial: (id, data) => api.put(`/admin/testimonials/${id}`, data).then(r => r.data),
  deleteTestimonial: (id) => api.delete(`/admin/testimonials/${id}`).then(r => r.data),

  // Manifesto
  createManifesto: (data) => api.post('/admin/manifesto', data).then(r => r.data),
  updateManifesto: (id, data) => api.put(`/admin/manifesto/${id}`, data).then(r => r.data),
  deleteManifesto: (id) => api.delete(`/admin/manifesto/${id}`).then(r => r.data),

  // Settings
  updateSettings: (data) => api.put('/admin/settings', data).then(r => r.data),

  // Interests
  getInterests: () => api.get('/admin/interests').then(r => r.data),
  deleteInterest: (id) => api.delete(`/admin/interests/${id}`).then(r => r.data),

  // File Upload
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
};

// Helper to convert relative /api/files/... to full URL
export const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/api/')) return process.env.REACT_APP_BACKEND_URL + url;
  return url;
};
