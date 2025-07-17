const Meeting = require('../models/Meeting');
const Availability = require('../models/Availability');

// ALUMNI: Add slots
exports.addAvailability = async (req, res) => {
  const { slots } = req.body;
  try {
    const updated = await Availability.findOneAndUpdate(
      { alumniId: req.user.id },
      { $set: { slots } },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save availability' });
  }
};

// STUDENT: Get available slots
exports.getAvailableSlots = async (req, res) => {
  try {
    const data = await Availability.findOne({ alumniId: req.params.alumniId });
    res.json(data?.slots || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
};

// STUDENT: Book meeting
exports.bookMeeting = async (req, res) => {
  const { alumniId, timeSlot } = req.body;
  try {
    const meeting = await Meeting.create({
      studentId: req.user.id,
      alumniId,
      timeSlot,
      status: 'scheduled'
    });

    await Availability.findOneAndUpdate(
      { alumniId },
      { $pull: { slots: timeSlot } }
    );

    res.json(meeting);
  } catch (err) {
    res.status(500).json({ error: 'Failed to book meeting' });
  }
};

// STUDENT: Cancel meeting
exports.cancelMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findByIdAndUpdate(
      req.params.meetingId,
      { $set: { status: 'cancelled' } },
      { new: true }
    );
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel meeting' });
  }
};

// STUDENT: View meetings
exports.getStudentMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ studentId: req.user.id })
      .populate('alumniId', 'name email');
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get meetings' });
  }
};

// ALUMNI: View meetings
exports.getAlumniMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ alumniId: req.user.id })
      .populate('studentId', 'name email');
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get alumni meetings' });
  }
};

// ALUMNI: Confirm meeting
exports.confirmMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    if (String(meeting.alumniId) !== req.user.id)
      return res.status(403).json({ error: 'Unauthorized' });

    meeting.status = 'confirmed';
    await meeting.save();

    res.json({ message: 'Meeting confirmed', meeting });
  } catch (err) {
    res.status(500).json({ error: 'Failed to confirm meeting' });
  }
};

// ALUMNI: Cancel meeting
exports.cancelByAlumni = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    if (String(meeting.alumniId) !== req.user.id)
      return res.status(403).json({ error: 'Unauthorized' });

    meeting.status = 'cancelled';
    await meeting.save();

    res.json({ message: 'Meeting cancelled', meeting });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel meeting' });
  }
};
