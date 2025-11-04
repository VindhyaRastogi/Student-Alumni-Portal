const Meeting = require('../models/Meeting');
const Slot = require('../models/Slot');
const googleMeetService = require('../services/googleMeetService');

// student requests a meeting with alumni for a specific slot
exports.requestMeeting = async (req, res) => {
  try {
    // ensure authenticated
    if (!req.user || !req.user._id) return res.status(401).json({ message: 'Authentication required' });
    const studentId = req.user._id;
    const { alumniUserId, start, end, message } = req.body || {};
    console.debug('RequestMeeting payload:', { studentId: studentId && String(studentId), alumniUserId, start, end, message });
    if (!alumniUserId) return res.status(400).json({ message: 'alumniUserId is required' });
    if (!start || !end) return res.status(400).json({ message: 'start and end are required' });

    const startDt = new Date(start);
    const endDt = new Date(end);
    if (isNaN(startDt.getTime()) || isNaN(endDt.getTime())) return res.status(400).json({ message: 'Invalid dates' });
    if (endDt <= startDt) return res.status(400).json({ message: 'end must be after start' });

    // verify slot exists for that alumni - use multiple id sources and flexible time matching
    console.log('Meeting request details:', {
      alumniUserId,
      startDt: startDt.toISOString(),
      endDt: endDt.toISOString(),
      studentId: studentId.toString()
    });
    
    // Use $or to try multiple alumni ID fields and allow some time flexibility
    const startMs = startDt.getTime();
    const endMs = endDt.getTime();
    const toleranceMs = 5 * 60 * 1000; // 5 minutes tolerance
    
    let slotExists = await Slot.findOne({
      $or: [
        { userId: alumniUserId }, // direct match on provided ID
        { user: alumniUserId },   // some slots might use 'user' field
        { alumni: alumniUserId }  // or 'alumni' field
      ],
      // More flexible time matching
      start: { $gte: new Date(startMs - toleranceMs), $lte: new Date(startMs + toleranceMs) },
      end: { $gte: new Date(endMs - toleranceMs), $lte: new Date(endMs + toleranceMs) }
    });

    console.debug('Slot exists check result:', {
      found: !!slotExists,
      alumniUserId,
      startDt: startDt.toISOString(),
      endDt: endDt.toISOString(),
      slotDetails: slotExists ? {
        id: slotExists._id.toString(),
        userId: slotExists.userId?.toString(),
        start: slotExists.start,
        end: slotExists.end
      } : null
    });

    if (!slotExists) {
      return res.status(400).json({
        message: 'Selected slot is not available for this alumni. Please refresh slots and try again.',
        debug: {
          alumniId: alumniUserId,
          requestedStart: startDt,
          requestedEnd: endDt
        }
      });
    }

    const meeting = await Meeting.create({ studentId, alumniId: alumniUserId, start: startDt, end: endDt, message });
    // Populate student and alumni details before sending response
    await meeting.populate([
      {
        path: 'studentId',
        select: 'fullName email profile',
        populate: {
          path: 'profile',
          model: 'Student',
          select: 'name profilePicture degree specialization batch'
        }
      },
      {
        path: 'alumniId',
        select: 'fullName email profile',
        populate: {
          path: 'profile',
          model: 'Alumni',
          select: 'fullName profilePicture jobTitle company areasOfInterest'
        }
      }
    ]);
    res.json({ meeting });
  } catch (err) {
    console.error('Error requesting meeting:', err && err.message);
    // include error for debugging in dev
    res.status(500).json({ message: 'Server error creating meeting', error: err && err.message, stack: err && err.stack });
  }
};

// get my meetings (student or alumni)
exports.getMyMeetings = async (req, res) => {
  try {
    const userId = req.user._id;
    const meetings = await Meeting.find({ $or: [{ studentId: userId }, { alumniId: userId }] })
      .sort({ start: 1 })
      // populate full student and alumni details
      .populate([
        {
          path: 'studentId',
          select: 'fullName email profile',
          populate: {
            path: 'profile',
            model: 'Student',
            select: 'name profilePicture degree specialization batch'
          }
        },
        {
          path: 'alumniId',
          select: 'fullName email profile',
          populate: {
            path: 'profile',
            model: 'Alumni',
            select: 'fullName profilePicture jobTitle company areasOfInterest'
          }
        }
      ]);
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

    try {
      // Create Google Meet link
      const meetLink = await googleMeetService.createMeeting(
        `Meeting with ${meeting.studentId.fullName}`,
        meeting.start,
        meeting.end
      );
      meeting.meetLink = meetLink;
    } catch (error) {
      console.error('Error creating Google Meet link:', error);
      // Continue without meet link if creation fails
    }

    await meeting.save();
    // Populate student and alumni details before sending response
    await meeting.populate([
      {
        path: 'studentId',
        select: 'fullName email profile',
        populate: {
          path: 'profile',
          model: 'Student',
          select: 'name profilePicture degree specialization batch'
        }
      },
      {
        path: 'alumniId',
        select: 'fullName email profile',
        populate: {
          path: 'profile',
          model: 'Alumni',
          select: 'fullName profilePicture jobTitle company areasOfInterest'
        }
      }
    ]);
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
