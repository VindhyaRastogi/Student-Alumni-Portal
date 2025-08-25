const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  studentName: { type: String, required: true },
  alumniId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  alumniName: { type: String, required: true },
  alumniEmail: { type: String, required: true },
  slot: { type: String, required: true },
  status: { type: String, enum: ["Scheduled", "Cancelled"], default: "Scheduled" },
});

module.exports = mongoose.model("Meeting", meetingSchema);
