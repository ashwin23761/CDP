const db = require('../config/db');

// Create new group
const createGroup = async (req, res) => {
  try {
    const { name, description, is_private } = req.body;
    const creator_id = req.user.user_id;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required'
      });
    }

    // Create group
    const [result] = await db.query(
      'INSERT INTO groups_table (name, description, creator_id, is_private) VALUES (?, ?, ?, ?)',
      [name, description || '', creator_id, is_private || false]
    );

    const group_id = result.insertId;

    // Add creator as admin
    await db.query(
      'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
      [group_id, creator_id, 'admin']
    );

    // Fetch the created group
    const [groups] = await db.query('SELECT * FROM groups_table WHERE group_id = ?', [group_id]);

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: groups[0]
    });
  } catch (err) {
    console.error(err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Group name already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
};

// Get all groups
const getAllGroups = async (req, res) => {
  try {
    const [groups] = await db.query(`
      SELECT 
        g.*,
        u.username as creator_username,
        COUNT(DISTINCT gm.user_id) as member_count,
        COUNT(DISTINCT p.post_id) as post_count
      FROM groups_table g
      LEFT JOIN users u ON g.creator_id = u.user_id
      LEFT JOIN group_members gm ON g.group_id = gm.group_id
      LEFT JOIN posts p ON g.group_id = p.group_id
      GROUP BY g.group_id
      ORDER BY g.created_at DESC
    `);

    res.json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
};

// Get group by ID — private groups only show full details to members
const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers['authorization'];
    let current_user_id = null;

    // Try to extract user from token (optional auth)
    if (authHeader) {
      const jwt = require('jsonwebtoken');
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        current_user_id = decoded.user_id;
      } catch (e) { /* ignore */ }
    }

    const [groups] = await db.query(`
      SELECT 
        g.*,
        u.username as creator_username,
        COUNT(DISTINCT gm.user_id) as member_count,
        COUNT(DISTINCT p.post_id) as post_count
      FROM groups_table g
      LEFT JOIN users u ON g.creator_id = u.user_id
      LEFT JOIN group_members gm ON g.group_id = gm.group_id
      LEFT JOIN posts p ON g.group_id = p.group_id
      WHERE g.group_id = ?
      GROUP BY g.group_id
    `, [id]);

    if (groups.length === 0) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const group = groups[0];

    // Check membership for private groups
    let is_member = false;
    let user_role = null;
    if (current_user_id) {
      const [membership] = await db.query(
        'SELECT role FROM group_members WHERE group_id = ? AND user_id = ?',
        [id, current_user_id]
      );
      if (membership.length > 0) {
        is_member = true;
        user_role = membership[0].role;
      }
    }

    res.json({
      success: true,
      data: { ...group, is_member, user_role }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};

// Join group
const joinGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    // Check if group exists
    const [groups] = await db.query('SELECT * FROM groups_table WHERE group_id = ?', [id]);

    if (groups.length === 0) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Check if already a member
    const [members] = await db.query(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, user_id]
    );

    if (members.length > 0) {
      return res.status(400).json({ success: false, message: 'Already a member of this group' });
    }

    // Private groups: for now allow join but could add invite-only later
    await db.query(
      'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
      [id, user_id, 'member']
    );

    res.json({ success: true, message: 'Successfully joined the group' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};

// Leave group
const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    const [result] = await db.query(
      'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'Not a member of this group'
      });
    }

    res.json({
      success: true,
      message: 'Successfully left the group'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
};

// Get group members
const getGroupMembers = async (req, res) => {
  try {
    const { id } = req.params;

    const [members] = await db.query(`
      SELECT 
        gm.*,
        u.username,
        u.anonymous_name
      FROM group_members gm
      JOIN users u ON gm.user_id = u.user_id
      WHERE gm.group_id = ?
      ORDER BY gm.joined_at DESC
    `, [id]);

    res.json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
};

// Delete group (creator only)
const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    // Check if user is the creator of the group
    const [groups] = await db.query(
      'SELECT creator_id FROM groups_table WHERE group_id = ?',
      [id]
    );

    if (groups.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (groups[0].creator_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: 'Only the group creator can delete the group'
      });
    }

    // Delete group (cascade will delete members and posts)
    await db.query('DELETE FROM groups_table WHERE group_id = ?', [id]);

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
};

module.exports = {
  createGroup,
  getAllGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  getGroupMembers,
  deleteGroup
};