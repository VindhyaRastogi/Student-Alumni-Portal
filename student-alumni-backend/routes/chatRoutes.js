const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const chatCtrl = require('../controllers/chatController');

// create or get a chat with another user
router.post('/', auth, chatCtrl.createOrGetChat);

// list my chats
router.get('/', auth, chatCtrl.listMyChats);

// get chat metadata
router.get('/:id', auth, chatCtrl.getChat);

// pubkey management
router.post('/:id/pubkey', auth, chatCtrl.setPubKey);
router.get('/:id/pubkeys', auth, chatCtrl.getPubKeys);

// messages
router.post('/:id/messages', auth, chatCtrl.addMessage);
router.get('/:id/messages', auth, chatCtrl.getMessages);

module.exports = router;
