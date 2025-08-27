// src/pages/AlumniList.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './AlumniList.css';

const AlumniList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = user?.token;

  const [alumni, setAlumni] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    jobTitle: '',
    company: '',
    areasOfInterest: ''   // ✅ new filter
  });

  const fetchAlumni = async () => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/users/alumni?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setAlumni(res.data);
    } catch (err) {
      console.error(err);
      alert('Error fetching alumni');
    }
  };

  useEffect(() => {
  const fetchAlumni = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/alumni");
      const data = await res.json();
      setAlumni(data);
    } catch (err) {
      console.error("Error fetching alumni list:", err);
    }
  };
  fetchAlumni();
}, []);


  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAlumni();
  };

  return (
    <div className="alumni-container">
      <h2>Find Alumni Mentors</h2>

      <form onSubmit={handleSubmit} className="filter-form">
        <input
          type="text"
          name="name"
          placeholder="Search by Name"
          value={filters.name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="jobTitle"
          placeholder="Search by Job Title"
          value={filters.jobTitle}
          onChange={handleChange}
        />
        <input
          type="text"
          name="company"
          placeholder="Search by Company"
          value={filters.company}
          onChange={handleChange}
        />

        {/* ✅ New Area of Interest filter */}
        <select
          name="areasOfInterest"
          value={filters.areasOfInterest}
          onChange={handleChange}
        >
          <option value="">Filter by Area of Interest</option>
          <option value="AI/ML">AI/ML</option>
          <option value="Data Science">Data Science</option>
          <option value="Cybersecurity">Cybersecurity</option>
          <option value="Software Development">Software Development</option>
          <option value="Entrepreneurship">Entrepreneurship</option>
        </select>

        <button type="submit">Filter</button>
      </form>

      {alumni.length === 0 ? (
        <p>No alumni found</p>
      ) : (
        <div className="alumni-list">
          {alumni.map((a) => (
            <div className="alumni-card" key={a._id}>
              {/* ✅ Only Name + Profile Picture */}
              <img
                src={
                  a.profilePicture
                    ? `${import.meta.env.VITE_API_BASE_URL}/${a.profilePicture}`
                    : '/default-avatar.png'
                }
                alt={`${a.fullName} profile`}
                className="alumni-profile-pic"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginBottom: '1rem',
                }}
              />
              <h3>{a.fullName}</h3>

              {/* View Profile Button */}
              <div className="alumni-actions">
                <Link to={`/alumni/${a._id}`} className="view-link">
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlumniList;
