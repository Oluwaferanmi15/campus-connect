import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);

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
            const other = c.participants.find((p) => p._id !== user?.id);
            return (
              <li key={c._id}>
                <Link to={`/messages/${c._id}`}>
                  <strong>{other?.name || 'Unknown user'}</strong>
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
