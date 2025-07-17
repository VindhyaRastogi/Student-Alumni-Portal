import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css'; // ✅ import the CSS

const Navbar = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  if (!role) return null;

  return (
    <div className="navbar">
      <div className="navbar-left">
        <Link to={role === 'student' ? '/student/dashboard' : '/alumni/dashboard'}>Dashboard</Link>

        <Link to={role === 'student' ? '/student/profile' : '/alumni/profile'}>Your Profile</Link>

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
