const { createPost, getAllPosts, getPostById, updatePost, deletePost, searchPosts } = require("../models/postsModel");

const handleCreatePost = async (req, res) => {
  const { group_id, title, content, tags } = req.body;
  const user_id = req.user.user_id;

  if (!group_id || !title || !content) {
    return res.status(400).json({ success: false, message: "group_id, title, and content are all required." });
  }
  if (title.trim().length === 0 || content.trim().length === 0) {
    return res.status(400).json({ success: false, message: "title and content cannot be empty." });
  }

  try {
    const newPost = await createPost(user_id, group_id, title.trim(), content.trim(), tags || []);
    return res.status(201).json({ success: true, message: "Post created successfully.", data: newPost });
  } catch (err) {
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(404).json({ success: false, message: "User or group does not exist." });
    }
    console.error("[handleCreatePost]", err);
    return res.status(500).json({ success: false, message: "Internal server error while creating post." });
  }
};

const handleGetAllPosts = async (req, res) => {
  try {
    const { group_id, sort } = req.query;
    const posts = await getAllPosts(group_id, sort);
    return res.status(200).json({ success: true, count: posts.length, data: posts });
  } catch (err) {
    console.error("[handleGetAllPosts]", err);
    return res.status(500).json({ success: false, message: "Internal server error while fetching posts." });
  }
};

const handleGetPostById = async (req, res) => {
  const post_id = parseInt(req.params.postId, 10);
  if (isNaN(post_id)) {
    return res.status(400).json({ success: false, message: "postId must be a valid integer." });
  }
  try {
    const post = await getPostById(post_id);
    if (!post) {
      return res.status(404).json({ success: false, message: `Post with id ${post_id} not found.` });
    }
    return res.status(200).json({ success: true, data: post });
  } catch (err) {
    console.error("[handleGetPostById]", err);
    return res.status(500).json({ success: false, message: "Internal server error while fetching post." });
  }
};

const handleUpdatePost = async (req, res) => {
  const post_id = parseInt(req.params.postId, 10);
  const user_id = req.user.user_id;
  const { title, content, tags } = req.body;

  if (isNaN(post_id)) {
    return res.status(400).json({ success: false, message: "postId must be a valid integer." });
  }
  if (!title || !content) {
    return res.status(400).json({ success: false, message: "title and content are required." });
  }

  try {
    const updated = await updatePost(post_id, user_id, title.trim(), content.trim(), tags || []);
    if (!updated) {
      return res.status(403).json({ success: false, message: "Post not found or you are not the author." });
    }
    return res.json({ success: true, message: "Post updated.", data: updated });
  } catch (err) {
    console.error("[handleUpdatePost]", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const handleDeletePost = async (req, res) => {
  const post_id = parseInt(req.params.postId, 10);
  const user_id = req.user.user_id;

  if (isNaN(post_id)) {
    return res.status(400).json({ success: false, message: "postId must be a valid integer." });
  }

  try {
    const deleted = await deletePost(post_id, user_id);
    if (!deleted) {
      return res.status(403).json({ success: false, message: "Post not found or you are not the author." });
    }
    return res.json({ success: true, message: "Post deleted." });
  } catch (err) {
    console.error("[handleDeletePost]", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const handleSearchPosts = async (req, res) => {
  try {
    const { q, tag } = req.query;
    if (!q && !tag) {
      return res.status(400).json({ success: false, message: "Provide q (search query) or tag parameter." });
    }
    const posts = await searchPosts(q, tag);
    return res.json({ success: true, count: posts.length, data: posts });
  } catch (err) {
    console.error("[handleSearchPosts]", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  handleCreatePost,
  handleGetAllPosts,
  handleGetPostById,
  handleUpdatePost,
  handleDeletePost,
  handleSearchPosts,
};
