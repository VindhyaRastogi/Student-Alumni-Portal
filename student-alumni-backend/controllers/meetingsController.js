const Slot = require("../models/Slot");
const Meeting = require("../models/Meeting");
const User = require("../models/User");

// 📌 Student books a meeting
exports.bookMeeting = async (req, res) => {
  try {
    const { alumniEmail, slot } = req.body;

    // Find the alumni
    const alumni = await User.findOne({ email: alumniEmail });
    if (!alumni) return res.status(404).json({ message: "Alumni not found" });

    // Remove slot from alumni availability
    await Slot.updateOne(
      { alumniId: alumni._id },
      { $pull: { slots: slot } }
    );

    // Create a new meeting
    const meeting = new Meeting({
      studentId: req.user._id,
      studentName: req.user.fullName || req.user.name,
      alumniId: alumni._id,
      alumniName: alumni.fullName || alumni.name,
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

    // Mark as cancelled
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
