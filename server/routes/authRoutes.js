const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST /auth/register - Register new user
router.post('/register', register);

// POST /auth/login - Login user
router.post('/login', login);

// GET /auth/me - Get current user (protected route)
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;