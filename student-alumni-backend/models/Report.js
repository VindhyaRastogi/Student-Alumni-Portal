const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reportedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  reason: { type: String, required: true },
  description: { type: String, required: false },
  status: { type: String, enum: ['open', 'in_review', 'closed'], default: 'open' },
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
