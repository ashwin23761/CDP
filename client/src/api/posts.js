import api from './axios';

export const createPost = async (payload) => {
  const { data } = await api.post('/posts', payload);
  return data;
};

export const getAllPosts = async (group_id, sort) => {
  const { data } = await api.get('/posts', {
    params: {
      ...(group_id ? { group_id } : {}),
      ...(sort ? { sort } : {})
    }
  });
  return data;
};

export const getPostById = async (id) => {
  const { data } = await api.get(`/posts/${id}`);
  return data;
};

export const updatePost = async (postId, payload) => {
  const { data } = await api.put(`/posts/${postId}`, payload);
  return data;
};

export const deletePost = async (postId) => {
  const { data } = await api.delete(`/posts/${postId}`);
  return data;
};

export const searchPosts = async (q, tag) => {
  const { data } = await api.get('/posts/search', {
    params: { ...(q ? { q } : {}), ...(tag ? { tag } : {}) }
  });
  return data;
};
