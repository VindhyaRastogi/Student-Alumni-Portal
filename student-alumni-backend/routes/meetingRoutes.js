const express = require('express');
const router = express.Router();

// const Message = require('../models/Message');
const Meeting = require('../models/Meeting');
const { auth } = require('../middleware/authMiddleware');

// Send a message
router.post('/messages', auth, async (req, res) => {
  const { content, receiverId } = req.body;
  const message = new Message({
    senderId: req.user.id,
    receiverId,
    content,
  });
  await message.save();
  res.status(201).json(message);
});

// Get chat messages between two users
router.get('/messages/:userId', auth, async (req, res) => {
  const userId = req.params.userId;
  const messages = await Message.find({
    $or: [
      { senderId: req.user.id, receiverId: userId },
      { senderId: userId, receiverId: req.user.id },
    ],
  }).sort({ createdAt: 1 });

  res.json(messages);
});

// Cancel a meeting (student or admin)
router.delete('/meetings/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    // Allow cancel if logged-in user is student who booked OR admin
    if (String(meeting.studentId) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Meeting.findByIdAndDelete(req.params.id);
    res.json({ message: 'Meeting cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get meetings for logged-in alumni
router.get('/meetings/alumni', auth, async (req, res) => {
  try {
    const meetings = await Meeting.find({ alumniId: req.user.id })
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });
    res.json(meetings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Confirm a meeting (only alumni who owns meeting)
router.put('/meetings/:id/confirm', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    if (String(meeting.alumniId) !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    meeting.status = 'Confirmed';
    await meeting.save();

    res.json({ message: 'Meeting confirmed', meeting });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel a meeting by alumni (update status)
router.put('/meetings/:id/cancel', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    if (String(meeting.alumniId) !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    meeting.status = 'Cancelled';
    await meeting.save();

    res.json({ message: 'Meeting cancelled', meeting });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
