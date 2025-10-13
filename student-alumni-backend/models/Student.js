const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "student",
    },
    gender: String,
    phone: String,
    degree: String,
    specialization: String,
    batch: String,
    linkedin: String,
    profilePicture: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
