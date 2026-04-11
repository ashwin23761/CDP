import api from './axios';

export const createComment = async (commentData) => {
  const { data } = await api.post('/comments', commentData);
  return data;
};

export const getCommentsByPost = async (postId) => {
  const { data } = await api.get(`/comments/${postId}`);
  return data;
};

export const deleteComment = async (commentId) => {
  const { data } = await api.delete(`/comments/${commentId}`);
  return data;
};
