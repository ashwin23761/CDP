const express = require("express");
const router = express.Router();

const {
  handleCreatePost,
  handleGetAllPosts,
  handleGetPostById,
} = require("./posts.controller");

// POST /posts        → create a new post
router.post("/", handleCreatePost);

// GET  /posts        → fetch all posts (newest first)
router.get("/", handleGetAllPosts);

// GET  /posts/:postId → fetch one post by ID
router.get("/:postId", handleGetPostById);

module.exports = router;
