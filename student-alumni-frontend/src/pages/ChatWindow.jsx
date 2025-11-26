import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './ChatWindow.css';

// Simple server-backed chat UI (plaintext) with polling — behaves like a basic WhatsApp chat window.
const ChatWindow = () => {
	const { id: otherId } = useParams();
	const { user } = useAuth();
	const meId = user?._id || JSON.parse(localStorage.getItem('user') || 'null')?._id;
	const token = localStorage.getItem('token');

	const [chatId, setChatId] = useState(null);
	const [messages, setMessages] = useState([]);
	const [otherName, setOtherName] = useState(null);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const pollRef = useRef(null);
	const boxRef = useRef(null);

	const navigate = useNavigate();

	useEffect(() => {
		let mounted = true;
		const init = async () => {
			try {
				setLoading(true);
				const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL || ''}/chats`, { otherUserId: otherId }, { headers: { Authorization: `Bearer ${token}` } });
				if (!mounted) return;
				const chat = res.data.chat;
				setChatId(chat._id);
				// fetch other user's display name for header
				try {
					const u = await axios.get(`${import.meta.env.VITE_API_BASE_URL || ''}/users/${otherId}`, { headers: { Authorization: `Bearer ${token}` } });
					setOtherName(u.data.fullName || u.data.name || otherId);
				} catch (e) {
					setOtherName(otherId);
				}
				await fetchMessages(chat._id);
				// start polling
				pollRef.current = setInterval(() => fetchMessages(chat._id), 3000);
			} catch (err) {
				console.error('Chat init error', err);
				setError('Failed to initialize chat');
			} finally {
				if (mounted) setLoading(false);
			}
		};
		init();
		return () => { mounted = false; if (pollRef.current) clearInterval(pollRef.current); };
	}, [otherId]);

	const fetchMessages = async (cid) => {
		if (!cid) return;
		try {
			const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || ''}/chats/${cid}/messages`, { headers: { Authorization: `Bearer ${token}` }, params: { limit: 200 } });
			setMessages(res.data.messages || []);
			// scroll to bottom
			setTimeout(() => { if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; }, 50);
		} catch (err) {
			console.error('fetch messages failed', err);
		}
	};

	const sendMessage = async () => {
		if (!input || !chatId) return;
		try {
			const payload = { text: input };
			// optimistic update
			const tempMsg = { from: meId, text: input, ts: new Date().toISOString(), _temp: true };
			setMessages((prev) => [...prev, tempMsg]);
			setInput('');
			await axios.post(`${import.meta.env.VITE_API_BASE_URL || ''}/chats/${chatId}/messages`, payload, { headers: { Authorization: `Bearer ${token}` } });
			// refresh messages
			fetchMessages(chatId);
		} catch (err) {
			console.error('send failed', err);
			alert('Failed to send message');
		}
	};

	if (loading) return <div style={{ padding: 20 }}>Loading chat…</div>;
	if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;

	return (
		<div className="wa-chat-root">
			<div className="wa-header">
				<button className="wa-back" onClick={() => navigate(-1)}>&larr;</button>
				<div className="wa-avatar">{(otherName || otherId || '?').charAt(0)}</div>
				<div className="wa-meta">
					<div className="wa-name">{otherName || otherId}</div>
					<div className="wa-status">Online</div>
				</div>
			</div>

			<div className="wa-messages" ref={boxRef}>
				{messages.length === 0 && <div className="wa-empty">No messages yet</div>}
				{messages.map((m, i) => {
					const fromMe = String(m.from) === String(meId);
					return (
						<div key={i} className={`wa-row ${fromMe ? 'me' : 'other'}`}>
							<div className={`wa-bubble ${fromMe ? 'me-bubble' : 'other-bubble'}`}>
								<div className="wa-text">{m.text}</div>
								<div className="wa-time">{new Date(m.ts || m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
							</div>
						</div>
					);
				})}
			</div>

			<div className="wa-input">
				<input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message" onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }} />
				<button className="wa-send" onClick={sendMessage}>Send</button>
			</div>
		</div>
	);
};

export default ChatWindow;
 
