const express = require('express');
const router = express.Router();
const { createComment, getCommentsByPost } = require('../controllers/commentsController');
const { authenticateToken } = require('../middleware/auth');

// POST /comments - Create new comment (protected)
router.post('/', authenticateToken, createComment);

// GET /comments/:postId - Get comments for a post
router.get('/:postId', getCommentsByPost);

module.exports = router;