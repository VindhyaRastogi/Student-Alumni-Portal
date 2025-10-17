const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  name: String,
  email: String,
  gender: String,
  degree: String,
  specialization: String,
  batch: String,
  areaOfInterest: String,
  linkedin: String,
  profilePicture: String,
});

module.exports = mongoose.model("Student", studentSchema);
