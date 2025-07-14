const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  slots: [String] // e.g., "2025-07-09T15:00"
});

module.exports = mongoose.model('Availability', availabilitySchema);
