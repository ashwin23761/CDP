const db = require('../config/db');

// Get user profile with stats
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user info
    const [users] = await db.query(
      'SELECT user_id, username, anonymous_name, bio, avatar_color, created_at FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];

    // Get user's posts
    const [posts] = await db.query(`
      SELECT p.*, g.name as group_name,
        COALESCE(comment_stats.comment_count, 0) as comment_count,
        COALESCE(vote_stats.upvotes, 0) as upvotes,
        COALESCE(vote_stats.downvotes, 0) as downvotes,
        COALESCE(vote_stats.vote_total, 0) as vote_total
      FROM posts p
      LEFT JOIN groups_table g ON p.group_id = g.group_id
      LEFT JOIN (
        SELECT post_id, COUNT(*) as comment_count
        FROM comments
        GROUP BY post_id
      ) comment_stats ON p.post_id = comment_stats.post_id
      LEFT JOIN (
        SELECT post_id,
          SUM(CASE WHEN vote_type = 'UPVOTE' THEN 1 ELSE 0 END) as upvotes,
          SUM(CASE WHEN vote_type = 'DOWNVOTE' THEN 1 ELSE 0 END) as downvotes,
          SUM(CASE WHEN vote_type = 'UPVOTE' THEN 1 WHEN vote_type = 'DOWNVOTE' THEN -1 ELSE 0 END) as vote_total
        FROM votes
        GROUP BY post_id
      ) vote_stats ON p.post_id = vote_stats.post_id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `, [userId]);

    // Get groups the user is in
    const [groups] = await db.query(`
      SELECT g.group_id, g.name, g.description, gm.role, gm.joined_at
      FROM group_members gm
      JOIN groups_table g ON gm.group_id = g.group_id
      WHERE gm.user_id = ?
      ORDER BY gm.joined_at DESC
    `, [userId]);

    // Stats
    const [commentStats] = await db.query(
      'SELECT COUNT(*) as total FROM comments WHERE user_id = ?', [userId]
    );
    const [voteStats] = await db.query(`
      SELECT SUM(CASE WHEN vote_type = 'UPVOTE' THEN 1 WHEN vote_type = 'DOWNVOTE' THEN -1 ELSE 0 END) as karma
      FROM votes v
      JOIN posts p ON v.post_id = p.post_id
      WHERE p.user_id = ?
    `, [userId]);

    res.json({
      success: true,
      data: {
        ...user,
        posts,
        groups,
        stats: {
          total_posts: posts.length,
          total_comments: parseInt(commentStats[0].total) || 0,
          total_groups: groups.length,
          karma: parseInt(voteStats[0].karma) || 0,
        }
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};

// Update own profile
const updateUserProfile = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { bio, avatar_color } = req.body;

    await db.query(
      'UPDATE users SET bio = ?, avatar_color = ? WHERE user_id = ?',
      [bio || null, avatar_color || null, user_id]
    );

    const [users] = await db.query(
      'SELECT user_id, username, anonymous_name, bio, avatar_color, created_at FROM users WHERE user_id = ?',
      [user_id]
    );

    res.json({ success: true, message: 'Profile updated', data: users[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};

module.exports = { getUserProfile, updateUserProfile };
