const mongoose = require("mongoose");

const allowedEmailSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, unique: true },
  role: { type: String, enum: ["student", "alumni", "admin"], required: true },
  note: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("AllowedEmail", allowedEmailSchema);
