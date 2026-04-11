import api from './axios';

// Register
export const register = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

// Login
export const login = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

// Get current user
export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};