const express = require('express');
const router = express.Router();
const slotsController = require('../controllers/slotsController');
const authModule = require('../middleware/authMiddleware');
let protect = (authModule && typeof authModule.auth === 'function') ? authModule.auth : (authModule && authModule.default && typeof authModule.default.auth === 'function') ? authModule.default.auth : (authModule && typeof authModule === 'function') ? authModule : (authModule && authModule.default && typeof authModule.default === 'function') ? authModule.default : null;
if (typeof protect !== 'function') throw new TypeError('protect middleware not found in authMiddleware');

router.post('/', protect, slotsController.createSlots);
router.get('/my', protect, slotsController.getMySlots);
router.delete('/:id', protect, slotsController.deleteSlot);
router.get('/user/:userId', protect, slotsController.getSlotsByUser);

module.exports = router;
