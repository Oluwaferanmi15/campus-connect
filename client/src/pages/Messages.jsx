import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { usePresence } from '../context/PresenceContext';

const formatListTime = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
};

export default function Messages() {
  const { user } = useAuth();
  const { onlineUserIds } = usePresence();
  const [conversations, setConversations] = useState([]);
  const myId = user?.id || user?._id;

  useEffect(() => {
    api.get('/conversations').then((res) => setConversations(res.data.conversations));
  }, []);

  return (
    <div className="messages-page">
      <h1>Messages</h1>
      {conversations.length === 0 ? (
        <p className="empty-state">No conversations yet — connect with someone to start chatting.</p>
      ) : (
        <ul className="conversation-list">
          {conversations.map((c) => {
            const other = c.participants.find((p) => p._id !== myId);
            return (
              <li key={c._id}>
                <Link to={`/messages/${c._id}`}>
                  <div className="conversation-row">
                    <span className="person-name-row">
                      {other && (
                        <span
                          className={`status-dot ${onlineUserIds.has(other._id) ? 'online' : 'offline'}`}
                          aria-label={onlineUserIds.has(other._id) ? 'Online' : 'Offline'}
                        />
                      )}
                      <strong>{other?.name || 'Unknown user'}</strong>
                    </span>
                    <span className="conversation-time">{formatListTime(c.lastMessageAt)}</span>
                  </div>
                  <p>{c.lastMessage || 'No messages yet'}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}