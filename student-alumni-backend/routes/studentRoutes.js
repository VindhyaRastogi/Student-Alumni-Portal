const express = require("express");
const router = express.Router();
const { createOrUpdateProfile, getProfile } = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Save or update profile
router.post("/profile", protect, upload.single("profilePicture"), createOrUpdateProfile);

// Get profile
router.get("/profile", protect, getProfile);

module.exports = router;
