import axios from 'axios';

// Vite proxy rewrites /api → http://localhost:3000
const api = axios.create({ baseURL: '/api' });

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cdp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;