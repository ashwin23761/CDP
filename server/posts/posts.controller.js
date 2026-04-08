const { createPost, getAllPosts, getPostById } = require("./posts.model");

/**
 * POST /posts
 * Body: { user_id, title, content }
 */
const handleCreatePost = async (req, res) => {
  const { user_id, title, content } = req.body;

  // --- Basic validation ---
  if (!user_id || !title || !content) {
    return res.status(400).json({
      success: false,
      message: "user_id, title, and content are all required.",
    });
  }

  if (title.trim().length === 0 || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "title and content cannot be empty.",
    });
  }

  try {
    const newPost = await createPost(user_id, title.trim(), content.trim());

    return res.status(201).json({
      success: true,
      message: "Post created successfully.",
      data: newPost,
    });
  } catch (err) {
    // Foreign-key violation → user_id does not exist
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(404).json({
        success: false,
        message: `User with id ${user_id} does not exist.`,
      });
    }

    console.error("[handleCreatePost]", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating post.",
    });
  }
};

/**
 * GET /posts
 * Returns all posts, newest first.
 */
const handleGetAllPosts = async (_req, res) => {
  try {
    const posts = await getAllPosts();

    return res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (err) {
    console.error("[handleGetAllPosts]", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching posts.",
    });
  }
};

/**
 * GET /posts/:postId
 * Returns a single post by ID.
 */
const handleGetPostById = async (req, res) => {
  const post_id = parseInt(req.params.postId, 10);

  if (isNaN(post_id)) {
    return res.status(400).json({
      success: false,
      message: "postId must be a valid integer.",
    });
  }

  try {
    const post = await getPostById(post_id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: `Post with id ${post_id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (err) {
    console.error("[handleGetPostById]", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching post.",
    });
  }
};

module.exports = { handleCreatePost, handleGetAllPosts, handleGetPostById };
