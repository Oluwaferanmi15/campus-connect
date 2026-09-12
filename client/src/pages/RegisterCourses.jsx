import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = [
  'Computer Science', 'Engineering', 'Business Administration', 'Biology', 'Psychology',
  'Economics', 'Mathematics', 'Physics', 'Chemistry', 'English Literature', 'History',
  'Political Science', 'Sociology', 'Art & Design', 'Nursing', 'Law', 'Medicine',
  'Education', 'Communications', 'Other',
];

export default function RegisterCourses() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [department, setDepartment] = useState('');
  const [customDepartment, setCustomDepartment] = useState('');
  const [courseDraft, setCourseDraft] = useState('');
  const [courses, setCourses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const addCourse = () => {
    const value = courseDraft.trim();
    if (!value) return;
    if (!courses.includes(value)) setCourses((prev) => [...prev, value]);
    setCourseDraft('');
  };

  const handleCourseKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addCourse();
    }
  };

  const removeCourse = (value) => {
    setCourses((prev) => prev.filter((c) => c !== value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const finalDepartment = department === 'Other' ? customDepartment.trim() : department;

    if (!finalDepartment && courses.length === 0) {
      setError('Pick a department or add at least one course.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/groups/register-courses', {
        department: finalDepartment,
        courses,
      });
      setSuccess(res.data.groups);
      const me = await api.get('/auth/me');
      setUser(me.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="course-reg-page">
        <div className="course-reg-card">
          <h1>You're all set</h1>
          <p className="course-reg-subtitle">You've joined:</p>
          <ul className="course-reg-joined">
            {success.map((group) => (
              <li key={group._id}>
                <Link to={`/groups/${group._id}`}>{group.name}</Link>
                <span className="course-reg-joined-type">{group.type}</span>
              </li>
            ))}
          </ul>
          <button onClick={() => navigate('/feed')}>Continue to feed</button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-reg-page">
      <div className="course-reg-card">
        <h1>Register your department & courses</h1>
        <p className="course-reg-subtitle">
          We'll add you to the matching groups so you see posts from people in your classes.
        </p>

        <form onSubmit={handleSubmit}>
          {error && <p className="form-error">{error}</p>}

          <label>
            Department
            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">Select a department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          {department === 'Other' && (
            <label>
              Department name
              <input
                value={customDepartment}
                onChange={(e) => setCustomDepartment(e.target.value)}
                placeholder="e.g. Environmental Science"
              />
            </label>
          )}

          <label>
            Courses
            <div className="tag-input">
              {courses.map((c) => (
                <span key={c} className="tag-chip">
                  {c}
                  <button type="button" onClick={() => removeCourse(c)} aria-label={`Remove ${c}`}>
                    ×
                  </button>
                </span>
              ))}
              <input
                value={courseDraft}
                onChange={(e) => setCourseDraft(e.target.value)}
                onKeyDown={handleCourseKeyDown}
                onBlur={addCourse}
                placeholder="Type a course and press Enter — e.g. CS201"
              />
            </div>
          </label>

          <div className="course-reg-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? 'Registering…' : 'Register'}
            </button>
            <button type="button" className="course-reg-skip" onClick={() => navigate('/feed')}>
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}