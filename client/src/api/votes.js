import api from './axios';

// Vote on a post
export const voteOnPost = async (voteData) => {
  const { data } = await api.post('/votes', voteData);
  return data;
};

// Get vote count for a post
export const getVoteCount = async (postId) => {
  const { data } = await api.get(`/votes/${postId}`);
  return data;
};

// Get user's vote for a post
export const getUserVote = async (postId) => {
  const { data } = await api.get(`/votes/${postId}/user`);
  return data;
};