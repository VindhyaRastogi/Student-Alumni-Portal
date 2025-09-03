const express = require('express');
const { saveAlumniProfile, getAlumniProfile, getAlumniList, getAlumniById } = require('../controllers/alumniController');
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

// ✅ Get single alumni by ID
router.get("/:id", protect, getAlumniById);

// Get alumni by ID
router.get("/:id", protect, async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);
    if (!alumni) return res.status(404).json({ message: "Alumni not found" });
    res.json(alumni);
  } catch (err) {
    res.status(500).json({ message: "Error fetching alumni profile" });
  }
});



module.exports = router;
