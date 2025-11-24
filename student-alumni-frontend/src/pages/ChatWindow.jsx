import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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
			await axios.post(`${import.meta.env.VITE_API_BASE_URL || ''}/chats/${chatId}/messages`, payload, { headers: { Authorization: `Bearer ${token}` } });
			setInput('');
			// optimistic fetch
			fetchMessages(chatId);
		} catch (err) {
			console.error('send failed', err);
			alert('Failed to send message');
		}
	};

	if (loading) return <div style={{ padding: 20 }}>Loading chat…</div>;
	if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;

	return (
		<div style={{ padding: 12, display: 'flex', flexDirection: 'column', height: '100%' }}>
			<h2 style={{ marginTop: 0 }}>Chat with {otherName || otherId}</h2>

			<div ref={boxRef} style={{ flex: 1, border: '1px solid #ddd', padding: 12, borderRadius: 6, overflowY: 'auto', background: '#ffffff' }}>
				{messages.length === 0 && <div style={{ color: '#666' }}>No messages yet</div>}
				{messages.map((m, i) => {
					const fromMe = String(m.from) === String(meId);
					return (
						<div key={i} style={{ display: 'flex', justifyContent: fromMe ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
							<div style={{ maxWidth: '80%', background: fromMe ? '#0b84ff' : '#f1f0f0', color: fromMe ? '#fff' : '#111', padding: '8px 12px', borderRadius: 12 }}>
								<div style={{ fontSize: 14 }}>{m.text}</div>
								<div style={{ fontSize: 11, color: fromMe ? '#e6f0ff' : '#666', marginTop: 6, textAlign: 'right' }}>{new Date(m.ts || m.ts).toLocaleString()}</div>
							</div>
						</div>
					);
				})}
			</div>

			<div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
				<input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message" style={{ flex: 1, padding: '10px 12px', borderRadius: 6, border: '1px solid #ccc' }} onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }} />
				<button onClick={sendMessage} style={{ padding: '10px 20px', background: '#0b84ff', color: '#fff', border: 'none', borderRadius: 6 }}>Send</button>
			</div>
		</div>
	);
};

export default ChatWindow;
 
