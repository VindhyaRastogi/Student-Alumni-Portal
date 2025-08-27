const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gender: String,
  phone: String,
  degree: String,
  specialization: String,
  batch: String,
  linkedin: String,
  profilePicture: String
});

module.exports = mongoose.model("Student", studentSchema);
