const Meeting = require('../models/Meeting');
const Slot = require('../models/Slot');
const Alumni = require('../models/Alumni');
const Student = require('../models/Student');
const googleMeetService = require('../services/googleMeetService');
const { createMeetEvent } = require('../services/googleCalendar');

// student requests a meeting with alumni for a specific slot
exports.requestMeeting = async (req, res) => {
  try {
    if (!req.user || !req.user._id) return res.status(401).json({ message: 'Authentication required' });
    const studentId = req.user._id;
    const { alumniUserId: alumniUserIdParam, start, end, message } = req.body || {};
    if (!alumniUserIdParam || !start || !end) return res.status(400).json({ message: 'alumniUserId, start and end are required' });

    const startDt = new Date(start);
    const endDt = new Date(end);
    if (isNaN(startDt.getTime()) || isNaN(endDt.getTime())) return res.status(400).json({ message: 'Invalid dates' });
    if (endDt <= startDt) return res.status(400).json({ message: 'end must be after start' });

    // Resolve alumni id shape: frontend may send a User._id or an Alumni._id
    let alumniUserId = alumniUserIdParam;
    // try to find slot by userId, then map alumni doc to userId if needed
    let slotExists = await Slot.findOne({ userId: alumniUserIdParam, start: startDt, end: endDt });
    if (!slotExists) {
      const alumniDoc = await Alumni.findById(alumniUserIdParam);
      if (alumniDoc && alumniDoc.userId) {
        alumniUserId = alumniDoc.userId;
        slotExists = await Slot.findOne({ userId: alumniUserId, start: startDt, end: endDt });
      }
    }

    // fallback: flexible time matching within small tolerance
    if (!slotExists) {
      const toleranceMs = 5 * 60 * 1000;
      const startMs = startDt.getTime();
      const endMs = endDt.getTime();
      slotExists = await Slot.findOne({
        $or: [{ userId: alumniUserId }, { user: alumniUserId }, { alumni: alumniUserId }],
        start: { $gte: new Date(startMs - toleranceMs), $lte: new Date(startMs + toleranceMs) },
        end: { $gte: new Date(endMs - toleranceMs), $lte: new Date(endMs + toleranceMs) }
      });
    }

    if (!slotExists) return res.status(400).json({ message: 'Selected slot is not available' });

    const meeting = await Meeting.create({ studentId, alumniId: alumniUserId, start: startDt, end: endDt, message, slot: slotExists._id });

    try {
      if (slotExists && typeof slotExists.booked !== 'undefined') {
        slotExists.booked = true;
        await slotExists.save();
      }
    } catch (markErr) {
      console.warn('Failed to mark slot as booked:', markErr && markErr.message ? markErr.message : markErr);
    }

    const populated = await Meeting.findById(meeting._id).populate('studentId', 'fullName email').populate('alumniId', 'fullName email');
    const meetingObj = populated.toObject();
    const alumniDoc = await Alumni.findOne({ userId: meetingObj.alumniId && meetingObj.alumniId._id }).select('_id');
    const studentDoc = await Student.findOne({ userId: meetingObj.studentId && meetingObj.studentId._id }).select('_id');
    if (alumniDoc) meetingObj.alumniDocId = alumniDoc._id;
    if (studentDoc) meetingObj.studentDocId = studentDoc._id;

    return res.json({ meeting: meetingObj });
  } catch (err) {
    console.error('Error requesting meeting:', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Server error creating meeting', error: err && err.message });
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

    const meetingsWithDocs = await Promise.all(meetings.map(async (m) => {
      const mo = m.toObject();
      const alumniDoc = await Alumni.findOne({ userId: mo.alumniId && mo.alumniId._id }).select('_id');
      const studentDoc = await Student.findOne({ userId: mo.studentId && mo.studentId._id }).select('_id');
      if (alumniDoc) mo.alumniDocId = alumniDoc._id;
      if (studentDoc) mo.studentDocId = studentDoc._id;
      return mo;
    }));

    res.json({ meetings: meetingsWithDocs });
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
    meeting.proposedStart = undefined;
    meeting.proposedEnd = undefined;
    meeting.proposer = undefined;
    meeting.rescheduleMessage = undefined;

    // try to create Google Meet via local service
    try {
      if (googleMeetService && typeof googleMeetService.createMeeting === 'function') {
        const meetLink = await googleMeetService.createMeeting(`Meeting with ${meeting.studentId || 'Student'}`, meeting.start, meeting.end);
        if (meetLink) meeting.meetLink = meetLink;
      }
    } catch (gErr) {
      console.warn('googleMeetService.createMeeting failed:', gErr && gErr.message ? gErr.message : gErr);
    }

    // fallback: try calendar event creation if configured
    try {
      if (!meeting.googleMeetLink && process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        const studentUser = await Student.findOne({ userId: meeting.studentId }).select('email');
        const alumniUser = await Alumni.findOne({ userId: meeting.alumniId }).select('email');
        const attendees = [];
        if (studentUser && studentUser.email) attendees.push(studentUser.email);
        if (alumniUser && alumniUser.email) attendees.push(alumniUser.email);

        const reqId = `meeting-${meeting._id}`;
        const ev = await createMeetEvent({ summary: `Meeting: ${studentUser && studentUser.email ? studentUser.email : 'Student'}`, start: meeting.start, end: meeting.end, attendees, description: meeting.message || '', requestId: reqId });
        if (ev && ev.meetLink) {
          meeting.googleMeetLink = ev.meetLink;
          meeting.calendarEventId = ev.eventId;
          meeting.calendarHtmlLink = ev.htmlLink;
        }
      }
    } catch (gErr) {
      console.error('Error creating Google Meet event:', gErr && gErr.message ? gErr.message : gErr);
    }

    await meeting.save();

    const populated = await Meeting.findById(meeting._id).populate('studentId', 'fullName email').populate('alumniId', 'fullName email');
    const meetingObj = populated.toObject();
    const alumniDoc = await Alumni.findOne({ userId: meetingObj.alumniId && meetingObj.alumniId._id }).select('_id');
    const studentDoc = await Student.findOne({ userId: meetingObj.studentId && meetingObj.studentId._id }).select('_id');
    if (alumniDoc) meetingObj.alumniDocId = alumniDoc._id;
    if (studentDoc) meetingObj.studentDocId = studentDoc._id;

    res.json({ meeting: meetingObj });
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

    const populated = await Meeting.findById(meeting._id).populate('studentId', 'fullName email').populate('alumniId', 'fullName email');
    const meetingObj = populated.toObject();
    const alumniDoc = await Alumni.findOne({ userId: meetingObj.alumniId && meetingObj.alumniId._id }).select('_id');
    const studentDoc = await Student.findOne({ userId: meetingObj.studentId && meetingObj.studentId._id }).select('_id');
    if (alumniDoc) meetingObj.alumniDocId = alumniDoc._id;
    if (studentDoc) meetingObj.studentDocId = studentDoc._id;

    res.json({ meeting: meetingObj });
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
    if (String(meeting.alumniId) !== String(userId) && String(meeting.studentId) !== String(userId)) return res.status(403).json({ message: 'Not authorized' });

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

    const populated = await Meeting.findById(meeting._id).populate('studentId', 'fullName email').populate('alumniId', 'fullName email');
    const meetingObj = populated.toObject();
    const alumniDoc = await Alumni.findOne({ userId: meetingObj.alumniId && meetingObj.alumniId._id }).select('_id');
    const studentDoc = await Student.findOne({ userId: meetingObj.studentId && meetingObj.studentId._id }).select('_id');
    if (alumniDoc) meetingObj.alumniDocId = alumniDoc._id;
    if (studentDoc) meetingObj.studentDocId = studentDoc._id;

    res.json({ meeting: meetingObj });
  } catch (err) {
    console.error('Error proposing reschedule:', err);
    res.status(500).json({ message: 'Server error proposing reschedule' });
  }
};
