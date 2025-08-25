const Slot = require("../models/Slot");
const User = require("../models/User");

// Add slot(s)
exports.addSlot = async (req, res) => {
  try {
    const { slots } = req.body;

    if (!slots || slots.length === 0) {
      return res.status(400).json({ message: "Please provide at least one slot" });
    }

    // Get logged-in alumni details
    const user = await User.findById(req.user._id).select("name email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newSlot = new Slot({
      alumniId: req.user._id,
      alumniEmail: user.email,
      alumniName: user.name,
      slots,
    });

    await newSlot.save();

    res.status(201).json({
      message: "Slot(s) added successfully",
      slot: newSlot,
    });
  } catch (error) {
    console.error("Error adding slot:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get logged-in alumni's slots
exports.getMySlots = async (req, res) => {
  try {
    const mySlots = await Slot.find({ alumniId: req.user._id });
    res.status(200).json(mySlots);
  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a slot
exports.deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const slot = await Slot.findOne({ _id: id, alumniId: req.user._id });
    if (!slot) {
      return res.status(404).json({ message: "Slot not found or unauthorized" });
    }

    await slot.deleteOne();
    res.status(200).json({ message: "Slot deleted successfully" });
  } catch (error) {
    console.error("Error deleting slot:", error);
    res.status(500).json({ message: "Server error" });
  }
};
