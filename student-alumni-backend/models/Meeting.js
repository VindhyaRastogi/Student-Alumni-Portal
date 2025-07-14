const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timeSlot: String,
  status: { type: String, enum: ['scheduled', 'cancelled', 'confirmed'], default: 'scheduled' }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);
