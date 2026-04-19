const express = require('express');
const router = express.Router();
const {
  createGroup,
  getAllGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  getGroupMembers,
  deleteGroup
} = require('../controllers/groupsController');
const { authenticateToken } = require('../middleware/auth');

// GET /groups - Get all groups
router.get('/', getAllGroups);

// GET /groups/:id - Get group by ID
router.get('/:id', getGroupById);

// POST /groups - Create new group (protected)
router.post('/', authenticateToken, createGroup);

// POST /groups/:id/join - Join group (protected)
router.post('/:id/join', authenticateToken, joinGroup);

// POST /groups/:id/leave - Leave group (protected)
router.post('/:id/leave', authenticateToken, leaveGroup);

// GET /groups/:id/members - Get group members
router.get('/:id/members', getGroupMembers);

// DELETE /groups/:id - Delete group (protected, creator only)
router.delete('/:id', authenticateToken, deleteGroup);

module.exports = router;