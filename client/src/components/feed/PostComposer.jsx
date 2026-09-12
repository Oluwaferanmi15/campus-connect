import { useState } from 'react';
import api from '../../api/client';

export default function PostComposer({ groupId = null, onPosted }) {
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setUploadError('');
    if (!file) {
      setMediaFile(null);
      setMediaType(null);
      setPreview(null);
      return;
    }
    setMediaFile(file);
    setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
    setPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaType(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    setUploadError('');
    try {
      let media = [];
      if (mediaFile) {
        const formData = new FormData();
        formData.append('media', mediaFile);
        const uploadRes = await api.post('/uploads/media', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        media = [uploadRes.data.url];
      }

      const res = await api.post('/posts', { content, group: groupId, media });
      setContent('');
      clearMedia();
      onPosted?.(res.data.post);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to post');
    } finally {
      setPosting(false);
    }
  };

  return (
    <form className="post-composer" onSubmit={handleSubmit}>
      <textarea
        placeholder="Share something with your campus..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={2000}
        rows={3}
      />
      {preview && (
        <div className="image-preview">
          {mediaType === 'video' ? (
            <video src={preview} controls muted />
          ) : (
            <img src={preview} alt="Selected upload preview" />
          )}
          <button type="button" onClick={clearMedia}>
            Remove
          </button>
        </div>
      )}
      {uploadError && <p className="form-error">{uploadError}</p>}
      <div className="composer-actions">
        <label className="file-input-label">
          Add photo or video
          <input type="file" accept="image/*,video/*" onChange={handleFileChange} hidden />
        </label>
        <button type="submit" disabled={posting || !content.trim()}>
          {posting ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  );
}