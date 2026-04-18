const db = require('../config/db');

// Create comment (supports replies via parent_id)
const createComment = async (req, res) => {
  try {
    const { post_id, content, parent_id } = req.body;
    const user_id = req.user.user_id;

    if (!post_id || !content) {
      return res.status(400).json({ success: false, message: 'Post ID and content are required' });
    }
    if (content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Content cannot be empty' });
    }

    // If replying, verify parent comment exists and belongs to same post
    if (parent_id) {
      const [parent] = await db.query(
        'SELECT comment_id, post_id FROM comments WHERE comment_id = ?', [parent_id]
      );
      if (parent.length === 0) {
        return res.status(404).json({ success: false, message: 'Parent comment not found' });
      }
      if (parent[0].post_id !== parseInt(post_id)) {
        return res.status(400).json({ success: false, message: 'Parent comment belongs to a different post' });
      }
    }

    const [result] = await db.query(
      'INSERT INTO comments (post_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)',
      [post_id, user_id, content.trim(), parent_id || null]
    );

    const [comments] = await db.query(`
      SELECT c.*, u.username, u.anonymous_name
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE c.comment_id = ?
    `, [result.insertId]);

    res.status(201).json({ success: true, message: 'Comment created', data: comments[0] });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};

// Get comments by post ID — returns flat list with parent_id for client-side tree building
const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const [comments] = await db.query(`
      SELECT c.*, u.username, u.anonymous_name
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [postId]);

    res.json({ success: true, count: comments.length, data: comments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};

// Delete comment (author only) — cascade deletes replies
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const user_id = req.user.user_id;

    const [result] = await db.query(
      'DELETE FROM comments WHERE comment_id = ? AND user_id = ?',
      [commentId, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ success: false, message: 'Comment not found or you are not the author' });
    }

    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};

module.exports = { createComment, getCommentsByPost, deleteComment };
