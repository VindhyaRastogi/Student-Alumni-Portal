const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Alumni = require('../models/Alumni');
const { auth, verifyAdmin } = require('../middleware/authMiddleware');

// ✅ Get all users (students + alumni)
router.get('/users', auth, verifyAdmin, async (req, res) => {
  try {
    // fetch users
    const users = await User.find().select('-password'); // exclude password

    // for any alumni users, attempt to load their Alumni record and merge key fields
    const merged = await Promise.all(
      users.map(async (u) => {
        const userObj = u.toObject();
        if (userObj.role === 'alumni') {
          try {
            const alum = await Alumni.findOne({ userId: userObj._id }).lean();
            if (alum) {
              // prefer values from Alumni document but keep existing user.profile as fallback
              userObj.profile = userObj.profile || {};
              userObj.profile.jobTitle = userObj.profile.jobTitle || alum.jobTitle || '';
              userObj.profile.company = userObj.profile.company || alum.company || '';
              userObj.profile.location = userObj.profile.location || alum.location || alum.location || '';
              userObj.profile.profilePicture = userObj.profile.profilePicture || alum.profilePicture || '';
            }
          } catch (innerErr) {
            // ignore and return user as-is
            console.warn('Failed to load Alumni record for user', userObj._id, innerErr.message);
          }
        }
        return userObj;
      })
    );

    res.json(merged);
  } catch (err) {
    console.error(err);
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
