const Report = require('../models/Report');
const User = require('../models/User');

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const { reportedUserId, reporterId, reason, description } = req.body || {};
    // prefer authenticated user if present
    const authReporter = req.user && req.user.id ? req.user.id : null;
    const rId = reporterId || authReporter || null;

    if (!reportedUserId || !reason) {
      return res.status(400).json({ message: 'reportedUserId and reason are required' });
    }

    const report = await Report.create({ reportedUserId, reporterId: rId, reason, description });

    // Notify admins: simple server-side notification via console and optional email hook
    try {
      const admins = await User.find({ role: 'admin' }).select('email fullName');
      admins.forEach(a => {
        // For now, log — you can hook in email/SMS providers here
        console.log(`New report submitted: reporter=${rId} reported=${reportedUserId} reason=${reason} -> notify ${a.email || a.fullName}`);
      });
    } catch (notifErr) {
      console.warn('Failed to query admins for notification:', notifErr && notifErr.message);
    }

    res.status(201).json({ message: 'Report submitted', report });
  } catch (err) {
    console.error('createReport error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: list reports
exports.listReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }).populate('reportedUserId', 'fullName email').populate('reporterId', 'fullName email');
    res.json(reports);
  } catch (err) {
    console.error('listReports error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: update report status
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!['open','in_review','closed'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const report = await Report.findByIdAndUpdate(id, { status, handledBy: req.user && req.user.id }, { new: true });
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    console.error('updateReportStatus error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
