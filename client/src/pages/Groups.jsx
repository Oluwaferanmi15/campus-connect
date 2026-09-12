import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', type: 'club', privacy: 'public' });

  const loadGroups = () => {
    setLoading(true);
    api
      .get('/groups')
      .then((res) => setGroups(res.data.groups))
      .finally(() => setLoading(false));
  };

  useEffect(loadGroups, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/groups', form);
    setShowForm(false);
    setForm({ name: '', description: '', type: 'club', privacy: 'public' });
    loadGroups();
  };

  return (
    <div className="groups-page">
      <header className="groups-header">
        <h1>Groups</h1>
        <button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : 'New group'}</button>
      </header>

      {showForm && (
        <form className="group-form" onSubmit={handleCreate}>
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label>
            Type
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="department">Department</option>
              <option value="club">Club</option>
              <option value="course">Course</option>
            </select>
          </label>
          <label>
            Privacy
            <select value={form.privacy} onChange={(e) => setForm({ ...form, privacy: e.target.value })}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </label>
          <button type="submit">Create group</button>
        </form>
      )}

      {loading ? (
        <p>Loading groups…</p>
      ) : groups.length === 0 ? (
        <p className="empty-state">No groups yet — create the first one for your department or club.</p>
      ) : (
        <ul className="group-list">
          {groups.map((group) => (
            <li key={group._id}>
              <Link to={`/groups/${group._id}`}>
                <strong>{group.name}</strong>
                <span className="group-type">{group.type}</span>
                <p>{group.description}</p>
                <span className="group-members">{group.members.length} members</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
