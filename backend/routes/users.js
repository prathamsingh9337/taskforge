const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/users — list all users (admin uses this to assign tasks/add members)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
