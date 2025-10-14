const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/authMiddleware"); // ✅ Correct import
const {
  getStudentProfile,
  updateStudentProfile,
} = require("../controllers/studentController");

const multer = require("multer");
const path = require("path");

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});

const upload = multer({ storage });

// ✅ Routes
router.get("/profile", auth, getStudentProfile);
router.put("/profile", auth, upload.single("profilePicture"), updateStudentProfile);

module.exports = router;
