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
    company: ''
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
      alert('Error fetching alumni');
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAlumni();
  };

  const handleMeetingRequest = (alumniId) => {
    navigate(`/meetings?alumniId=${alumniId}`);
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
        <button type="submit">Filter</button>
      </form>

      {alumni.length === 0 ? (
        <p>No alumni found</p>
      ) : (
        <div className="alumni-list">
          {alumni.map((a) => (
            <div className="alumni-card" key={a._id}>
              {/* Profile Picture */}
              {a.profilePicture && (
                <img
                  src={a.profilePicture}
                  alt={`${a.name} profile`}
                  className="alumni-profile-pic"
                  style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem' }}
                />
              )}

              <h3>{a.name}</h3>
              <p><strong>Email:</strong> {a.email}</p>
              <p><strong>Degree:</strong> {a.degree || 'N/A'}</p>
              <p><strong>Specialization:</strong> {a.specialization || 'N/A'}</p>
              <p><strong>Batch:</strong> {a.batch || 'N/A'}</p>
              <p><strong>Organization:</strong> {a.organization || 'N/A'}</p>
              <p><strong>Work Role:</strong> {a.workRole || 'N/A'}</p>
              <p><strong>Location:</strong> {`${a.city || ''}${a.city && a.state ? ', ' : ''}${a.state || ''}${(a.city || a.state) && a.country ? ', ' : ''}${a.country || ''}` || 'N/A'}</p>
              <p><strong>Bio:</strong> {a.bio || 'N/A'}</p>
              <p><strong>Job Title:</strong> {a.jobTitle || 'N/A'}</p>
              <p><strong>Company:</strong> {a.company || 'N/A'}</p>

              <div className="alumni-actions">
                <button onClick={() => handleMeetingRequest(a._id)}>
                  Request Meeting
                </button>
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
