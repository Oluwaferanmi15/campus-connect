import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import PostComposer from '../components/feed/PostComposer';
import PostCard from '../components/feed/PostCard';

export default function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    api.get(`/groups/${id}`).then((res) => setGroup(res.data.group));
    api.get('/posts', { params: { group: id } }).then((res) => setPosts(res.data.posts));
  }, [id]);

  const handleJoin = async () => {
    await api.post(`/groups/${id}/join`);
    setIsMember(true);
  };

    const handlePosted = (post) => setPosts((prev) => [post, ...prev]);
  const handleDeleted = (postId) => setPosts((prev) => prev.filter((p) => p._id !== postId));

  if (!group) return <p>Loading group…</p>;

  return (
    <div className="group-detail-page">
      <header className="group-detail-header">
        <h1>{group.name}</h1>
        <span className="group-type">{group.type}</span>
        <p>{group.description}</p>
        <button onClick={handleJoin} disabled={isMember}>
          {isMember ? 'Joined' : 'Join group'}
        </button>
      </header>

      <PostComposer groupId={id} onPosted={handlePosted} />

            <div className="post-list">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} onDeleted={handleDeleted} />
        ))}
      </div>
    </div>
  );
}
