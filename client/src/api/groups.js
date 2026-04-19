import api from './axios';

// Get all groups
export const getAllGroups = async () => {
  const { data } = await api.get('/groups');
  return data;
};

// Get group by ID
export const getGroupById = async (id) => {
  const { data } = await api.get(`/groups/${id}`);
  return data;
};

// Create group
export const createGroup = async (groupData) => {
  const { data } = await api.post('/groups', groupData);
  return data;
};

// Join group
export const joinGroup = async (id) => {
  const { data } = await api.post(`/groups/${id}/join`);
  return data;
};

// Leave group
export const leaveGroup = async (id) => {
  const { data } = await api.post(`/groups/${id}/leave`);
  return data;
};

// Get group members
export const getGroupMembers = async (id) => {
  const { data } = await api.get(`/groups/${id}/members`);
  return data;
};

// Delete group
export const deleteGroup = async (id) => {
  const { data } = await api.delete(`/groups/${id}`);
  return data;
};