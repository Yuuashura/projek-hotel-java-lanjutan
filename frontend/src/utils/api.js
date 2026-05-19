import axios from 'axios';

// Gunakan URL relatif sehingga Vite dev proxy bisa meneruskan ke port 8080
// Saat production build, ubah ke URL gateway langsung: 'http://localhost:8080'
const api = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
});

// 🔒 Inject Bearer Token secara otomatis
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ⚠️ Handle global error responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
