// routes/alumniSlotsRoutes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const { getSlots, addSlot, deleteSlot } = require('../controllers/alumniSlotsController');

router.get('/slots', auth, getSlots);
router.post('/slots', auth, addSlot);
router.delete('/slots', auth, deleteSlot);

module.exports = router;
