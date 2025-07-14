const express = require('express');
const { auth } = require('../middleware/authMiddleware');
const User = require('../models/User'); 
const {
  getProfile,
  updateProfile,
  getFilteredAlumni
} = require('../controllers/userController');

const router = express.Router();

router.get('/me', auth, getProfile);
router.put('/update', auth, updateProfile);
router.get('/alumni', auth, getFilteredAlumni);
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user || user.role !== 'alumni') {
      return res.status(404).json({ error: 'Alumni not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
