const Chat = require('../models/Chat');
const User = require('../models/User');

// create or return a chat for the current user and an other participant
exports.createOrGetChat = async (req, res) => {
  try {
    const me = req.user?._id;
    const { otherUserId } = req.body;
    if (!me) return res.status(401).json({ message: 'Authentication required' });
    if (!otherUserId) return res.status(400).json({ message: 'otherUserId is required' });

    // ensure other user exists
    const other = await User.findById(otherUserId).select('_id fullName email');
    if (!other) return res.status(404).json({ message: 'Other user not found' });

    // find existing chat with both participants (order-independent)
    const chats = await Chat.find({ participants: { $all: [me, otherUserId] } }).limit(1);
    if (chats && chats.length > 0) return res.json({ chat: chats[0] });

    const chat = await Chat.create({ participants: [me, otherUserId], pubkeys: {}, messages: [] });
    return res.json({ chat });
  } catch (err) {
    console.error('createOrGetChat error', err);
    res.status(500).json({ message: 'Server error creating chat' });
  }
};

exports.listMyChats = async (req, res) => {
  try {
    const me = req.user._id;
    const chats = await Chat.find({ participants: me }).sort({ updatedAt: -1 }).populate('participants', 'fullName email');
    res.json({ chats });
  } catch (err) {
    console.error('listMyChats error', err);
    res.status(500).json({ message: 'Server error listing chats' });
  }
};

exports.getChat = async (req, res) => {
  try {
    const me = req.user._id;
    const chatId = req.params.id;
    const chat = await Chat.findById(chatId).populate('participants', 'fullName email');
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (!chat.participants.some(p => String(p._id) === String(me))) return res.status(403).json({ message: 'Not authorized' });
    res.json({ chat });
  } catch (err) {
    console.error('getChat error', err);
    res.status(500).json({ message: 'Server error fetching chat' });
  }
};

exports.setPubKey = async (req, res) => {
  try {
    const me = req.user._id;
    const chatId = req.params.id;
    const { publicJwk } = req.body;
    if (!publicJwk) return res.status(400).json({ message: 'publicJwk is required' });
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (!chat.participants.some(p => String(p) === String(me))) return res.status(403).json({ message: 'Not authorized' });
    chat.pubkeys.set(String(me), publicJwk);
    await chat.save();
    res.json({ pubkeys: Object.fromEntries(chat.pubkeys || []) });
  } catch (err) {
    console.error('setPubKey error', err);
    res.status(500).json({ message: 'Server error saving public key' });
  }
};

exports.getPubKeys = async (req, res) => {
  try {
    const me = req.user._id;
    const chatId = req.params.id;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (!chat.participants.some(p => String(p) === String(me))) return res.status(403).json({ message: 'Not authorized' });
    res.json({ pubkeys: Object.fromEntries(chat.pubkeys || []) });
  } catch (err) {
    console.error('getPubKeys error', err);
    res.status(500).json({ message: 'Server error fetching pubkeys' });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const me = req.user._id;
    const chatId = req.params.id;
    const { text, ciphertext, iv, encrypted } = req.body || {};
    if (!text && !ciphertext) return res.status(400).json({ message: 'text or ciphertext required' });
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (!chat.participants.some(p => String(p) === String(me))) return res.status(403).json({ message: 'Not authorized' });

    const msg = { from: me, text: text || undefined, ciphertext: ciphertext || undefined, iv: iv || undefined, encrypted: !!encrypted, ts: new Date() };
    chat.messages.push(msg);
    await chat.save();
    res.json({ message: msg });
  } catch (err) {
    console.error('addMessage error', err);
    res.status(500).json({ message: 'Server error adding message' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const me = req.user._id;
    const chatId = req.params.id;
    const limit = parseInt(req.query.limit || '100', 10);
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (!chat.participants.some(p => String(p) === String(me))) return res.status(403).json({ message: 'Not authorized' });
    const msgs = chat.messages.slice(-limit);
    res.json({ messages: msgs });
  } catch (err) {
    console.error('getMessages error', err);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};
