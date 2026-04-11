const db = require('../config/db');

// Vote on a post (upvote or downvote)
const vote = async (req, res) => {
  try {
    const { post_id, vote_type } = req.body;
    const user_id = req.user.user_id;

    if (!post_id || !vote_type) {
      return res.status(400).json({
        success: false,
        message: 'Post ID and vote type are required'
      });
    }

    if (vote_type !== 'UPVOTE' && vote_type !== 'DOWNVOTE') {
      return res.status(400).json({
        success: false,
        message: 'Vote type must be UPVOTE or DOWNVOTE'
      });
    }

    // Check if user already voted
    const [existingVotes] = await db.query(
      'SELECT * FROM votes WHERE user_id = ? AND post_id = ?',
      [user_id, post_id]
    );

    if (existingVotes.length > 0) {
      // If same vote type, remove vote (toggle)
      if (existingVotes[0].vote_type === vote_type) {
        await db.query(
          'DELETE FROM votes WHERE user_id = ? AND post_id = ?',
          [user_id, post_id]
        );

        return res.json({
          success: true,
          message: 'Vote removed'
        });
      } else {
        // Update to different vote type
        await db.query(
          'UPDATE votes SET vote_type = ? WHERE user_id = ? AND post_id = ?',
          [vote_type, user_id, post_id]
        );

        return res.json({
          success: true,
          message: 'Vote updated'
        });
      }
    }

    // Insert new vote
    await db.query(
      'INSERT INTO votes (user_id, post_id, vote_type) VALUES (?, ?, ?)',
      [user_id, post_id, vote_type]
    );

    res.status(201).json({
      success: true,
      message: 'Vote recorded'
    });
  } catch (err) {
    console.error(err);

    // Foreign key violation
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

// Get vote count for a post
const getVoteCount = async (req, res) => {
  try {
    const { postId } = req.params;

    const [result] = await db.query(`
      SELECT 
        SUM(CASE WHEN vote_type = 'UPVOTE' THEN 1 ELSE 0 END) as upvotes,
        SUM(CASE WHEN vote_type = 'DOWNVOTE' THEN 1 ELSE 0 END) as downvotes,
        SUM(CASE WHEN vote_type = 'UPVOTE' THEN 1 WHEN vote_type = 'DOWNVOTE' THEN -1 ELSE 0 END) as total
      FROM votes
      WHERE post_id = ?
    `, [postId]);

    res.json({
      success: true,
      data: {
        upvotes: parseInt(result[0].upvotes) || 0,
        downvotes: parseInt(result[0].downvotes) || 0,
        total: parseInt(result[0].total) || 0
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
};

// Get user's vote for a post
const getUserVote = async (req, res) => {
  try {
    const { postId } = req.params;
    const user_id = req.user.user_id;

    const [votes] = await db.query(
      'SELECT vote_type FROM votes WHERE user_id = ? AND post_id = ?',
      [user_id, postId]
    );

    res.json({
      success: true,
      data: votes.length > 0 ? votes[0].vote_type : null
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
};

module.exports = { vote, getVoteCount, getUserVote };