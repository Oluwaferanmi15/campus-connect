import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function People() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [actionMsg, setActionMsg] = useState({});
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get('/users/search', { params: { q: query } });
      setUsers(res.data.users);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId) => {
    try {
      await api.post(`/connections/request/${userId}`);
      setActionMsg((prev) => ({ ...prev, [userId]: 'Request sent' }));
    } catch (err) {
      setActionMsg((prev) => ({
        ...prev,
        [userId]: err.response?.data?.message || 'Could not send request',
      }));
    }
  };

  const handleMessage = async (userId) => {
    const res = await api.post('/conversations', { recipientId: userId });
    navigate(`/messages/${res.data.conversation._id}`);
  };

  return (
    <div className="people-page">
      <h1>Find people</h1>
      <form className="people-search" onSubmit={handleSearch}>
        <input
          placeholder="Search by name, email, or university…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {searched && !loading && users.length === 0 && (
        <p className="empty-state">No one matched that search.</p>
      )}

      <ul className="people-list">
        {users.map((u) => (
          <li key={u._id} className="person-card">
            <div>
              <strong>{u.name}</strong>
              {u.university && <span className="person-meta">{u.university}</span>}
              {u.department && <span className="person-meta">{u.department}</span>}
            </div>
            <div className="person-actions">
              <button onClick={() => handleConnect(u._id)}>Connect</button>
              <button onClick={() => handleMessage(u._id)}>Message</button>
            </div>
            {actionMsg[u._id] && <p className="person-action-msg">{actionMsg[u._id]}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
