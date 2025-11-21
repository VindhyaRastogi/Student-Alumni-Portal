const Meeting = require('../models/Meeting');
const Slot = require('../models/Slot');
const Alumni = require('../models/Alumni');
const Student = require('../models/Student');
const { createMeetEvent } = require('../services/googleCalendar');
const mongoose = require('mongoose');

// student requests a meeting with alumni for a specific slot
exports.requestMeeting = async (req, res) => {
  try {
    console.debug('requestMeeting called by user', req.user && req.user._id, 'body=', req.body);
    const studentId = req.user._id;
    const { alumniUserId: alumniUserIdParam, start, end, message } = req.body;
    if (!alumniUserIdParam || !start || !end) return res.status(400).json({ message: 'alumniUserId, start and end are required' });

    const startDt = new Date(start);
    const endDt = new Date(end);
    if (isNaN(startDt.getTime()) || isNaN(endDt.getTime())) return res.status(400).json({ message: 'Invalid dates' });
    if (endDt <= startDt) return res.status(400).json({ message: 'end must be after start' });

    // Resolve alumni id shape: frontend may send a User._id or an Alumni._id
    let alumniUserId = alumniUserIdParam;
    try {
      // try to find slot with the provided id as userId
      let slotExists = await Slot.findOne({ userId: alumniUserIdParam, start: startDt, end: endDt });
      if (!slotExists) {
        // maybe the provided id is an Alumni document id; map it to the underlying userId
        const alumniDoc = await Alumni.findById(alumniUserIdParam);
        if (alumniDoc && alumniDoc.userId) {
          alumniUserId = alumniDoc.userId;
          slotExists = await Slot.findOne({ userId: alumniUserId, start: startDt, end: endDt });
        }
      }

      if (!slotExists) {
        return res.status(400).json({ message: 'Selected slot is not available' });
      }

      const meeting = await Meeting.create({ studentId, alumniId: alumniUserId, start: startDt, end: endDt, message, slot: slotExists._id });

      // try to mark slot as booked if schema supports it
      try {
        if (slotExists && typeof slotExists.booked !== 'undefined') {
          slotExists.booked = true;
          await slotExists.save();
        }
      } catch (markErr) {
        console.warn('Failed to mark slot as booked:', markErr && markErr.message ? markErr.message : markErr);
      }

      // populate and attach deterministic doc ids for frontend routing
      const populated = await Meeting.findById(meeting._id)
        .populate('studentId', 'fullName email')
        .populate('alumniId', 'fullName email');
      const meetingObj = populated.toObject();
      const alumniDoc = await Alumni.findOne({ userId: meetingObj.alumniId && meetingObj.alumniId._id }).select('_id');
      const studentDoc = await Student.findOne({ userId: meetingObj.studentId && meetingObj.studentId._id }).select('_id');
      if (alumniDoc) meetingObj.alumniDocId = alumniDoc._id;
      if (studentDoc) meetingObj.studentDocId = studentDoc._id;

      return res.json({ meeting: meetingObj });
    } catch (innerErr) {
      console.error('Error during slot lookup/create:', innerErr && innerErr.stack ? innerErr.stack : innerErr);
      // return the error message to the client for easier debugging in dev
      return res.status(500).json({ message: innerErr && innerErr.message ? innerErr.message : 'Server error creating meeting', stack: innerErr && innerErr.stack });
    }
  } catch (err) {
    console.error('Error requesting meeting:', err && err.stack ? err.stack : err);
    res.status(500).json({ message: err && err.message ? err.message : 'Server error creating meeting', stack: err && err.stack });
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

    // attach deterministic doc ids to each meeting
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
    // Accept rules:
    // - If meeting is pending: only the alumni may accept (original flow)
    // - If meeting is a reschedule_requested: the non-proposer participant may accept the proposed time
    if (meeting.status === 'pending') {
      if (String(meeting.alumniId) !== String(userId)) return res.status(403).json({ message: 'Not authorized' });
      // alumni accepting original request
      meeting.status = 'accepted';
      // clear any proposals (should not exist)
      meeting.proposedStart = undefined;
      meeting.proposedEnd = undefined;
      meeting.proposer = undefined;
      meeting.rescheduleMessage = undefined;
      await meeting.save();
    } else if (meeting.status === 'reschedule_requested') {
      // only allow the non-proposer to accept
      const proposer = meeting.proposer; // 'alumni' or 'student'
      const proposerIsAlumni = proposer === 'alumni';
      const proposerUserId = proposerIsAlumni ? String(meeting.alumniId) : String(meeting.studentId);
      const otherUserId = proposerIsAlumni ? String(meeting.studentId) : String(meeting.alumniId);
      if (String(userId) !== otherUserId) return res.status(403).json({ message: 'Not authorized to accept this proposal' });

      // apply proposed times as the new meeting time
      if (meeting.proposedStart && meeting.proposedEnd) {
        meeting.start = meeting.proposedStart;
        meeting.end = meeting.proposedEnd;
      }
      meeting.status = 'accepted';
      // clear proposals
      meeting.proposedStart = undefined;
      meeting.proposedEnd = undefined;
      meeting.proposer = undefined;
      meeting.rescheduleMessage = undefined;
      await meeting.save();
    } else {
      return res.status(400).json({ message: 'Meeting cannot be accepted in its current state' });
    }

    // If Google integration is configured and no meet link exists, try to create one now.
    try {
      if (!meeting.googleMeetLink && process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        // populate user emails for attendees
        const studentUser = await Student.findOne({ userId: meeting.studentId }).select('email');
        const alumniUser = await Alumni.findOne({ userId: meeting.alumniId }).select('email');
        const attendees = [];
        if (studentUser && studentUser.email) attendees.push(studentUser.email);
        if (alumniUser && alumniUser.email) attendees.push(alumniUser.email);

        const reqId = `meeting-${meeting._id}`;
        const start = meeting.start;
        const end = meeting.end;
        const summary = `Meeting: ${studentUser && studentUser.email ? studentUser.email : 'Student'} & ${alumniUser && alumniUser.email ? alumniUser.email : 'Alumni'}`;
        const desc = meeting.message || '';

        const ev = await createMeetEvent({ summary, start, end, attendees, description: desc, requestId: reqId });
        if (ev && ev.meetLink) {
          meeting.googleMeetLink = ev.meetLink;
          meeting.calendarEventId = ev.eventId;
          meeting.calendarHtmlLink = ev.htmlLink;
          await meeting.save();
        }
      }
    } catch (gErr) {
      console.error('Error creating Google Meet event:', gErr && gErr.message ? gErr.message : gErr);
      // non-fatal: proceed without meet link, client will see meeting accepted but link missing
    }
    // populate and attach doc ids
    const populated = await Meeting.findById(meeting._id)
      .populate('studentId', 'fullName email')
      .populate('alumniId', 'fullName email');
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

    // populate and attach doc ids
    const populated = await Meeting.findById(meeting._id)
      .populate('studentId', 'fullName email')
      .populate('alumniId', 'fullName email');
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

    // populate and attach doc ids
    const populated = await Meeting.findById(meeting._id)
      .populate('studentId', 'fullName email')
      .populate('alumniId', 'fullName email');
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
