import { Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/HomePage';
import Dashboard from './admin/Dashboard';
import Profile from './pages/Profile';
import AlumniList from './pages/AlumniList';
import Meeting from './pages/Meeting';
import AdminUserList from './admin/AdminUserList';
import AlumniProfile from './pages/AlumniProfile';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import StudentDashboard from './pages/student/StudentDashboard';
import AlumniDashboard from './pages/alumni/AlumniDashboard';
import Navbar from './components/Navbar';
import StudentProfile from './pages/StudentProfile'; 

const App = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === '/' || location.pathname === '/register';

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/alumni/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />

        <Route path="/student/alumni-list" element={<ProtectedRoute><AlumniList /></ProtectedRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/alumni/:id" element={<ProtectedRoute><AlumniProfile /></ProtectedRoute>} />
        <Route path="/student/meetings" element={<ProtectedRoute><Meeting /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedAdminRoute><AdminUserList /></ProtectedAdminRoute>} />

        {/* Role-based Dashboards */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/alumni/dashboard" element={<AlumniDashboard />} />
      </Routes>
    </>
  );
};

export default App;
