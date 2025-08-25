const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/authorizeRole");

const {
  addSlots,
  getSlotsByEmail,
  bookMeeting,
  getMeetings,
  cancelMeeting
} = require("../controllers/meetingsController");

const router = express.Router();

// Alumni adds slots
router.post("/slots", protect, authorizeRole("alumni"), addSlots);

// Get available slots for alumni by email (public, no auth needed)
router.get("/slots", getSlotsByEmail);

// Student books meeting
router.post("/", protect, authorizeRole("student"), bookMeeting);

// Get logged-in student's meetings
router.get("/", protect, authorizeRole("student"), getMeetings);

// Cancel meeting (student only for now)
router.delete("/:id", protect, authorizeRole("student"), cancelMeeting);

module.exports = router;
