const express = require("express");
const multer = require("multer");
const { auth } = require("../middleware/authMiddleware");
const {
  getStudentProfile,
  updateStudentProfile,
} = require("../controllers/studentController");

const router = express.Router();

// ✅ Set up file upload with multer
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// ✅ Get profile
router.get("/profile", auth, getStudentProfile);

// ✅ Update profile
router.put("/profile", auth, upload.single("profilePicture"), updateStudentProfile);

module.exports = router;
