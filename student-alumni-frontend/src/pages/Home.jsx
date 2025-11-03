import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./Home.css";
import Register from "./Register"; // import Register component
import Login from "./Login"; // import Login component

const Home = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

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

  // Toggle between Login/Register on Home
  const location = useLocation();

  // Toggle between Login/Register on Home. Default driven by URL so
  // /register shows the register form and /login shows login.
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (location.pathname === "/register") setShowRegister(true);
    else if (location.pathname === "/login") setShowRegister(false);
    // otherwise keep default (home may choose login by default)
  }, [location.pathname]);

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

      {/* Hero Section */}
      <main className="hero-wrap">
        <section className="hero-copy">
          <h1>Connect. Collaborate. Grow.</h1>
          <p>
            A single place for students and alumni to chat in real-time,
            schedule meetings, and discover mentors & opportunities.
          </p>
          {/* <div className="hero-cta">
            <button
              className="btn btn-outline"
              onClick={() => setShowRegister(false)}
            >
              Login
            </button>
            <button
              className="btn btn-outline"
              onClick={() => setShowRegister(false)}
            >
              Register
            </button>
          </div> */}
        </section>

        <section className="auth-section">
          {showRegister ? <Register /> : <Login />}
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
