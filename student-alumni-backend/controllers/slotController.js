// controllers/slotController.js
const Slot = require("../models/Slot");
const User = require("../models/User");
const Meeting = require("../models/Meeting"); // to filter booked slots when returning by email (optional)

/**
 * POST /api/slots
 * Protected: alumni
 * Body: { slots: ["2025-09-10 10:00", "2025-09-11 15:00"] }
 */
exports.addSlot = async (req, res) => {
  try {
    const { slots } = req.body;
    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: "Please provide at least one slot" });
    }

    const user = await User.findById(req.user._id).select("fullName email name");
    if (!user) return res.status(404).json({ message: "User not found" });

    const alumniId = req.user._id;
    const alumniEmail = user.email;
    const alumniName = user.fullName || user.name || "";

    let slotDoc = await Slot.findOne({ alumniId });
    if (!slotDoc) {
      slotDoc = new Slot({
        alumniId,
        alumniEmail,
        alumniName,
        slots: Array.from(new Set(slots)),
      });
    } else {
      const existing = new Set(slotDoc.slots || []);
      for (const s of slots) existing.add(s);
      slotDoc.slots = Array.from(existing);
    }

    await slotDoc.save();
    res.status(201).json({ message: "Slot(s) added", slots: slotDoc.slots });
  } catch (err) {
    console.error("Error in addSlot:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/slots/my
 * Protected: alumni
 * Returns: { slots: [...] }
 */
exports.getMySlots = async (req, res) => {
  try {
    const slotDoc = await Slot.findOne({ alumniId: req.user._id });
    res.json({ slots: slotDoc ? slotDoc.slots : [] });
  } catch (err) {
    console.error("Error in getMySlots:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /api/slots/:id
 * Protected: alumni
 * Deletes the Slot document (you may change to per-slot deletion later)
 */
exports.deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await Slot.findOne({ _id: id, alumniId: req.user._id });
    if (!slot) return res.status(404).json({ message: "Slot not found or unauthorized" });

    await slot.deleteOne();
    res.json({ message: "Slot removed" });
  } catch (err) {
    console.error("Error in deleteSlot:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/slots?email=alumni@example.com
 * Public: returns available slots for an alumni (filters out already-booked slots)
 * Returns: { slots: [...] }
 */
exports.getSlotsByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "email query required" });

    const slotDoc = await Slot.findOne({ alumniEmail: email });
    if (!slotDoc) return res.json({ slots: [] });

    // Filter out already booked slots for this alumni (Scheduled)
    const alumni = await User.findOne({ email }).select("_id");
    let booked = [];
    if (alumni) {
      booked = await Meeting.find({ alumniId: alumni._id, status: "Scheduled" }).distinct("slot");
    }
    const free = (slotDoc.slots || []).filter((s) => !booked.includes(s));
    res.json({ slots: free });
  } catch (err) {
    console.error("Error in getSlotsByEmail:", err);
    res.status(500).json({ message: "Server error" });
  }
};
