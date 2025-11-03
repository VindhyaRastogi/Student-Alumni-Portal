const Meeting = require('../models/Meeting');
const Slot = require('../models/Slot');

// student requests a meeting with alumni for a specific slot
exports.requestMeeting = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { alumniUserId, start, end, message } = req.body;
    if (!alumniUserId || !start || !end) return res.status(400).json({ message: 'alumniUserId, start and end are required' });

    const startDt = new Date(start);
    const endDt = new Date(end);
    if (isNaN(startDt.getTime()) || isNaN(endDt.getTime())) return res.status(400).json({ message: 'Invalid dates' });
    if (endDt <= startDt) return res.status(400).json({ message: 'end must be after start' });

    // optional: verify slot exists for that alumni
    const slotExists = await Slot.findOne({ userId: alumniUserId, start: startDt, end: endDt });

    if (!slotExists) {
      return res.status(400).json({ message: 'Selected slot is not available' });
    }

    const meeting = await Meeting.create({ studentId, alumniId: alumniUserId, start: startDt, end: endDt, message });
    res.json({ meeting });
  } catch (err) {
    console.error('Error requesting meeting:', err);
    res.status(500).json({ message: 'Server error creating meeting' });
  }
};

// get my meetings (student or alumni)
exports.getMyMeetings = async (req, res) => {
  try {
    const userId = req.user._id;
    const meetings = await Meeting.find({ $or: [{ studentId: userId }, { alumniId: userId }] })
      .sort({ start: 1 })
      .populate('studentId', 'fullName email')
      .populate('alumniId', 'fullName email');
    res.json({ meetings });
  } catch (err) {
    console.error('Error fetching meetings:', err);
    res.status(500).json({ message: 'Server error fetching meetings' });
  }
};

// alumni accepts a meeting
exports.acceptMeeting = async (req, res) => {
  try {
    const userId = req.user._id;
    const meetingId = req.params.id;
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    if (String(meeting.alumniId) !== String(userId)) return res.status(403).json({ message: 'Not authorized' });

    meeting.status = 'accepted';
    // clear any proposals
    meeting.proposedStart = undefined;
    meeting.proposedEnd = undefined;
    meeting.proposer = undefined;
    meeting.rescheduleMessage = undefined;
    await meeting.save();
    res.json({ meeting });
  } catch (err) {
    console.error('Error accepting meeting:', err);
    res.status(500).json({ message: 'Server error accepting meeting' });
  }
};

// alumni or student cancels a meeting
exports.cancelMeeting = async (req, res) => {
  try {
    const userId = req.user._id;
    const meetingId = req.params.id;
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    if (String(meeting.alumniId) !== String(userId) && String(meeting.studentId) !== String(userId)) return res.status(403).json({ message: 'Not authorized' });

    meeting.status = 'cancelled';
    await meeting.save();
    res.json({ meeting });
  } catch (err) {
    console.error('Error cancelling meeting:', err);
    res.status(500).json({ message: 'Server error cancelling meeting' });
  }
};

// propose reschedule (alumni or student) onto a new slot
exports.proposeReschedule = async (req, res) => {
  try {
    const userId = req.user._id;
    const meetingId = req.params.id;
    const { start, end, message } = req.body;
    if (!start || !end) return res.status(400).json({ message: 'start and end are required' });

    const startDt = new Date(start);
    const endDt = new Date(end);
    if (isNaN(startDt.getTime()) || isNaN(endDt.getTime())) return res.status(400).json({ message: 'Invalid dates' });
    if (endDt <= startDt) return res.status(400).json({ message: 'end must be after start' });

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    // only participants can propose
    if (String(meeting.alumniId) !== String(userId) && String(meeting.studentId) !== String(userId)) return res.status(403).json({ message: 'Not authorized' });

    // optional: verify that if alumni proposes, the slot exists in their availability
    if (String(meeting.alumniId) === String(userId)) {
      const slotExists = await Slot.findOne({ userId, start: startDt, end: endDt });
      if (!slotExists) return res.status(400).json({ message: 'Proposed slot is not in your availability' });
    }

    meeting.proposedStart = startDt;
    meeting.proposedEnd = endDt;
    meeting.proposer = (String(meeting.alumniId) === String(userId)) ? 'alumni' : 'student';
    meeting.rescheduleMessage = message || '';
    meeting.status = 'reschedule_requested';
    await meeting.save();

    res.json({ meeting });
  } catch (err) {
    console.error('Error proposing reschedule:', err);
    res.status(500).json({ message: 'Server error proposing reschedule' });
  }
};
