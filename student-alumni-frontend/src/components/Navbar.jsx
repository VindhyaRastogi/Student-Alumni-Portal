import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null; // Don't show navbar if not logged in

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const role = user.userType || user.role;

  return (
    <div className="navbar">
      <div className="navbar-left">
        <Link to={role === 'student' ? '/student/dashboard' : '/alumni/dashboard'}>
          Dashboard
        </Link>

        <Link to={role === 'student' ? '/student/profile' : '/alumni/profile'}>
          Your Profile
        </Link>

        {role === 'student' && (
          <>
            <Link to="/student/alumni">Alumni List</Link>
            <Link to="/student/chats">Chats</Link>
            <Link to="/student/meetings">Meetings</Link>
            <Link to="/student/history">History</Link>
            <Link to="/student/report">Report / Block</Link>
          </>
        )}

        {role === 'alumni' && (
          <>
            <Link to="/alumni/slots">My Availability</Link>
            <Link to="/alumni/meetings">Meetings</Link>
            <Link to="/alumni/history">History</Link>
            <Link to="/alumni/report">Report / Block</Link>
          </>
        )}
      </div>

      <div className="navbar-right">
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Navbar;
