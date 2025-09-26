import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom"; // ✅ for auto-select from URL
import "./ChatWindow.css";
import { FiCheck, FiPaperclip, FiSmile } from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";
import axios from "axios";
import { io } from "socket.io-client";

const ChatWindow = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  const { alumniId } = useParams(); // ✅ if coming from AlumniPublicProfile

  const [socket, setSocket] = useState(null);

  // ✅ Connect to Socket.IO
  useEffect(() => {
const newSocket = io("http://localhost:5000", {
  query: { userId },
  transports: ["websocket"], // ✅ no fallback
  path: "/socket.io",
});

    setSocket(newSocket);

    // new messages
    newSocket.on("receiveMessage", (message) => {
      if (selectedUser && message.sender === selectedUser._id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // typing indicators
    newSocket.on("userTyping", ({ sender }) => {
      if (selectedUser && sender === selectedUser._id) {
        setIsTyping(true);
      }
    });
    newSocket.on("userStoppedTyping", ({ sender }) => {
      if (selectedUser && sender === selectedUser._id) {
        setIsTyping(false);
      }
    });

    return () => newSocket.disconnect();
  }, [userId, API, selectedUser]);

  // ✅ Fetch chat list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API}/chats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const chatUsers = res.data.users || [];
        setUsers(chatUsers);

        // ✅ Auto-select alumni if alumniId is passed
        if (alumniId) {
          const target = chatUsers.find((u) => u._id === alumniId);
          if (target) setSelectedUser(target);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, [API, token, alumniId]);

  useEffect(() => {
    const fetchChatDirect = async () => {
      if (alumniId) {
        try {
          const res = await axios.get(`${API}/chats/with/${alumniId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const target = res.data.participants.find((p) => p._id !== userId);
          if (target) setSelectedUser(target);
        } catch (err) {
          console.error("Error fetching direct chat:", err);
        }
      }
    };
    fetchChatDirect();
  }, [alumniId, API, token, userId]);

  // ✅ Fetch messages for selected user
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      try {
        const res = await axios.get(`${API}/chats/${selectedUser.chatId || selectedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data || []);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [selectedUser, API, token]);

  // ✅ Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const res = await axios.post(
        `${API}/chats/send`,
        {
          receiverId: selectedUser._id,
          content: newMessage,
          type: "text",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages([...messages, res.data]);

      // Emit via socket
      socket.emit("sendMessage", {
        sender: userId,
        receiver: selectedUser._id,
        content: newMessage,
        type: "text",
      });

      setNewMessage("");
      setShowEmojiPicker(false);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    let formData = new FormData();
    formData.append("file", file);
    formData.append("receiverId", selectedUser._id);
    formData.append("type", type);

    axios
      .post(`${API}/chats/send`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        setMessages([...messages, res.data]);
        socket.emit("sendMessage", {
          sender: userId,
          receiver: selectedUser._id,
          content: res.data.content,
          type: res.data.type,
        });
      })
      .catch((err) => console.error("File send error:", err));
  };

  // ✅ typing event triggers
  const handleTyping = (typing) => {
    if (socket && selectedUser) {
      if (typing) {
        socket.emit("typing", { sender: userId, receiver: selectedUser._id });
      } else {
        socket.emit("stopTyping", { sender: userId, receiver: selectedUser._id });
      }
    }
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <h3>Chats</h3>
        {users.length > 0 ? (
          users.map((usr) => (
            <div
              key={usr._id}
              className={`chat-user ${selectedUser?._id === usr._id ? "active" : ""}`}
              onClick={() => setSelectedUser(usr)}
            >
              <div className="avatar">{usr.name?.charAt(0)}</div>
              <div className="chat-info">
                <div className="chat-top">
                  <p className="user-name">{usr.name}</p>
                </div>
                <p className="last-message">{usr.lastMessage || ""}</p>
              </div>
              {usr.online && <span className="online-dot"></span>}
            </div>
          ))
        ) : (
          <p className="no-users">No chats yet</p>
        )}
      </div>

      {/* Chat area */}
      <div className="chat-main">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <div className="header-left">
                <div className="avatar big">{selectedUser.name?.charAt(0)}</div>
                <div>
                  <h4>{selectedUser.name}</h4>
                  <span className="role">{selectedUser.role}</span>
                </div>
              </div>
              <div className="header-right">⋮</div>
            </div>

            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`chat-bubble-wrapper ${
                    msg.sender?._id === userId ? "sent-wrapper" : "received-wrapper"
                  }`}
                >
                  <div className={`chat-bubble ${msg.sender?._id === userId ? "sent" : "received"}`}>
                    {msg.type === "photo" && <img src={msg.content} alt="uploaded" className="chat-media" />}
                    {msg.type === "video" && <video src={msg.content} controls className="chat-media" />}
                    {msg.type === "file" && <a href={msg.content} className="chat-file">📄 {msg.content}</a>}
                    {(!msg.type || msg.type === "text") && <p>{msg.content}</p>}
                    <div className="chat-meta">
                      <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                      {msg.sender?._id === userId && (
                        msg.status === "sent" ? (
                          <FiCheck size={14} className="text-gray-500" />
                        ) : (
                          <span className="flex">
                            <FiCheck size={14} className="text-blue-500 -mr-1" />
                            <FiCheck size={14} className="text-blue-500" />
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && <p className="typing-indicator">{selectedUser.name} is typing...</p>}
            </div>

            {/* Input Area */}
            <div className="chat-input">
              <button className="icon-btn" onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowAttachmentMenu(false); }}>
                <FiSmile size={18} />
              </button>
              {showEmojiPicker && <div className="emoji-picker"><EmojiPicker onEmojiClick={handleEmojiClick} /></div>}

              <button className="icon-btn" onClick={() => { setShowAttachmentMenu(!showAttachmentMenu); setShowEmojiPicker(false); }}>
                <FiPaperclip size={18} />
              </button>
              {showAttachmentMenu && (
                <div className="attachment-menu">
                  <p onClick={() => fileInputRef.current.click()}>📄 File</p>
                  <p onClick={() => imageInputRef.current.click()}>🖼️ Photo</p>
                  <p onClick={() => videoInputRef.current.click()}>🎥 Video</p>
                </div>
              )}

              <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={(e) => handleFileSelect(e, "file")} />
              <input type="file" accept="image/*" ref={imageInputRef} style={{ display: "none" }} onChange={(e) => handleFileSelect(e, "photo")} />
              <input type="file" accept="video/*" ref={videoInputRef} style={{ display: "none" }} onChange={(e) => handleFileSelect(e, "video")} />

              <input
                type="text"
                placeholder="Write a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                onFocus={() => handleTyping(true)}
                onBlur={() => handleTyping(false)}
              />
              <button className="send-btn" onClick={handleSend}>Send</button>
            </div>
          </>
        ) : (
          <div className="chat-placeholder">
            <p>Select a user to start chatting 💬</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
