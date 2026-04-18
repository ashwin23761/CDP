const express = require("express");
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getUserProfile, updateUserProfile } = require('../controllers/profileController');

// GET /profile/:userId - Get user profile
router.get("/:userId", getUserProfile);

// PUT /profile - Update own profile (protected)
router.put("/", authenticateToken, updateUserProfile);

module.exports = router;
