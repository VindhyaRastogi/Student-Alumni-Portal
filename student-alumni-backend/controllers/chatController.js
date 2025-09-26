const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");

// Get or create a chat with a specific user
exports.getOrCreateChatWithUser = async (req, res) => {
  try {
    const { userId } = req.params; // target user
    const currentUserId = req.user.id;

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [currentUserId, userId] },
    }).populate("participants", "name role email");

    if (!chat) {
      // Create new chat if not exists
      chat = new Chat({ participants: [currentUserId, userId] });
      await chat.save();
      chat = await chat.populate("participants", "name role email");
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Fetch chat list for logged-in user
exports.getChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    let chats;
    if (user.role === "student") {
      // Students see all alumni
      const alumni = await User.find({ role: "alumni" }).select("_id name email");
      return res.json({ users: alumni });
    } else if (user.role === "alumni") {
      // Alumni see only students who have messaged them
      chats = await Chat.find({ participants: userId })
        .populate("participants", "name role email");
      const students = chats
        .map((chat) => chat.participants.find((p) => p._id.toString() !== userId))
        .filter((p) => p.role === "student");
      return res.json({ users: students });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get messages for a chat
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId }).populate("sender", "name role");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, type } = req.body;
    const senderId = req.user.id;

    // Find or create chat
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!chat) {
      chat = new Chat({ participants: [senderId, receiverId] });
      await chat.save();
    }

    const newMessage = new Message({
      chatId: chat._id,
      sender: senderId,
      content,
      type: type || "text",
    });
    await newMessage.save();

    chat.lastMessage = content;
    await chat.save();

    res.json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
