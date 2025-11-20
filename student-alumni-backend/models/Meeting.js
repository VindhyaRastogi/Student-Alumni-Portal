const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  message: String,
  meetLink: String,  // Google Meet URL for the meeting
  // status: pending -> student requested; accepted -> alumni accepted; rejected/cancelled as named
  status: { type: String, enum: ['pending','accepted','rejected','cancelled','reschedule_requested'], default: 'pending' },
  // optional reschedule proposal fields (when either party proposes a new slot)
  proposedStart: Date,
  proposedEnd: Date,
  proposer: { type: String, enum: ['student','alumni'] },
  rescheduleMessage: String,
  createdAt: { type: Date, default: Date.now }
  ,
  // Google Meet / Calendar integration
  googleMeetLink: { type: String },
  calendarEventId: { type: String },
  calendarHtmlLink: { type: String }
  ,
  // reference to the Slot that was booked for this meeting (if any)
  slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot' }
});

module.exports = mongoose.model('Meeting', meetingSchema);
