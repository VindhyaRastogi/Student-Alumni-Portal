const express = require('express');
const { saveAlumniProfile, getAlumniProfile, getAlumniList } = require('../controllers/alumniController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// ✅ Save or update alumni profile
router.post('/profile', protect, upload.single('profilePicture'), saveAlumniProfile);

// ✅ Get logged-in alumni profile
router.get('/profile', protect, getAlumniProfile);

// ✅ Get alumni list (with filters)
router.get("/", protect, getAlumniList);

module.exports = router;
