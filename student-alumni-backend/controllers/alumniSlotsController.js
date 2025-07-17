const Alumni = require('../models/Alumni');

// GET /api/alumni/slots - get slots for logged-in alumni
exports.getSlots = async (req, res) => {
  try {
    const alumniId = req.user.id; // assuming req.user is set by auth middleware
    const alumni = await Alumni.findById(alumniId);
    if (!alumni) return res.status(404).json({ message: 'Alumni not found' });

    res.json(alumni.availableSlots || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/alumni/slots - add slot for logged-in alumni
exports.addSlot = async (req, res) => {
  try {
    const alumniId = req.user.id;
    const { slot } = req.body;
    if (!slot) return res.status(400).json({ message: 'Slot is required' });

    const alumni = await Alumni.findById(alumniId);
    if (!alumni) return res.status(404).json({ message: 'Alumni not found' });

    if (!alumni.availableSlots) alumni.availableSlots = [];
    if (!alumni.availableSlots.includes(slot)) {
      alumni.availableSlots.push(slot);
      await alumni.save();
    }

    res.status(201).json({ message: 'Slot added', slots: alumni.availableSlots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/alumni/slots - delete slot for logged-in alumni
exports.deleteSlot = async (req, res) => {
  try {
    const alumniId = req.user.id;
    const { slot } = req.body;
    if (!slot) return res.status(400).json({ message: 'Slot is required' });

    const alumni = await Alumni.findById(alumniId);
    if (!alumni) return res.status(404).json({ message: 'Alumni not found' });

    alumni.availableSlots = (alumni.availableSlots || []).filter(s => s !== slot);
    await alumni.save();

    res.json({ message: 'Slot deleted', slots: alumni.availableSlots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
