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
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAlumni(res.data);
        setFormData(res.data);
      } catch (err) {
        console.error('Error fetching alumni profile:', err);
        alert('Unable to load alumni profile');
      }
    };

    fetchAlumni();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/users/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlumni(res.data);
      setIsEditing(false);
      alert('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    }
  };

  if (!alumni) return <p className="loading-text">Loading...</p>;

  return (
    <div className="alumni-profile-card">
      <div className="profile-header">
        <img
          src={alumni.profilePicture || '/default-profile.png'}
          alt="Profile"
          className="profile-img"
        />
        <h2>{alumni.name}</h2>
        <p className="alumni-role">{alumni.role}</p>
      </div>

      <div className="profile-details">
        {[
          { label: 'Email', name: 'email' },
          { label: 'Degree', name: 'degree' },
          { label: 'Specialization', name: 'specialization' },
          { label: 'Batch', name: 'batch' },
          { label: 'Organization', name: 'organization' },
          { label: 'Role', name: 'workRole' },
          { label: 'City', name: 'city' },
          { label: 'State', name: 'state' },
          { label: 'Country', name: 'country' }
        ].map(({ label, name }) => (
          <div className="profile-field" key={name}>
            <strong>{label}:</strong>
            {isEditing ? (
              <input
                type="text"
                name={name}
                value={formData[name] || ''}
                onChange={handleChange}
              />
            ) : (
              <span>{alumni[name] || 'Not specified'}</span>
            )}
          </div>
        ))}
      </div>

      <div className="profile-actions">
        {isEditing ? (
          <>
            <button className="save-btn" onClick={handleSave}>Save</button>
            <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
          </>
        ) : (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
        )}
      </div>
    </div>
  );
};

export default AlumniProfile;
