const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getStudentProfile,
  updateStudentProfile,
} = require("../controllers/studentController");

const multer = require("multer");
const path = require("path");

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_")
    );
  },
});
const upload = multer({ storage });

// Routes
router.get("/profile", protect, getStudentProfile);
router.put("/profile", protect, upload.single("profilePicture"), updateStudentProfile);

module.exports = router;
