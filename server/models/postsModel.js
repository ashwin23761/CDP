const pool = require("../config/db");

const createPost = async (user_id, group_id, title, content, tags) => {
  const tagsStr = tags && tags.length > 0 ? tags.join(',') : null;
  const [result] = await pool.execute(
    "INSERT INTO posts (user_id, group_id, title, content, tags) VALUES (?, ?, ?, ?, ?)",
    [user_id, group_id, title, content, tagsStr]
  );

  const [rows] = await pool.execute(`
    SELECT p.*, g.name as group_name, u.anonymous_name
    FROM posts p
    LEFT JOIN groups_table g ON p.group_id = g.group_id
    LEFT JOIN users u ON p.user_id = u.user_id
    WHERE p.post_id = ?
  `, [result.insertId]);

  return rows[0];
};

const getAllPosts = async (group_id) => {
  let query = `
    SELECT 
      p.*, g.name as group_name, u.anonymous_name,
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
  query += " GROUP BY p.post_id ORDER BY p.created_at DESC";
  const [rows] = await pool.execute(query, params);
  return rows;
};

const getPostById = async (post_id) => {
  const [rows] = await pool.execute(`
    SELECT 
      p.*, g.name as group_name, u.anonymous_name,
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

const updatePost = async (post_id, user_id, title, content, tags) => {
  const tagsStr = tags && tags.length > 0 ? tags.join(',') : null;
  const [result] = await pool.execute(
    "UPDATE posts SET title = ?, content = ?, tags = ? WHERE post_id = ? AND user_id = ?",
    [title, content, tagsStr, post_id, user_id]
  );
  if (result.affectedRows === 0) return null;
  return getPostById(post_id);
};

const deletePost = async (post_id, user_id) => {
  const [result] = await pool.execute(
    "DELETE FROM posts WHERE post_id = ? AND user_id = ?",
    [post_id, user_id]
  );
  return result.affectedRows > 0;
};

const searchPosts = async (query, tag) => {
  let sql = `
    SELECT 
      p.*, g.name as group_name, u.anonymous_name,
      COUNT(DISTINCT c.comment_id) as comment_count,
      SUM(CASE WHEN v.vote_type = 'UPVOTE' THEN 1 ELSE 0 END) as upvotes,
      SUM(CASE WHEN v.vote_type = 'DOWNVOTE' THEN 1 ELSE 0 END) as downvotes,
      SUM(CASE WHEN v.vote_type = 'UPVOTE' THEN 1 WHEN v.vote_type = 'DOWNVOTE' THEN -1 ELSE 0 END) as vote_total
    FROM posts p
    LEFT JOIN groups_table g ON p.group_id = g.group_id
    LEFT JOIN users u ON p.user_id = u.user_id
    LEFT JOIN comments c ON p.post_id = c.post_id
    LEFT JOIN votes v ON p.post_id = v.post_id
    WHERE 1=1
  `;
  const params = [];

  if (query) {
    sql += " AND (p.title LIKE ? OR p.content LIKE ?)";
    params.push(`%${query}%`, `%${query}%`);
  }
  if (tag) {
    sql += " AND FIND_IN_SET(?, p.tags) > 0";
    params.push(tag);
  }

  sql += " GROUP BY p.post_id ORDER BY p.created_at DESC LIMIT 50";
  const [rows] = await pool.execute(sql, params);
  return rows;
};

module.exports = { createPost, getAllPosts, getPostById, updatePost, deletePost, searchPosts };
