const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/authorizeRole");

const {
  bookMeeting,
  getMeetings,
  cancelMeeting
} = require("../controllers/meetingsController");

const router = express.Router();

// Student books meeting
router.post("/", protect, authorizeRole("student"), bookMeeting);

// Get logged-in student's meetings
router.get("/", protect, authorizeRole("student"), getMeetings);

// Cancel meeting
router.delete("/:id", protect, authorizeRole("student"), cancelMeeting);

module.exports = router;
