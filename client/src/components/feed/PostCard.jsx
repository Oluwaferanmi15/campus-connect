import { useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import CommentsPanel from './CommentsPanel';

const isVideoUrl = (url) =>
  /\/video\/upload\//.test(url) || /\.(mp4|mov|webm|m4v|avi)$/i.test(url);

export default function PostCard({ post, onDeleted }) {
  const { user } = useAuth();
  const myId = user?.id || user?._id;
  const isOwner = post.author?._id === myId;

  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(post.likes?.includes(myId) || false);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleLike = async () => {
    const res = await api.post(`/posts/${post._id}/like`);
    setLikes(res.data.likesCount);
    setLiked(res.data.liked);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/posts/${post._id}`);
      onDeleted?.(post._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post');
      setDeleting(false);
    }
  };

  return (
    <article className="post-card">
      <header>
        <div>
          <span className="post-author">{post.author?.name}</span>
          <span className="post-meta">{post.author?.university}</span>
        </div>
        {isOwner && (
          <button className="post-delete-btn" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </header>
      <p className="post-content">{post.content}</p>
      {post.media?.length > 0 && (
        <div className="post-media">
          {post.media.map((url) =>
            isVideoUrl(url) ? (
              <video key={url} src={url} controls playsInline />
            ) : (
              <img key={url} src={url} alt="" />
            )
          )}
        </div>
      )}
      {error && <p className="form-error">{error}</p>}
      <footer>
        <button className={liked ? 'liked' : ''} onClick={handleLike}>
          {liked ? '♥' : '♡'} {likes}
        </button>
        <button className="post-comment-btn" onClick={() => setShowComments(true)}>
          💬 {commentCount}
        </button>
      </footer>

      {showComments && (
        <CommentsPanel
          post={post}
          onClose={() => setShowComments(false)}
          onCountChange={setCommentCount}
        />
      )}
    </article>
  );
}