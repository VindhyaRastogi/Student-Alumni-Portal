const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, verifyAdmin } = require('../middleware/authMiddleware');

// ✅ Get all users (students + alumni)
router.get('/users', auth, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// ✅ Update user by ID
router.put('/users/:id', auth, verifyAdmin, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        bio: req.body.bio,
        jobTitle: req.body.jobTitle,
        company: req.body.company,
      },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// ✅ Delete user by ID
router.delete('/users/:id', auth, verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;
