import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import NotificationBell from './NotificationBell';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const socketRef = useSocket();
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark');

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('cc_theme', next);
    setTheme(next);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/feed" className="brand">
        Campus Connect
      </Link>
      <div className="nav-links">
        <NavLink to="/feed" className={({ isActive }) => (isActive ? 'active' : '')}>
          Feed
        </NavLink>
        <NavLink to="/groups" className={({ isActive }) => (isActive ? 'active' : '')}>
          Groups
        </NavLink>
        <NavLink to="/people" className={({ isActive }) => (isActive ? 'active' : '')}>
          People
        </NavLink>
        <NavLink to="/messages" className={({ isActive }) => (isActive ? 'active' : '')}>
          Messages
        </NavLink>
      </div>
      <div className="nav-user">
        {user && (
          <>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <NotificationBell socketRef={socketRef} />
            <Link to="/profile" className="nav-profile-link">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="nav-avatar" />
              ) : (
                <span className="nav-avatar-placeholder">{user.name?.[0]?.toUpperCase()}</span>
              )}
              {user.name}
            </Link>
            <button onClick={handleLogout}>Log out</button>
          </>
        )}
      </div>
    </nav>
  );
}