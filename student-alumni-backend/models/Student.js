const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: String,
  email: String,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  phone: String,
  degree: String,
  specialization: String,
  batch: String,
  linkedin: String,
  profilePicture: String
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
