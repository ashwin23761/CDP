import api from './axios';

// Get user profile
export const getUserProfile = async (userId) => {
  const { data } = await api.get(`/profile/${userId}`);
  return data;
};

// Update own profile
export const updateProfile = async (profileData) => {
  const { data } = await api.put('/profile', profileData);
  return data;
};
