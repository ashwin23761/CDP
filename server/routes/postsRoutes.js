const express = require("express");
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

const {
  handleCreatePost,
  handleGetAllPosts,
  handleGetPostById,
} = require("../controllers/postsController");

// POST /posts        → create a new post (protected)
router.post("/", authenticateToken, handleCreatePost);

// GET  /posts        → fetch all posts (newest first), optionally filter by group_id
router.get("/", handleGetAllPosts);

// GET  /posts/:postId → fetch one post by ID
router.get("/:postId", handleGetPostById);

module.exports = router;
