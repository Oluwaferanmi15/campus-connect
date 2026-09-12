import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-split">
      <div
        className="auth-visual"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(20,33,61,0.15) 0%, rgba(20,33,61,0.85) 100%), url('https://images.pexels.com/photos/4778634/pexels-photo-4778634.jpeg?auto=compress&cs=tinysrgb&w=1200')",
        }}
      >
        <div className="auth-visual-top">
          <Link to="/">Campus Connect</Link>
        </div>
        <div className="auth-visual-bottom">
          <h2>Pick up right where you left off.</h2>
          <p>New posts, group activity, and messages are waiting for you.</p>
        </div>
      </div>

      <div className="auth-form-panel">
        <form onSubmit={handleSubmit}>
          <h1>Welcome back</h1>
          <p className="auth-subtitle">Log in to your Campus Connect account.</p>
          {error && <p className="auth-form-error">{error}</p>}
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button type="submit">Log in</button>
          <p>
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}