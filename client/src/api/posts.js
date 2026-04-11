import api from './axios';

// Create post
export const createPost = async (payload) => {
  const { data } = await api.post('/posts', payload);
  return data;
};

// Get all posts (optionally filter by group)
export const getAllPosts = async (group_id) => {
  const { data } = await api.get('/posts', {
    params: group_id ? { group_id } : {}
  });
  return data;
};

// Get post by ID
export const getPostById = async (id) => {
  const { data } = await api.get(`/posts/${id}`);
  return data;
};