const express = require('express');
const { saveAlumniProfile, getAlumniProfile,   getAllAlumni } = require('../controllers/alumniController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.post('/profile', protect, upload.single('profilePicture'), saveAlumniProfile);
router.get('/profile', (req, res, next) => {
  console.log("✅ Alumni /profile route hit");
  next();
}, protect, getAlumniProfile);
router.get("/", getAllAlumni);

module.exports = router;
