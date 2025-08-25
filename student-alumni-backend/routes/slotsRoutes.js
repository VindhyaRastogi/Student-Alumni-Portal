const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { addSlot, getMySlots, deleteSlot } = require("../controllers/slotController");

const router = express.Router();

// Add new slots
router.post("/", protect, addSlot);

// Get logged-in alumni's slots
router.get("/my", protect, getMySlots);

// Delete a slot by ID
router.delete("/:id", protect, deleteSlot);

module.exports = router;
