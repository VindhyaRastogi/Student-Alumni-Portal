// models/Alumni.js
const mongoose = require('mongoose');

const AlumniSchema = new mongoose.Schema({
  name: String,
  email: String,
  // other alumni fields
  availableSlots: [String], // Array of time slot strings
});

module.exports = mongoose.model('Alumni', AlumniSchema);
