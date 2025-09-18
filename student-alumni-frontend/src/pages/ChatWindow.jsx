import { useState, useEffect, useRef } from "react";
import "./ChatWindow.css";
import { FiCheck, FiPaperclip, FiSmile } from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";

const dummyUsers = [
  { _id: "1", name: "Alice Johnson", role: "Alumni", online: true, lastMessage: "Happy to help!", time: "Aug 7" },
  { _id: "2", name: "Bob Smith", role: "Student", online: false, lastMessage: "Project is going well", time: "Aug 2" },
  { _id: "3", name: "Clara Davis", role: "Alumni", online: true, lastMessage: "See you tomorrow!", time: "Jul 29" },
];

const dummyMessages = {
  "1": [
    { sender: "me", content: "Hi Alice, can we discuss internships?", status: "seen", time: "9:05 PM" },
    { sender: "Alice", content: "Sure, happy to help!", time: "9:07 PM" },
  ],
  "2": [
    { sender: "me", content: "Hey Bob, how’s your project going?", status: "sent", time: "8:55 AM" },
    { sender: "Bob", content: "It’s going well, thanks!", time: "9:00 AM" },
  ],
};

const ChatWindow = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // New state for emoji & attachment popups
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Load messages for selected user
  useEffect(() => {
    if (selectedUser) {
      setMessages(dummyMessages[selectedUser._id] || []);
    }
  }, [selectedUser]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const newMsg = { sender: "me", content: newMessage, status: "sent", time: "Now", type: "text" };
    setMessages([...messages, newMsg]);
    setNewMessage("");
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    let newMsg = {
      sender: "me",
      status: "sent",
      time: "Now",
      type,
    };

    if (type === "Photo") {
      newMsg.content = URL.createObjectURL(file);
    } else if (type === "Video") {
      newMsg.content = URL.createObjectURL(file);
    } else {
      newMsg.content = file.name;
    }

    setMessages([...messages, newMsg]);
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <h3>Chats</h3>
        {dummyUsers.map((user) => (
          <div
            key={user._id}
            className={`chat-user ${selectedUser?._id === user._id ? "active" : ""}`}
            onClick={() => setSelectedUser(user)}
          >
            <div className="avatar">{user.name.charAt(0)}</div>
            <div className="chat-info">
              <div className="chat-top">
                <p className="user-name">{user.name}</p>
                <span className="chat-time">{user.time}</span>
              </div>
              <p className="last-message">{user.lastMessage}</p>
            </div>
            {user.online && <span className="online-dot"></span>}
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div className="chat-main">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <div className="header-left">
                <div className="avatar big">{selectedUser.name.charAt(0)}</div>
                <div>
                  <h4>{selectedUser.name}</h4>
                  <span className="role">
                    {selectedUser.role} · {selectedUser.online ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
              <div className="header-right">⋮</div>
            </div>

            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`chat-bubble-wrapper ${msg.sender === "me" ? "sent-wrapper" : "received-wrapper"}`}
                >
                  <div className={`chat-bubble ${msg.sender === "me" ? "sent" : "received"}`}>
                    {/* Render different types */}
                    {msg.type === "Photo" && (
                      <img src={msg.content} alt="uploaded" className="chat-media" />
                    )}
                    {msg.type === "Video" && (
                      <video src={msg.content} controls className="chat-media" />
                    )}
                    {msg.type === "File" && (
                      <a href="#" className="chat-file">📄 {msg.content}</a>
                    )}
                    {(!msg.type || msg.type === "text") && <p>{msg.content}</p>}

                    <div className="chat-meta">
                      <span>{msg.time}</span>
                      {msg.sender === "me" && (
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
              {isTyping && (
                <p className="typing-indicator">{selectedUser.name} is typing...</p>
              )}
            </div>

            {/* Input Area */}
            <div className="chat-input">
              {/* Emoji Button */}
              <button
                className="icon-btn"
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowAttachmentMenu(false);
                }}
              >
                <FiSmile size={18} />
              </button>
              {showEmojiPicker && (
                <div className="emoji-picker">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}

              {/* Attachment Button */}
              <button
                className="icon-btn"
                onClick={() => {
                  setShowAttachmentMenu(!showAttachmentMenu);
                  setShowEmojiPicker(false);
                }}
              >
                <FiPaperclip size={18} />
              </button>
              {showAttachmentMenu && (
                <div className="attachment-menu">
                  <p onClick={() => fileInputRef.current.click()}>📄 File</p>
                  <p onClick={() => imageInputRef.current.click()}>🖼️ Photo</p>
                  <p onClick={() => videoInputRef.current.click()}>🎥 Video</p>
                </div>
              )}

              {/* Hidden Inputs */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) => handleFileSelect(e, "File")}
              />
              <input
                type="file"
                accept="image/*"
                ref={imageInputRef}
                style={{ display: "none" }}
                onChange={(e) => handleFileSelect(e, "Photo")}
              />
              <input
                type="file"
                accept="video/*"
                ref={videoInputRef}
                style={{ display: "none" }}
                onChange={(e) => handleFileSelect(e, "Video")}
              />

              {/* Message Input */}
              <input
                type="text"
                placeholder="Write a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
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
