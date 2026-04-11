const express = require('express');
const router = express.Router();
const { createComment, getCommentsByPost, deleteComment } = require('../controllers/commentsController');
const { authenticateToken } = require('../middleware/auth');

// POST /comments - Create comment or reply (protected)
router.post('/', authenticateToken, createComment);

// GET /comments/:postId - Get comments for a post
router.get('/:postId', getCommentsByPost);

// DELETE /comments/:commentId - Delete comment (protected, author only)
router.delete('/:commentId', authenticateToken, deleteComment);

module.exports = router;
