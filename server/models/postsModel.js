const pool = require("../db");

/**
 * Insert a new post into the Posts table.
 * @param {number} user_id
 * @param {string} title
 * @param {string} content
 * @returns {object} insertId + full post row
 */
const createPost = async (user_id, title, content) => {
  const [result] = await pool.execute(
    "INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)",
    [user_id, title, content]
  );

  // Return the newly created post so the controller can send it back
  const [rows] = await pool.execute("SELECT * FROM posts WHERE post_id = ?", [
    result.insertId,
  ]);

  return rows[0];
};

/**
 * Fetch all posts, newest first.
 * @returns {Array} array of post rows
 */
const getAllPosts = async () => {
  const [rows] = await pool.execute(
    "SELECT * FROM posts ORDER BY created_at DESC"
  );
  return rows;
};

/**
 * Fetch a single post by its ID.
 * @param {number} post_id
 * @returns {object|null}
 */
const getPostById = async (post_id) => {
  const [rows] = await pool.execute("SELECT * FROM posts WHERE post_id = ?", [
    post_id,
  ]);
  return rows[0] || null;
};

module.exports = { createPost, getAllPosts, getPostById };
