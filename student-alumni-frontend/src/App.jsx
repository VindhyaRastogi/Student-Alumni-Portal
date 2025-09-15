import { Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './admin/Dashboard';
import AlumniList from './pages/AlumniList';
import Meeting from './pages/Meeting';
import AlumniSlots from './pages/AlumniSlots';
import AdminUserList from './admin/AdminUserList';
import AlumniProfile from './pages/AlumniProfile';
import AlumniProfileView from './pages/AlumniProfileView';  
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import StudentDashboard from './pages/student/StudentDashboard';
import AlumniDashboard from './pages/alumni/AlumniDashboard';
import Navbar from './components/Navbar';
import StudentProfile from './pages/StudentProfile';
import StudentProfileView from './pages/StudentProfileView';
import AlumniPublicProfile from "./pages/AlumniPublicProfile";

const App = () => {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/" || location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>}
        />
        <Route
          path="/student/profile"
          element={<ProtectedRoute><StudentProfileView /></ProtectedRoute>}
        />
        <Route
          path="/student/edit-profile"
          element={<ProtectedRoute><StudentProfile /></ProtectedRoute>}
        />
        <Route
          path="/student/alumni"
          element={<ProtectedRoute><AlumniList /></ProtectedRoute>}
        />
        <Route
          path="/student/meetings"
          element={<ProtectedRoute><Meeting /></ProtectedRoute>}
        />

        {/* Alumni Routes */}
        <Route
          path="/alumni/dashboard"
          element={<ProtectedRoute><AlumniDashboard /></ProtectedRoute>}
        />
        <Route
          path="/alumni/view-profile"
          element={<ProtectedRoute><AlumniProfileView /></ProtectedRoute>}
        />
        <Route
          path="/alumni/edit-profile"
          element={<ProtectedRoute><AlumniProfile /></ProtectedRoute>}
        />
        <Route
          path="/alumni/meetings"
          element={<ProtectedRoute><Meeting /></ProtectedRoute>}
        />
        <Route
          path="/alumni/slots"
          element={<ProtectedRoute><AlumniSlots /></ProtectedRoute>}
        />

        {/* Admin Routes */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/admin/users"
          element={<ProtectedAdminRoute><AdminUserList /></ProtectedAdminRoute>}
        />

        {/* Public Alumni Profile (from alumni list) */}
        <Route
          path="/alumni/:id"
          element={<ProtectedRoute><AlumniPublicProfile /></ProtectedRoute>}
        />

        <Route
          path="/meeting"
          element={<ProtectedRoute><Meeting /></ProtectedRoute>}
        />
      </Routes>
    </>
  );
};

export default App;
