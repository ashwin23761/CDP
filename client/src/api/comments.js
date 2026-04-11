import api from './axios';

// Create comment
export const createComment = async (commentData) => {
  const { data } = await api.post('/comments', commentData);
  return data;
};

// Get comments by post
export const getCommentsByPost = async (postId) => {
  const { data } = await api.get(`/comments/${postId}`);
  return data;
};