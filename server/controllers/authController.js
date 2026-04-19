const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper function to generate anonymous name
function generateAnonName() {
  const rand = Math.floor(Math.random() * 10000);
  return 'AnonUser' + rand;
}

// Register new user
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate anonymous name
    const anonymous_name = generateAnonName();

    // Insert into DB
    const query = `
      INSERT INTO users (username, email, password_hash, anonymous_name)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [username, email, hashedPassword, anonymous_name]);

    // Generate JWT token
    const token = jwt.sign(
      { user_id: result.insertId, username, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user_id: result.insertId,
        username,
        email,
        anonymous_name,
        token
      }
    });
  } catch (err) {
    console.error(err);

    // Duplicate email/username
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        anonymous_name: user.anonymous_name,
        token
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT user_id, username, email, anonymous_name, created_at FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
};

module.exports = { register, login, getCurrentUser };