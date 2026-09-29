import { useState } from 'react';
import api from '../../api/client';

export default function PostComposer({ groupId = null, onPosted }) {
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setUploadError('');
    if (!file) {
      setImageFile(null);
      setPreview(null);
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    setUploadError('');
    try {
      let media = [];
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await api.post('/uploads/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        media = [uploadRes.data.url];
      }

      const res = await api.post('/posts', { content, group: groupId, media });
      setContent('');
      clearImage();
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
          <img src={preview} alt="Selected upload preview" />
          <button type="button" onClick={clearImage}>
            Remove
          </button>
        </div>
      )}
      {uploadError && <p className="form-error">{uploadError}</p>}
      <div className="composer-actions">
        <label className="file-input-label">
          Add photo
          <input type="file" accept="image/*" onChange={handleFileChange} hidden />
        </label>
        <button type="submit" disabled={posting || !content.trim()}>
          {posting ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  );
}