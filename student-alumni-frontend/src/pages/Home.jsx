import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Background slider images — drop your files in /public/hero/...
  const slides = useMemo(
    () => ["/hero/slide1.jpg", "/hero/slide2.jpg", "/hero/slide3.jpg"],
    []
  );

  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 4500);
    return () => clearInterval(id);
  }, [slides.length]);

  // Login state
  const [role, setRole] = useState("student"); // 'student' | 'alumni'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const handleLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const res = await axios.post(`${BASE}/auth/login`, { email, password });
      let { user, token } = res.data;

      const userRole = user.userType || user.role;
      user = { ...user, role: userRole };

      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", userRole);

      // Update AuthContext
      login(user);

      // Redirect based on role
      if (userRole === "student") navigate("/student/dashboard");
      else if (userRole === "alumni") navigate("/alumni/dashboard");
      else navigate("/");
    } catch (err) {
      console.error("Login failed:", err.response?.data.message || err.message);
      setError(err.response?.data.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="home-root">
      {/* Background slider */}
      <div className="bg-slider">
        {slides.map((src, idx) => (
          <div
            key={src}
            className={`bg-slide ${idx === current ? "active" : ""}`}
            style={{ backgroundImage: `url(${src})` }}
            aria-hidden={idx !== current}
          />
        ))}
        <div className="bg-overlay" />
      </div>

      {/* Top bar */}
      <header className="topbar">
        <div className="brand">
          <span className="title">Student-Alumni Portal</span>
          <span className="subtitle">IIIT-Delhi</span>
        </div>
        <nav className="top-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </nav>
      </header>

      {/* Hero + Login */}
      <main className="hero-wrap">
        <section className="hero-copy">
          <h1>Connect. Collaborate. Grow.</h1>
          <p>
            A single place for students and alumni to chat in real-time,
            schedule meetings, and discover mentors & opportunities.
          </p>
          <div className="hero-cta">
            <a className="btn btn-outline" href="#features">
              Explore Features
            </a>
            <Link className="btn btn-solid" to="/register">
              Register
            </Link>
          </div>
        </section>

        <section className="login-container">
          <h2>Login</h2>
          <form onSubmit={handleLogin} noValidate>
            <label>I am a</label>
            <div className="segmented">
              <button
                type="button"
                className={role === "student" ? "seg active" : "seg"}
                onClick={() => setRole("student")}
              >
                Student
              </button>
              <button
                type="button"
                className={role === "alumni" ? "seg active" : "seg"}
                onClick={() => setRole("alumni")}
              >
                Alumni
              </button>
            </div>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            {error && <div className="error">{error}</div>}

            <button type="submit" disabled={busy}>
              {busy ? "Signing in..." : "Login"}
            </button>

            <div className="register-link">
              <p>
                New here?{" "}
                <Link to={`/register?role=${role}`}>Register First !</Link>
              </p>
            </div>
          </form>
        </section>
      </main>

      {/* Features */}
      <section id="features" className="features">
        <h2 className="sec-title">What you can do</h2>
        <div className="cards">
          <article className="card fade-up">
            <div className="icon i-chat" aria-hidden />
            <h4>Real-Time Chatting</h4>
            <p>
              Instantly message students and alumni with delivery & read status.
            </p>
            <Link className="link" to="/chat">
              Open Chat
            </Link>
          </article>
          <article className="card fade-up" style={{ animationDelay: "120ms" }}>
            <div className="icon i-meet" aria-hidden />
            <h4>Meetings</h4>
            <p>Publish slots, book sessions, and sync with your calendar.</p>
            <Link className="link" to="/meetings">
              Schedule a Meeting
            </Link>
          </article>
          <article className="card fade-up" style={{ animationDelay: "240ms" }}>
            <div className="icon i-list" aria-hidden />
            <h4>View Alumni Lists</h4>
            <p>Search alumni by name, company, field, location and batch.</p>
            <Link className="link" to="/alumni">
              Browse Alumni
            </Link>
          </article>
        </div>
      </section>

      {/* About / Footer */}
      <section id="about" className="about">
        <h2 className="sec-title">Made for the IIIT-Delhi community</h2>
        <p className="about-text">
          This portal bridges the gap between current students and alumni —
          enabling mentorship, collaboration, and career growth through modern,
          privacy-first tools.
        </p>
        <footer className="footer">
          © {new Date().getFullYear()} IIIT-Delhi • Student-Alumni Portal
        </footer>
      </section>
    </div>
  );
};

export default Home;
