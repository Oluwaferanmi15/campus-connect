import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const { confirmPassword, ...payload } = form;
      await signup(payload);
      navigate('/course-registration');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="auth-split">
      <div
        className="auth-visual"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(20,33,61,0.15) 0%, rgba(20,33,61,0.85) 100%), url('https://images.pexels.com/photos/7972501/pexels-photo-7972501.jpeg?auto=compress&cs=tinysrgb&w=1200')",
        }}
      >
        <div className="auth-visual-top">
          <Link to="/">Campus Connect</Link>
        </div>
        <div className="auth-visual-bottom">
          <h2>Join your campus.</h2>
          <p>Create an account and find your people in minutes — no approval wait.</p>
        </div>
      </div>

      <div className="auth-form-panel">
        <form onSubmit={handleSubmit}>
          <h1>Create your account</h1>
          <p className="auth-subtitle">You can verify your university email later.</p>
          {error && <p className="auth-form-error">{error}</p>}
          <label>
            Full name
            <input value={form.name} onChange={update('name')} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={update('email')} required />
          </label>
          <label>
            Password
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={update('password')}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </label>
          <label>
            Confirm password
            <div className="password-field">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={update('confirmPassword')}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
          </label>
          <label>
            University (optional for now)
            <input value={form.university} onChange={update('university')} />
          </label>
          <button type="submit">Create account</button>
          <p>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}