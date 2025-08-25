import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
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

      let { user, token } = res.data;

      // ✅ Make sure we always use `userType` from backend instead of `role`
      const role = user.userType || user.role;
      user = { ...user, role };

      // ✅ Save token and user in localStorage for later API requests
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', role);

      // ✅ Update AuthContext
      login(user);

      // ✅ Redirect based on role
      if (role === 'student') {
        navigate('/student/dashboard/');
      } else if (role === 'alumni') {
        navigate('/alumni/dashboard/');
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
