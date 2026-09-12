import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

const messageFor = (n) => {
  switch (n.type) {
    case 'like':
      return `${n.actor.name} liked your post`;
    case 'comment':
      return `${n.actor.name} commented on your post`;
    case 'connection_request':
      return `${n.actor.name} sent you a connection request`;
    case 'connection_accepted':
      return `${n.actor.name} accepted your connection request`;
    case 'message':
      return `${n.actor.name} sent you a message`;
    case 'group_join':
      return `${n.actor.name} joined your group`;
    default:
      return `${n.actor.name} did something`;
  }
};

const linkFor = (n) => {
  if (n.type === 'message' && n.conversation) return `/messages/${n.conversation._id || n.conversation}`;
  if (n.type === 'connection_request' || n.type === 'connection_accepted') return '/people';
  if (n.type === 'group_join' && n.group) return `/groups/${n.group._id || n.group}`;
  return '/feed';
};

export default function NotificationBell({ socketRef }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/notifications/unread-count').then((res) => setUnreadCount(res.data.count));
  }, []);

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    const handleNew = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };
    socket.on('notification:new', handleNew);
    return () => socket.off('notification:new', handleNew);
  }, [socketRef]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      if (unreadCount > 0) {
        api.patch('/notifications/read-all').then(() => setUnreadCount(0));
      }
    }
  };

  const handleClickNotification = (n) => {
    setOpen(false);
    navigate(linkFor(n));
  };

  return (
    <div className="notification-bell" ref={containerRef}>
      <button className="bell-button" onClick={toggleOpen} aria-label="Notifications">
        🔔
        {unreadCount > 0 && <span className="bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          {notifications.length === 0 ? (
            <p className="notification-empty">No notifications yet</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n._id}
                className={`notification-item ${n.read ? '' : 'unread'}`}
                onClick={() => handleClickNotification(n)}
              >
                <span>{messageFor(n)}</span>
                <span className="notification-time">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}