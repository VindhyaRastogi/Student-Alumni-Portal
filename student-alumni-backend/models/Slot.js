const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  alumniId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  alumniEmail: { type: String, required: true },
  slots: [{ type: String, required: true }],
});

module.exports = mongoose.model("Slot", slotSchema);
