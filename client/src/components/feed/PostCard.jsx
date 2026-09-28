import { useState } from 'react';
import api from '../../api/client';

const isVideoUrl = (url) =>
  /\/video\/upload\//.test(url) || /\.(mp4|mov|webm|m4v|avi)$/i.test(url);

export default function PostCard({ post }) {
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    const res = await api.post(`/posts/${post._id}/like`);
    setLikes(res.data.likesCount);
    setLiked(res.data.liked);
  };

  return (
    <article className="post-card">
      <header>
        <span className="post-author">{post.author?.name}</span>
        <span className="post-meta">{post.author?.university}</span>
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
      <footer>
        <button className={liked ? 'liked' : ''} onClick={handleLike}>
          ♥ {likes}
        </button>
        <span>{post.commentCount || 0} comments</span>
      </footer>
    </article>
  );
}