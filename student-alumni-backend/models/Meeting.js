// models/Meeting.js
const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  studentName: { type: String, required: true },
  alumniId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  alumniName: { type: String, required: true },
  alumniEmail: { type: String, required: true },
  slot: { type: String, required: true }, // string ISO or readable
  status: { type: String, enum: ["Scheduled", "Cancelled"], default: "Scheduled" },
}, { timestamps: true });

// prevent double booking of same slot for same alumni
meetingSchema.index({ alumniId: 1, slot: 1 }, { unique: true });

module.exports = mongoose.model("Meeting", meetingSchema);
