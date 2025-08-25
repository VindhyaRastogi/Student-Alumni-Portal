import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'student', // ✅ Changed from role → userType
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/register`,
        formData
      );
      const { user, token } = res.data;

      console.log('Registration Success:', user);

      // ✅ Save user to AuthContext and localStorage
      login(user);
      localStorage.setItem('token', token);
      localStorage.setItem('userType', user.userType); // ✅ Changed to userType

      alert('Registration successful!');

      // ✅ Redirect based on userType
      if (user.userType === 'student') {
        navigate('/student/dashboard/');
      } else if (user.userType === 'alumni') {
        navigate('/alumni/dashboard/');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Registration Error:', err.response?.data || err.message);
      alert('Registration failed. Try a different email or check your input.');
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <select
          name="userType" // ✅ Changed from role → userType
          value={formData.userType}
          onChange={handleChange}
          required
        >
          <option value="">Select Role</option>
          <option value="student">Student</option>
          <option value="alumni">Alumni</option>
        </select>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
