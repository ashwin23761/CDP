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

// Edit post
export const updatePost = async (postId, payload) => {
  const { data } = await api.put(`/posts/${postId}`, payload);
  return data;
};

// Delete post
export const deletePost = async (postId) => {
  const { data } = await api.delete(`/posts/${postId}`);
  return data;
};

// Search posts
export const searchPosts = async (q, tag) => {
  const { data } = await api.get('/posts/search', {
    params: { ...(q ? { q } : {}), ...(tag ? { tag } : {}) }
  });
  return data;
};
