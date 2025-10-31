// src/pages/Login.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // 👈 import context
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const API = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { login } = useAuth(); // 👈

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ Validate IIITD email domain
    const emailPattern = /^[a-zA-Z0-9._%+-]+@iiitd\.ac\.in$/;
    if (!emailPattern.test(formData.email)) {
      setError("Please use your official IIIT-D email ID only");
      return;
    }

    try {
      const res = await axios.post(`${API}/auth/login`, formData);
      login(res.data.user, res.data.token);

      const role = res.data.user.role;
      if (role === "student") navigate("/student/dashboard");
      else if (role === "alumni") navigate("/alumni/dashboard");
      else if (role === "admin") navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">
            Email <small>(Use college email id only)</small>
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter your college email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Login</button>

        <p className="forgot-password">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
      </form>

      <p className="register-link">
        New here? <Link to="/register">Register First!</Link>
      </p>
    </div>
  );
};

export default Login;
