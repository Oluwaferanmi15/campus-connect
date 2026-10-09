import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const timeAgo = (iso) => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
};

function CommentAvatar({ author, small }) {
  const cls = `comment-avatar ${small ? 'comment-avatar--sm' : ''}`;
  return author?.avatarUrl ? (
    <img src={author.avatarUrl} alt="" className={cls} />
  ) : (
    <span className={`${cls} comment-avatar--placeholder`}>
      {author?.name?.[0]?.toUpperCase()}
    </span>
  );
}

function CommentRow({ comment, rootId, myId, canModerate, onLike, onReply, onDelete, isReply }) {
  const liked = comment.likes.includes(myId);
  const canDelete = comment.author?._id === myId || canModerate;

  return (
    <div className={`comment-row ${isReply ? 'comment-row--reply' : ''}`}>
      <CommentAvatar author={comment.author} small={isReply} />
      <div className="comment-body">
        <p className="comment-text">
          <strong>{comment.author?.name}</strong> {comment.content}
        </p>
        <div className="comment-meta">
          <span>{timeAgo(comment.createdAt)}</span>
          {comment.likes.length > 0 && (
            <span>
              {comment.likes.length} {comment.likes.length === 1 ? 'like' : 'likes'}
            </span>
          )}
          <button type="button" onClick={() => onReply(comment, rootId)}>
            Reply
          </button>
          {canDelete && (
            <button type="button" onClick={() => onDelete(comment._id)}>
              Delete
            </button>
          )}
        </div>
      </div>
      <button
        type="button"
        className={`comment-like ${liked ? 'is-liked' : ''}`}
        onClick={() => onLike(comment._id)}
        aria-label={liked ? 'Unlike comment' : 'Like comment'}
      >
        {liked ? '♥' : '♡'}
      </button>
    </div>
  );
}

export default function CommentsPanel({ post, onClose, onCountChange }) {
  const { user } = useAuth();
  const myId = user?.id || user?._id;
  const isPostOwner = post.author?._id === myId;

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState(null); // { rootId, name }
  const [expanded, setExpanded] = useState({});
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    api
      .get(`/posts/${post._id}/comments`)
      .then((res) => setComments(res.data.comments))
      .catch(() => setError('Could not load comments'))
      .finally(() => setLoading(false));
  }, [post._id]);

  // Lock page scroll while the panel is open, and close on Escape
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const { roots, repliesByRoot } = useMemo(() => {
    const topLevel = comments.filter((c) => !c.parentComment);
    const map = {};
    comments
      .filter((c) => c.parentComment)
      .forEach((c) => {
        if (!map[c.parentComment]) map[c.parentComment] = [];
        map[c.parentComment].push(c);
      });
    return { roots: [...topLevel].reverse(), repliesByRoot: map };
  }, [comments]);

  const send = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    setSending(true);
    setError('');
    try {
      const res = await api.post(`/posts/${post._id}/comments`, {
        content: text,
        parentComment: replyTo?.rootId || null,
      });
      setComments((prev) => [...prev, res.data.comment]);
      onCountChange(res.data.commentCount);
      if (replyTo) setExpanded((prev) => ({ ...prev, [replyTo.rootId]: true }));
      else if (listRef.current) listRef.current.scrollTop = 0;
      setDraft('');
      setReplyTo(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post comment');
    } finally {
      setSending(false);
    }
  };

  const startReply = (comment, rootId) => {
    setReplyTo({ rootId, name: comment.author?.name });
    setDraft(`@${comment.author?.name} `);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyTo(null);
    setDraft('');
  };

  const likeComment = async (commentId) => {
    try {
      const res = await api.post(`/posts/comments/${commentId}/like`);
      setComments((prev) =>
        prev.map((c) => {
          if (c._id !== commentId) return c;
          const without = c.likes.filter((id) => id !== myId);
          return { ...c, likes: res.data.liked ? [...without, myId] : without };
        })
      );
    } catch (err) {
      setError('Could not like comment');
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const res = await api.delete(`/posts/comments/${commentId}`);
      const removed = new Set(res.data.deletedIds);
      setComments((prev) => prev.filter((c) => !removed.has(c._id)));
      onCountChange(res.data.commentCount);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete comment');
    }
  };

  const rowProps = {
    myId,
    canModerate: isPostOwner,
    onLike: likeComment,
    onReply: startReply,
    onDelete: deleteComment,
  };

  return createPortal(
    <div className="comments-overlay" onClick={onClose}>
      <div
        className="comments-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Comments"
      >
        <div className="comments-grabber" />
        <header className="comments-header">
          <h3>Comments</h3>
          <button type="button" className="comments-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <div className="comments-list" ref={listRef}>
          {loading ? (
            <p className="comments-empty">Loading comments…</p>
          ) : roots.length === 0 ? (
            <div className="comments-empty">
              <strong>No comments yet</strong>
              <span>Start the conversation.</span>
            </div>
          ) : (
            roots.map((root) => {
              const replies = repliesByRoot[root._id] || [];
              const open = expanded[root._id];
              return (
                <div key={root._id} className="comment-thread">
                  <CommentRow comment={root} rootId={root._id} {...rowProps} />
                  {replies.length > 0 && (
                    <button
                      type="button"
                      className="comment-replies-toggle"
                      onClick={() => setExpanded((prev) => ({ ...prev, [root._id]: !open }))}
                    >
                      {open
                        ? 'Hide replies'
                        : `View ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
                    </button>
                  )}
                  {open &&
                    replies.map((reply) => (
                      <CommentRow key={reply._id} comment={reply} rootId={root._id} isReply {...rowProps} />
                    ))}
                </div>
              );
            })
          )}
        </div>

        {error && <p className="comments-error">{error}</p>}

        {replyTo && (
          <div className="comments-reply-banner">
            <span>Replying to {replyTo.name}</span>
            <button type="button" onClick={cancelReply}>
              Cancel
            </button>
          </div>
        )}

        <form className="comments-form" onSubmit={send}>
          <CommentAvatar author={user} small />
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={replyTo ? `Reply to ${replyTo.name}…` : 'Add a comment…'}
            maxLength={1000}
          />
          <button type="submit" disabled={!draft.trim() || sending}>
            {sending ? '…' : 'Post'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}