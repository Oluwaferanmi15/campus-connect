import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';

export default function ChatThread() {
  const { id } = useParams();
  const { user } = useAuth();
  const socketRef = useSocket();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get(`/conversations/${id}/messages`).then((res) => setMessages(res.data.messages));
  }, [id]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit('conversation:join', id);

    const handleNew = (message) => {
      if (message.conversation === id) setMessages((prev) => [...prev, message]);
    };
    socket.on('message:new', handleNew);

    return () => {
      socket.emit('conversation:leave', id);
      socket.off('message:new', handleNew);
    };
  }, [id, socketRef]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    socketRef.current?.emit('message:send', { conversationId: id, content: draft }, (res) => {
      if (res?.error) console.error(res.error);
    });
    setDraft('');
  };

  return (
    <div className="chat-thread-page">
      <div className="message-list">
        {messages.map((m) => (
          <div key={m._id} className={`message ${m.sender._id === user?.id ? 'own' : ''}`}>
            <span className="message-sender">{m.sender.name}</span>
            <p>{m.content}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form className="message-composer" onSubmit={handleSend}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
