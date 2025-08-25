const express = require('express');
const {
  getProfile,
  createProfile,
  updateProfile,
  getAllAlumni,
  getAlumniById
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Setup multer for image uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const unique = Date.now() + path.extname(file.originalname);
    cb(null, `${file.fieldname}-${unique}`);
  },
});

const upload = multer({ storage });

// Routes
router.get('/me', protect, getProfile);
router.post('/', protect, upload.single('profilePicture'), createProfile);
router.put('/:id', protect, upload.single('profilePicture'), updateProfile);
router.get('/alumni', protect, getAllAlumni);
router.get('/alumni/:id', protect, getAlumniById);

module.exports = router;
