const express = require("express");
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  handleCreatePost,
  handleGetAllPosts,
  handleGetPostById,
  handleUpdatePost,
  handleDeletePost,
  handleSearchPosts,
} = require("../controllers/postsController");

// GET  /posts/search   → search posts by keyword or tag
router.get("/search", handleSearchPosts);

// POST /posts          → create a new post (protected)
router.post("/", authenticateToken, handleCreatePost);

// GET  /posts          → fetch all posts (optionally filter by group_id)
router.get("/", handleGetAllPosts);

// GET  /posts/:postId  → fetch one post by ID
router.get("/:postId", handleGetPostById);

// PUT  /posts/:postId  → edit a post (protected, author only)
router.put("/:postId", authenticateToken, handleUpdatePost);

// DELETE /posts/:postId → delete a post (protected, author only)
router.delete("/:postId", authenticateToken, handleDeletePost);

module.exports = router;
