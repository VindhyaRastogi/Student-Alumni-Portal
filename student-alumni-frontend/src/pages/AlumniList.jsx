import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./AlumniList.css";

const AlumniList = () => {
  const [filters, setFilters] = useState({
    name: "",
    company: "",
    jobTitle: "",
    location: "",
    areasOfInterest: "",
  });
  const [alumni, setAlumni] = useState([]);

  const fetchAlumni = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/alumni`, // ✅ updated API
        {
          headers: { Authorization: `Bearer ${token}` },
          params: filters,
        }
      );
      setAlumni(res.data);
    } catch (err) {
      console.error("Error fetching alumni:", err);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAlumni();
  };

  return (
    <div className="alumni-list-container">
      <h2>Explore Alumni</h2>

      {/* Filter Form */}
      <form onSubmit={handleSearch} className="filter-form">
        <input name="name" placeholder="Name" onChange={handleChange} />
        <input
          name="company"
          placeholder="Company / Organization"
          onChange={handleChange}
        />
        <input name="jobTitle" placeholder="Position" onChange={handleChange} />
        <input name="location" placeholder="Location" onChange={handleChange} />
        <input
          name="areasOfInterest"
          placeholder="Area Of Interest"
          onChange={handleChange}
        />
        {/* <select name="areasOfInterest" onChange={handleChange}>
          <option value="">All Interests</option>
          <option value="AI/ML">AI/ML</option>
          <option value="Data Science">Data Science</option>
          <option value="Cybersecurity">Cybersecurity</option>
          <option value="Software Development">Software Development</option>
          <option value="Entrepreneurship">Entrepreneurship</option>
        </select> */}
        <button type="submit">Search</button>
      </form>

      {/* Alumni Cards */}
      <div className="alumni-cards">
        {alumni.map((a) => {
          const apiBase = import.meta.env.VITE_API_BASE_URL || "";
          const apiRoot = apiBase.replace(/\/api\/?$/i, "");
          const imgSrc = a.profilePicture
            ? `${apiRoot}/uploads/${a.profilePicture}`
            : "/default-avatar.png";

          return (
            <div className="alumni-card" key={a._id}>
              <div className="alumni-card-top">
                <img src={imgSrc} alt={a.fullName} />
                {/* chat icon - routes to chat with this alumni */}
                <Link to={`/chats/${a._id}`} className="chat-icon" aria-label={`Chat with ${a.fullName}`}>💬</Link>
              </div>

              <h3>{a.fullName}</h3>
              <p>{a.jobTitle} @ {a.company}</p>
              <p>{a.location?.city}, {a.location?.country}</p>
              <p><strong>Interests:</strong> {a.areasOfInterest}</p>

              <div className="alumni-card-actions">
                <Link to={`/student/alumni/${a._id}`} className="btn btn-primary">View Profile</Link>
                {/* Request Meeting navigates to the student-facing meeting request page we added */}
                <Link to={`/student/alumni/${a._id}/request`} className="btn btn-secondary">Request Meeting</Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlumniList;
