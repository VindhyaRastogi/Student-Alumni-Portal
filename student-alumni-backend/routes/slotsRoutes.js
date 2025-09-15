const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  addSlot,
  getMySlots,
  deleteSlot,
  getSlotsByEmail,
} = require("../controllers/slotController");

const router = express.Router();

// Public: get slots by alumni email
router.get("/", getSlotsByEmail);

// Add new slots (alumni)
router.post("/", protect, addSlot);

// Get logged-in alumni's slots
router.get("/my", protect, getMySlots);

// Delete a slot by ID (alumni)
router.delete("/:id", protect, deleteSlot);

module.exports = router;
