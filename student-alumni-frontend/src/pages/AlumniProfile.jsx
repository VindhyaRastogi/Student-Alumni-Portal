import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './AlumniProfile.css';

const AlumniProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const token = user?.token;

  const [alumni, setAlumni] = useState(null);

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAlumni(res.data);
      } catch (err) {
        console.error('Error fetching alumni profile:', err);
        alert('Unable to load alumni profile');
      }
    };

    fetchAlumni();
  }, [id]);

  if (!alumni) return <p style={{ padding: '2rem' }}>Loading...</p>;

  return (
    <div className="alumni-profile">
      <h2>{alumni.name}'s Profile</h2>
      <div className="alumni-details">
        {/* Profile Picture */}
        {alumni.profilePicture && (
          <img
            src={alumni.profilePicture}
            alt={`${alumni.name}'s profile`}
            className="profile-picture"
          />
        )}

        {/* Email */}
        <p><strong>Email:</strong> {alumni.email}</p>

        {/* Degree, Specialization, Batch */}
        <p><strong>Degree:</strong> {alumni.degree}</p>
        <p><strong>Specialization:</strong> {alumni.specialization}</p>
        <p><strong>Batch:</strong> {alumni.batch}</p>

        {/* Work Section */}
        <p><strong>Organization:</strong> {alumni.organization || 'Not specified'}</p>
        <p><strong>Role:</strong> {alumni.workRole || 'Not specified'}</p>

        {/* Location Section */}
        <p><strong>City:</strong> {alumni.city}</p>
        <p><strong>State:</strong> {alumni.state}</p>
        <p><strong>Country:</strong> {alumni.country}</p>

        {/* Optional */}
        <p><strong>Role (System):</strong> {alumni.role}</p>
      </div>
    </div>
  );
};

export default AlumniProfile;
