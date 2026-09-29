import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CallProvider } from './context/CallContext';
import { PresenceProvider } from './context/PresenceContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import NavBar from './components/layout/NavBar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import Messages from './pages/Messages';
import ChatThread from './pages/ChatThread';
import People from './pages/People';
import Profile from './pages/Profile';
import RegisterCourses from './pages/RegisterCourses';

function Layout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const alwaysPublicPaths = ['/', '/login', '/signup'];
  const isAlwaysPublicPath = alwaysPublicPaths.includes(location.pathname);

  if (!user || isAlwaysPublicPath) {
    return <>{children}</>;
  }
  return (
    <PresenceProvider>
      <CallProvider>
        <NavBar />
        <main className="app-main">{children}</main>
      </CallProvider>
    </PresenceProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
          <Route path="/groups/:id" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/messages/:id" element={<ProtectedRoute><ChatThread /></ProtectedRoute>} />
          <Route path="/people" element={<ProtectedRoute><People /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/course-registration" element={<ProtectedRoute><RegisterCourses /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}