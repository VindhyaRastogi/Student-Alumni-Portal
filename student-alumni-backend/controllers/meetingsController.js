const Slot = require("../models/Slot");
const Meeting = require("../models/Meeting");
const User = require("../models/User");

// 📌 Alumni adds available slots
exports.addSlots = async (req, res) => {
  try {
    const { slots } = req.body;
    if (!slots || !slots.length) return res.status(400).json({ message: "No slots provided" });

    let slotDoc = await Slot.findOne({ alumniId: req.user._id });

    if (!slotDoc) {
      slotDoc = new Slot({
        alumniId: req.user._id,
        alumniEmail: req.user.email,
        slots,
      });
    } else {
      slotDoc.slots.push(...slots);
    }

    await slotDoc.save();
    res.json({ message: "Slots added successfully", slots: slotDoc.slots });
  } catch (err) {
    console.error("Error adding slots:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Fetch slots by alumni email
exports.getSlotsByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    const slotDoc = await Slot.findOne({ alumniEmail: email });
    res.json(slotDoc ? slotDoc.slots : []);
  } catch (err) {
    console.error("Error fetching slots:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Student books a meeting
exports.bookMeeting = async (req, res) => {
  try {
    const { alumniEmail, slot } = req.body;
    const alumni = await User.findOne({ email: alumniEmail });
    if (!alumni) return res.status(404).json({ message: "Alumni not found" });

    // Remove the slot from alumni's available slots
    await Slot.updateOne(
      { alumniId: alumni._id },
      { $pull: { slots: slot } }
    );

    const meeting = new Meeting({
      studentId: req.user._id,
      studentName: req.user.name,
      alumniId: alumni._id,
      alumniName: alumni.name,
      alumniEmail,
      slot,
    });

    await meeting.save();
    res.json({ message: "Meeting booked successfully", meeting });
  } catch (err) {
    console.error("Error booking meeting:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Fetch student's booked meetings
exports.getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ studentId: req.user._id });
    res.json(meetings);
  } catch (err) {
    console.error("Error fetching meetings:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Cancel a meeting
exports.cancelMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    meeting.status = "Cancelled";
    await meeting.save();

    // Add slot back to alumni's available slots
    await Slot.updateOne(
      { alumniId: meeting.alumniId },
      { $push: { slots: meeting.slot } }
    );

    res.json({ message: "Meeting cancelled", meeting });
  } catch (err) {
    console.error("Error cancelling meeting:", err);
    res.status(500).json({ message: "Server error" });
  }
};
