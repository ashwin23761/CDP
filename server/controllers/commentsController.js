const db = require('../config/db');

// Create comment
const createComment = async (req, res) => {
  try {
    const { post_id, content } = req.body;
    const user_id = req.user.user_id;

    if (!post_id || !content) {
      return res.status(400).json({
        success: false,
        message: 'Post ID and content are required'
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content cannot be empty'
      });
    }

    const [result] = await db.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [post_id, user_id, content.trim()]
    );

    // Fetch the created comment with user info
    const [comments] = await db.query(`
      SELECT 
        c.*,
        u.username,
        u.anonymous_name
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE c.comment_id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: comments[0]
    });
  } catch (err) {
    console.error(err);

    // Foreign key violation - post doesn't exist
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
};

// Get comments by post ID
const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const [comments] = await db.query(`
      SELECT 
        c.*,
        u.username,
        u.anonymous_name
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `, [postId]);

    res.json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
};

module.exports = { createComment, getCommentsByPost };