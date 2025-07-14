const Meeting = require('../models/Meeting');
const Availability = require('../models/Availability');

// Alumni: Add available slots
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

// Student: Get available slots for an alumni
exports.getAvailableSlots = async (req, res) => {
  try {
    const data = await Availability.findOne({ alumniId: req.params.alumniId });
    res.json(data?.slots || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
};

// Student: Book a meeting
exports.bookMeeting = async (req, res) => {
  const { alumniId, timeSlot } = req.body;
  try {
    const meeting = await Meeting.create({
      studentId: req.user.id,
      alumniId,
      timeSlot,
      status: 'scheduled'
    });

    // Remove slot from alumni availability
    await Availability.findOneAndUpdate(
      { alumniId },
      { $pull: { slots: timeSlot } }
    );

    res.json(meeting);
  } catch (err) {
    res.status(500).json({ error: 'Failed to book meeting' });
  }
};

// Student: Cancel meeting
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

// Student: View all their meetings
exports.getStudentMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ studentId: req.user.id })
      .populate('alumniId', 'name email');
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get meetings' });
  }
};
