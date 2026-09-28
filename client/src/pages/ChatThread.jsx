import { Fragment, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import { useCall } from '../context/CallContext';

const sameDay = (a, b) => a.toDateString() === b.toDateString();

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const dayLabel = (iso) => {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function ChatThread() {
  const { id } = useParams();
  const { user } = useAuth();
  const { startCall, inCall } = useCall();
  const socketRef = useSocket();
  const [messages, setMessages] = useState([]);
  const [peer, setPeer] = useState(null);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);
  const myId = user?.id || user?._id;

  useEffect(() => {
    api.get(`/conversations/${id}/messages`).then((res) => setMessages(res.data.messages));
  }, [id]);

  useEffect(() => {
    if (!myId) return;
    api.get('/conversations').then((res) => {
      const convo = res.data.conversations.find((c) => c._id === id);
      setPeer(convo?.participants.find((p) => p._id !== myId) || null);
    });
  }, [id, myId]);

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
      <div className="chat-header">
        <span className="chat-header-name">{peer?.name || 'Chat'}</span>
        {peer && (
          <div className="chat-header-actions">
            <button
              className="chat-call-btn"
              disabled={inCall}
              onClick={() => startCall({ conversationId: id, peer, video: false })}
            >
              📞 Call
            </button>
            <button
              className="chat-call-btn"
              disabled={inCall}
              onClick={() => startCall({ conversationId: id, peer, video: true })}
            >
              🎥 Video
            </button>
          </div>
        )}
      </div>

      <div className="message-list">
        {messages.map((m, i) => {
          const showDay =
            i === 0 || !sameDay(new Date(m.createdAt), new Date(messages[i - 1].createdAt));
          return (
            <Fragment key={m._id}>
              {showDay && <div className="date-divider">{dayLabel(m.createdAt)}</div>}
              <div className={`message ${m.sender._id === myId ? 'own' : ''}`}>
                <p>{m.content}</p>
                <span className="message-time">{formatTime(m.createdAt)}</span>
              </div>
            </Fragment>
          );
        })}
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