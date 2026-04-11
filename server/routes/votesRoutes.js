const express = require('express');
const router = express.Router();
const { vote, getVoteCount, getUserVote } = require('../controllers/votesController');
const { authenticateToken } = require('../middleware/auth');

// POST /votes - Upvote or downvote a post (protected)
router.post('/', authenticateToken, vote);

// GET /votes/:postId - Get vote count for a post
router.get('/:postId', getVoteCount);

// GET /votes/:postId/user - Get user's vote for a post (protected)
router.get('/:postId/user', authenticateToken, getUserVote);

module.exports = router;