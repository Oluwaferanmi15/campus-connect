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
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('cc_theme', next);
    setTheme(next);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`navbar ${menuOpen ? 'menu-open' : ''}`}>
      <div className="navbar-top-row">
        <Link to="/feed" className="brand" onClick={closeMenu}>
          Campus Connect
        </Link>

        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className="nav-links">
        <NavLink to="/feed" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMenu}>
          Feed
        </NavLink>
        <NavLink to="/groups" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMenu}>
          Groups
        </NavLink>
        <NavLink to="/people" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMenu}>
          People
        </NavLink>
        <NavLink to="/messages" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMenu}>
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
            <Link to="/profile" className="nav-profile-link" onClick={closeMenu}>
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