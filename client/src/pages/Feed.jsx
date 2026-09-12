import { useEffect, useState } from 'react';
import api from '../api/client';
import PostComposer from '../components/feed/PostComposer';
import PostCard from '../components/feed/PostCard';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/posts')
      .then((res) => setPosts(res.data.posts))
      .finally(() => setLoading(false));
  }, []);

  const handlePosted = (post) => setPosts((prev) => [post, ...prev]);

  return (
    <div className="feed-page">
      <h1>Campus Feed</h1>
      <PostComposer onPosted={handlePosted} />
      {loading ? (
        <p>Loading feed…</p>
      ) : posts.length === 0 ? (
        <p className="empty-state">No posts yet — be the first to share something.</p>
      ) : (
        <div className="post-list">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
