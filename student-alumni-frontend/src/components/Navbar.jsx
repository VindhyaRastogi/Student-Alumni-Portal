import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
    <nav>
      <NavLink to={`/${role}/dashboard`}>Dashboard</NavLink>
      <NavLink to={`/${role}/profile`}>Your Profile</NavLink>
      {role === 'student' && <NavLink to="/student/alumni-list">Alumni List</NavLink>}
      <NavLink to={`/${role}/chats`}>Chats</NavLink>
      <NavLink to={`/${role}/meetings`}>Meetings</NavLink>
      <NavLink to={`/${role}/history`}>History</NavLink>
      <NavLink to={`/${role}/report`}>Report / Block</NavLink>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;
