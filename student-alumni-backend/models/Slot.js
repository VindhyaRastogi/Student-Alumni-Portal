// models/Slot.js
const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  alumniId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  alumniEmail: { type: String, required: true },
  alumniName: { type: String },
  slots: [{ type: String, required: true }],
}, { timestamps: true });

module.exports = mongoose.model("Slot", slotSchema);
