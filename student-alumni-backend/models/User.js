const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['student', 'alumni', 'admin'], required: true },
  isBlocked: { type: Boolean, default: false },
  blockedBy: [String],

  branch: { type: String },
graduationYear: { type: String },

  
  // Existing fields
  bio: { type: String },
  jobTitle: { type: String },
  company: { type: String },

  // ✅ New fields for alumni profile
  profilePicture: { type: String }, // URL to profile image
  degree: { type: String, enum: ['B.Tech', 'M.Tech', 'Ph.D'] },
  specialization: { type: String }, // e.g. CSE, ECE, Bioscience, etc.
  batch: { type: String }, // e.g. 2019–2023

  // Work info
  organization: { type: String },
  workRole: { type: String },

  // Location
  city: { type: String },
  state: { type: String },
  country: { type: String }

}, { timestamps: true });

// ✅ Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
