// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null; // hide navbar when not logged in

  const handleLogout = () => {
    logout(); // context logout handles localStorage
    navigate("/"); // go to home/login
  };

  const role = user.userType || user.role;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link
          to={
            role === "admin"
              ? "/admin/dashboard"
              : role === "student"
              ? "/student/dashboard"
              : "/alumni/dashboard"
          }
        >
          Student-Alumni Portal
        </Link>
      </div>

      <div className="navbar-links">
        {/* Common link: Dashboard */}
        <Link
          to={
            role === "admin"
              ? "/admin/dashboard"
              : role === "student"
              ? "/student/dashboard"
              : "/alumni/dashboard"
          }
        >
          Dashboard
        </Link>

        {/* Profile */}
        {role === "admin" && <Link to="/admin/profile">Admin Profile</Link>}
        {role === "student" && <Link to="/student/profile">Your Profile</Link>}
        {role === "alumni" && (
          <Link to="/alumni/view-profile">Your Profile</Link>
        )}

        {/* Student links */}
        {role === "student" && (
          <>
            <Link to="/student/alumni">Alumni List</Link>
            <Link to="/student/chats">Chats</Link>
            <Link to="/student/meetings">Meetings</Link>

            {/* <Link to="/student/history">History</Link>
            <Link to="/student/report">Report / Block</Link> */}
          </>
        )}

        {/* Alumni links */}
        {role === "alumni" && (
          <>
            <Link to="/alumni/slots">My Availability</Link>
            <Link to="/alumni/meetings">Meetings</Link>
            <Link to="/alumni/chats">Chats</Link>
            {/* Alumni-only link to view students list */}
            <Link to="/students">Student List</Link>
            {/* <Link to="/alumni/history">History</Link>
            <Link to="/alumni/report">Report / Block</Link> */}
          </>
        )}

        {/* Admin links */}
        {role === "admin" && (
          <>
            <Link to="/admin/users">Manage Users</Link>
            <Link to="/admin/reports">Reports</Link>
            <Link to="/admin/settings">Settings</Link>
          </>
        )}
      </div>

      <div className="navbar-right">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
