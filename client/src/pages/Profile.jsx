import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.post('/uploads/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(res.data.user);
      setSuccess('Profile photo updated');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  const avatarSrc = preview || user.avatarUrl || null;

  return (
    <div className="profile-page">
      <h1>Your profile</h1>

      <div className="profile-card">
        <div className="avatar-wrap">
          {avatarSrc ? (
            <img src={avatarSrc} alt="Your avatar" className="avatar-img" />
          ) : (
            <div className="avatar-placeholder">{user.name?.[0]?.toUpperCase()}</div>
          )}
        </div>

        <label className="file-input-label">
          {uploading ? 'Uploading…' : 'Change photo'}
          <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} hidden />
        </label>

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

        <dl className="profile-details">
          <dt>Name</dt>
          <dd>{user.name}</dd>
          <dt>Email</dt>
          <dd>{user.email}</dd>
          <dt>University</dt>
          <dd>{user.university || '—'}</dd>
          <dt>Department</dt>
          <dd>{user.department || '—'}</dd>
          <dt>Verified</dt>
          <dd>{user.verified ? 'Yes' : 'Not yet verified'}</dd>
        </dl>

        <Link to="/course-registration" className="profile-course-link">
          Register department & courses
        </Link>
      </div>
    </div>
  );
}