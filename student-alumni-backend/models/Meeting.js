// models/Meeting.js
const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  alumni: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  slot: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["pending", "accepted", "rejected"], 
    default: "pending" 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Meeting", meetingSchema);
