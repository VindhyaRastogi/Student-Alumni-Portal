import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        email,
        password
      });

      const { user, token } = res.data;

      // Save token and role in localStorage or context
      login(res.data); // Assuming your context handles token/user
      localStorage.setItem('role', user.role); // optional for Navbar access

      // Redirect based on role
      if (user.role === 'student') {
  navigate('/student/profile');
} else if (user.role === 'alumni') {
  navigate('/alumni/profile/' + user._id);
} else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login failed:', err.response?.data.message || err.message);
alert(err.response?.data.message || 'Login failed');

    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      <div className="register-link">
      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
    </div>
  );
};

export default Login;
