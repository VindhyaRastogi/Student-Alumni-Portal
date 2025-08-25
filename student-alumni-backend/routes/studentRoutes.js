const express = require('express');
const { saveStudentProfile } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.post('/profile', protect, upload.single('profilePicture'), saveStudentProfile);

module.exports = router;
