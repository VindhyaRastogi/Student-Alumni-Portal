// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userType: {
    type: String,
    enum: ['student', 'alumni'],
    required: true
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gender: String,
  phone: String,
  degree: String,
  specialization: String,
  batch: String, // example: "2020-2024"
  linkedin: String,
  profilePicture: String,
  jobTitle: String,
  organization: String,
  location: {
    city: String,
    state: String,
    country: String
  },

  role: {
  type: String,
  enum: ["student", "alumni"],
  default: "student",
},

  timeSlots: [String],
  password: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
