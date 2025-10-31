const mongoose = require('mongoose');

const degreeSchema = new mongoose.Schema({
  degree: String,
  specialization: String,
  institute: String,
  batch: String
});

const alumniSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: String,
  email: String,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  degrees: [degreeSchema],
  linkedin: String,
  jobTitle: String,
  company: String,
  location: {
    city: String,
    state: String,
    country: String
  },
  areasOfInterest: String,
  hoursPerWeek: Number,
  menteesCapacity: Number,
  preferredContact: String,
  phone: String,
  profilePicture: String
}, { timestamps: true });

module.exports = mongoose.model('Alumni', alumniSchema);
