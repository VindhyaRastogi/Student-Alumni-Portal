import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentDashboard from "./pages/StudentDashboard";
import AlumniDashboard from "./pages/AlumniDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";
import ForgotPassword from "./pages/ForgotPassword";
import StudentProfile from "./pages/StudentProfile";
import StudentProfileView from "./pages/StudentProfileView"; // ✅ NEW IMPORT
import AdminUsers from "./pages/AdminUsers";
import AlumniProfile from "./pages/AlumniProfile";
import AlumniProfileView from "./pages/AlumniProfileView";
import AlumniList from "./pages/AlumniList"; // ✅ NEW IMPORT
import AlumniPublicProfile from "./pages/AlumniPublicProfile"; // ✅ NEW IMPORT
import StudentList from "./pages/StudentList";
import StudentPublicProfile from "./pages/StudentPublicProfile";
const App = () => {
  const location = useLocation();

  // hide navbar on home and forgot password
  const hideNavbar =
    location.pathname === "/" || location.pathname === "/forgot-password";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* 🏠 Home page with integrated Login/Register */}
        <Route path="/" element={<Home />} />

        {/* 🔑 Forgot Password */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* 🎓 Student Dashboard */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* 👨‍🎓 Student Profile (View) */}
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentProfileView />
            </ProtectedRoute>
          }
        />

        {/* 🧑‍🎓 Alumni Profile (Edit) */}
        <Route
          path="/alumni/edit-profile"
          element={
            <ProtectedRoute allowedRoles={["alumni"]}>
              <AlumniProfile />
            </ProtectedRoute>
          }
        />

        {/* 👨‍🎓 Alumni Profile (View) */}
        <Route
          path="/alumni/view-profile"
          element={
            <ProtectedRoute allowedRoles={["alumni"]}>
              <AlumniProfileView />
            </ProtectedRoute>
          }
        />

        {/* ✏️ Student Profile (Edit) */}
        <Route
          path="/student/edit-profile"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/alumni"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <AlumniList />
            </ProtectedRoute>
          }
        />

        {/* Students list for alumni */}
        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={["alumni"]}>
              <StudentList />
            </ProtectedRoute>
          }
        />

        {/* Student-facing public profile route */}
        <Route
          path="/student/alumni/:id"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <AlumniPublicProfile />
            </ProtectedRoute>
          }
        />

        {/* Keep existing alumni/:id for other roles if needed (alumni/admin) */}
        <Route
          path="/alumni/:id"
          element={
            <ProtectedRoute>
              <AlumniPublicProfile />
            </ProtectedRoute>
          }
        />

        {/* Student profile for alumni to view */}
        <Route
          path="/student/:id"
          element={
            <ProtectedRoute allowedRoles={["alumni"]}>
              <StudentPublicProfile />
            </ProtectedRoute>
          }
        />

        {/* 🧑‍💼 Alumni Dashboard */}
        <Route
          path="/alumni/dashboard"
          element={
            <ProtectedRoute allowedRoles={["alumni"]}>
              <AlumniDashboard />
            </ProtectedRoute>
          }
        />

        {/* 🛠 Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 👥 Admin Users Management */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        {/* 🚧 Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
