const express = require('express');
const router = express.Router();
const meetingsController = require('../controllers/meetingsController');
const authModule = require('../middleware/authMiddleware');
let protect = (authModule && typeof authModule.auth === 'function') ? authModule.auth : (authModule && authModule.default && typeof authModule.default.auth === 'function') ? authModule.default.auth : (authModule && typeof authModule === 'function') ? authModule : (authModule && authModule.default && typeof authModule.default === 'function') ? authModule.default : null;
if (typeof protect !== 'function') throw new TypeError('protect middleware not found in authMiddleware');

router.post('/', protect, meetingsController.requestMeeting);
router.get('/my', protect, meetingsController.getMyMeetings);
// actions on a meeting
router.post('/:id/accept', protect, meetingsController.acceptMeeting);
router.post('/:id/cancel', protect, meetingsController.cancelMeeting);
router.post('/:id/reschedule', protect, meetingsController.proposeReschedule);

module.exports = router;
