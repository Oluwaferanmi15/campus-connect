import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';
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
            "linear-gradient(180deg, rgba(20,33,61,0.15) 0%, rgba(20,33,61,0.85) 100%), url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpM6cDcFobRPPRuOgefP5ZZemjs8cDGL3UC5Y22Rj9zA&s=10')",
        }}
      >
        <div className="auth-visual-top">
          <Link to="/">
            <Logo size={26} />
          </Link>
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