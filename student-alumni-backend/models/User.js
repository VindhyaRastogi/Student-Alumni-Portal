const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, enum: ["student","alumni","admin"], required: true },
  profileCompleted: { type: Boolean, default: false },
  profile: { type: mongoose.Schema.Types.Mixed, default: {} }, // store role-specific details here
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
