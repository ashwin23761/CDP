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

const getAllPosts = async (group_id, sort) => {
  const query = `
    SELECT 
      p.*, g.name as group_name, u.anonymous_name,
      COALESCE(cc.comment_count, 0) as comment_count,
      COALESCE(vs.upvotes, 0) as upvotes,
      COALESCE(vs.downvotes, 0) as downvotes,
      COALESCE(vs.vote_total, 0) as vote_total
    FROM posts p
    LEFT JOIN groups_table g ON p.group_id = g.group_id
    LEFT JOIN users u ON p.user_id = u.user_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) as comment_count
      FROM comments
      GROUP BY post_id
    ) cc ON p.post_id = cc.post_id
    LEFT JOIN (
      SELECT 
        post_id,
        SUM(CASE WHEN vote_type = 'UPVOTE' THEN 1 ELSE 0 END) as upvotes,
        SUM(CASE WHEN vote_type = 'DOWNVOTE' THEN 1 ELSE 0 END) as downvotes,
        SUM(CASE WHEN vote_type = 'UPVOTE' THEN 1 WHEN vote_type = 'DOWNVOTE' THEN -1 ELSE 0 END) as vote_total
      FROM votes
      GROUP BY post_id
    ) vs ON p.post_id = vs.post_id
  `;

  const params = [];
  let finalQuery = query;
  if (group_id) {
    finalQuery += ' WHERE p.group_id = ?';
    params.push(group_id);
  }

  switch (sort) {
    case 'votes':
      finalQuery += ' ORDER BY vote_total DESC, p.created_at DESC';
      break;
    case 'comments':
      finalQuery += ' ORDER BY comment_count DESC, p.created_at DESC';
      break;
    case 'oldest':
      finalQuery += ' ORDER BY p.created_at ASC';
      break;
    default:
      finalQuery += ' ORDER BY p.created_at DESC';
  }

  const [rows] = await pool.execute(finalQuery, params);
  return rows;
};

const getPostById = async (post_id) => {
  const [rows] = await pool.execute(`
    SELECT 
      p.*, g.name as group_name, u.anonymous_name,
      COALESCE(cc.comment_count, 0) as comment_count,
      COALESCE(vs.upvotes, 0) as upvotes,
      COALESCE(vs.downvotes, 0) as downvotes,
      COALESCE(vs.vote_total, 0) as vote_total
    FROM posts p
    LEFT JOIN groups_table g ON p.group_id = g.group_id
    LEFT JOIN users u ON p.user_id = u.user_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) as comment_count
      FROM comments
      GROUP BY post_id
    ) cc ON p.post_id = cc.post_id
    LEFT JOIN (
      SELECT 
        post_id,
        SUM(CASE WHEN vote_type = 'UPVOTE' THEN 1 ELSE 0 END) as upvotes,
        SUM(CASE WHEN vote_type = 'DOWNVOTE' THEN 1 ELSE 0 END) as downvotes,
        SUM(CASE WHEN vote_type = 'UPVOTE' THEN 1 WHEN vote_type = 'DOWNVOTE' THEN -1 ELSE 0 END) as vote_total
      FROM votes
      GROUP BY post_id
    ) vs ON p.post_id = vs.post_id
    WHERE p.post_id = ?
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
      COALESCE(cc.comment_count, 0) as comment_count,
      COALESCE(vs.upvotes, 0) as upvotes,
      COALESCE(vs.downvotes, 0) as downvotes,
      COALESCE(vs.vote_total, 0) as vote_total
    FROM posts p
    LEFT JOIN groups_table g ON p.group_id = g.group_id
    LEFT JOIN users u ON p.user_id = u.user_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) as comment_count
      FROM comments
      GROUP BY post_id
    ) cc ON p.post_id = cc.post_id
    LEFT JOIN (
      SELECT 
        post_id,
        SUM(CASE WHEN vote_type = 'UPVOTE' THEN 1 ELSE 0 END) as upvotes,
        SUM(CASE WHEN vote_type = 'DOWNVOTE' THEN 1 ELSE 0 END) as downvotes,
        SUM(CASE WHEN vote_type = 'UPVOTE' THEN 1 WHEN vote_type = 'DOWNVOTE' THEN -1 ELSE 0 END) as vote_total
      FROM votes
      GROUP BY post_id
    ) vs ON p.post_id = vs.post_id
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

  sql += " ORDER BY p.created_at DESC LIMIT 50";
  const [rows] = await pool.execute(sql, params);
  return rows;
};

module.exports = { createPost, getAllPosts, getPostById, updatePost, deletePost, searchPosts };
