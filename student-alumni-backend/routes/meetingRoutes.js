const express = require('express');
const { auth } = require('../middleware/authMiddleware'); // ✅ FIXED
const {
  getAvailableSlots,
  addAvailability,
  bookMeeting,
  cancelMeeting,
  getStudentMeetings
} = require('../controllers/meetingController');

const router = express.Router();

router.get('/slots/:alumniId', auth, getAvailableSlots);
router.post('/slots', auth, addAvailability); // alumni adds slots
router.post('/book', auth, bookMeeting);
router.post('/cancel/:meetingId', auth, cancelMeeting);
router.get('/my-meetings', auth, getStudentMeetings);

module.exports = router;
