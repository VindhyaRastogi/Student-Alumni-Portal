const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  getChats,
  getMessages,
  sendMessage,
  getOrCreateChatWithUser,   // ✅ new controller
} = require("../controllers/chatController");

// Get list of available users to chat with
router.get("/", authMiddleware, getChats);

// Get or create a chat with a specific user
router.get("/with/:userId", authMiddleware, getOrCreateChatWithUser); // ✅ NEW

// Get messages in a chat
router.get("/:chatId", authMiddleware, getMessages);

// Send a message
router.post("/send", authMiddleware, sendMessage);

module.exports = router;
