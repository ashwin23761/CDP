const pool = require("../config/db");

/**
 * Insert a new post into the Posts table.
 * @param {number} user_id
 * @param {number} group_id
 * @param {string} title
 * @param {string} content
 * @returns {object} insertId + full post row with group info
 */
const createPost = async (user_id, group_id, title, content) => {
  const [result] = await pool.execute(
    "INSERT INTO posts (user_id, group_id, title, content) VALUES (?, ?, ?, ?)",
    [user_id, group_id, title, content]
  );

  // Return the newly created post with group info
  const [rows] = await pool.execute(`
    SELECT 
      p.*,
      g.name as group_name,
      u.anonymous_name
    FROM posts p
    LEFT JOIN groups_table g ON p.group_id = g.group_id
    LEFT JOIN users u ON p.user_id = u.user_id
    WHERE p.post_id = ?
  `, [result.insertId]);

  return rows[0];
};

/**
 * Fetch all posts, newest first, optionally filtered by group
 * @param {number} group_id - optional group filter
 * @returns {Array} array of post rows with vote and comment counts
 */
const getAllPosts = async (group_id) => {
  let query = `
    SELECT 
      p.*,
      g.name as group_name,
      u.anonymous_name,
      COUNT(DISTINCT c.comment_id) as comment_count,
      SUM(CASE WHEN v.vote_type = 'UPVOTE' THEN 1 ELSE 0 END) as upvotes,
      SUM(CASE WHEN v.vote_type = 'DOWNVOTE' THEN 1 ELSE 0 END) as downvotes,
      SUM(CASE WHEN v.vote_type = 'UPVOTE' THEN 1 WHEN v.vote_type = 'DOWNVOTE' THEN -1 ELSE 0 END) as vote_total
    FROM posts p
    LEFT JOIN groups_table g ON p.group_id = g.group_id
    LEFT JOIN users u ON p.user_id = u.user_id
    LEFT JOIN comments c ON p.post_id = c.post_id
    LEFT JOIN votes v ON p.post_id = v.post_id
  `;

  const params = [];

  if (group_id) {
    query += " WHERE p.group_id = ?";
    params.push(group_id);
  }

  query += `
    GROUP BY p.post_id
    ORDER BY p.created_at DESC
  `;

  const [rows] = await pool.execute(query, params);
  return rows;
};

/**
 * Fetch a single post by its ID with vote and comment counts.
 * @param {number} post_id
 * @returns {object|null}
 */
const getPostById = async (post_id) => {
  const [rows] = await pool.execute(`
    SELECT 
      p.*,
      g.name as group_name,
      u.anonymous_name,
      COUNT(DISTINCT c.comment_id) as comment_count,
      SUM(CASE WHEN v.vote_type = 'UPVOTE' THEN 1 ELSE 0 END) as upvotes,
      SUM(CASE WHEN v.vote_type = 'DOWNVOTE' THEN 1 ELSE 0 END) as downvotes,
      SUM(CASE WHEN v.vote_type = 'UPVOTE' THEN 1 WHEN v.vote_type = 'DOWNVOTE' THEN -1 ELSE 0 END) as vote_total
    FROM posts p
    LEFT JOIN groups_table g ON p.group_id = g.group_id
    LEFT JOIN users u ON p.user_id = u.user_id
    LEFT JOIN comments c ON p.post_id = c.post_id
    LEFT JOIN votes v ON p.post_id = v.post_id
    WHERE p.post_id = ?
    GROUP BY p.post_id
  `, [post_id]);
  
  return rows[0] || null;
};

module.exports = { createPost, getAllPosts, getPostById };
